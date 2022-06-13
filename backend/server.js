require("dotenv").config();
require("./utils/mongoose").init();

const express = require("express");
const { createServer } = require("http");
var serveStatic = require("serve-static");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const socketIo = require("socket.io");
const nodemailer = require("nodemailer");

const User = require("./models/User");
const Message = require("./models/Message");
const port = process.env.PORT || 3645;
console.log("PORT: " + port);

const unless = function (middleware, ...paths) {
  return function (req, res, next) {
    const pathCheck = paths.some((path) => path === req.path);
    pathCheck ? next() : middleware(req, res, next);
  };
};

const app = express();

const httpServer = createServer(app);
httpServer.listen(port);

app.use(serveStatic("./frontend/"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

let transporter = nodemailer.createTransport({
  host: "smtp.seznam.cz",
  port: 465,
  secure: true,
  auth: {
    user: process.env.SEZNAM_EMAIL,
    pass: process.env.SEZNAM_PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

transporter.verify(function (error, success) {
  if (error) {
    console.log(error);
  } else {
    console.log("Server is ready to take our messages");
  }
});

const io = socketIo(httpServer, {
  cors: {
    origin: [
      "https://cykablyat.cz",
      "https://drda-web.herokuapp.com",
      "http://localhost",
    ],
    methods: ["GET", "POST"],
  },
});

io.on("connection", async (socket) => {
  socket.on("getMessages", async () => {
    var messages = await Message.find({});
    if (messages.length > 0) {
      messages.sort((a, b) => {
        if (a.posted > b.posted) {
          return 1;
        } else if (a == b) {
          return 0;
        } else {
          return -1;
        }
      });
      socket.emit("messages", messages);
    }
  });

  socket.on("send", async (msg) => {
    var decoded;
    try {
      decoded = jwt.verify(msg.token, process.env.TOKEN_KEY);
    } catch (error) {}

    const user = await User.findOne({ email: decoded.email });
    if (!user) return;

    const message = await Message.create({
      _id: new require("mongoose").Types.ObjectId(),
      author: {
        username: user.username,
        color: user.color,
      },
      content: msg.content,
      posted: Date.now(),
    });

    io.sockets.emit("new", message);
  });

  socket.on("verify", async (token) => {
    var decoded;
    try {
      decoded = jwt.verify(token, process.env.TOKEN_KEY);
    } catch (error) {
      return socket.emit("tokenVer", false);
    }

    const user = await User.findOne({ email: decoded.email });
    if (!user) return socket.emit("tokenVer", false);

    socket.emit("tokenVer", user.username);
  });
});

app.post("/reg", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!(email && password && username)) {
      res.status(400).send("Musíte vyplnit všechny políčka");
    }

    const oldUser = await User.findOne({ email });

    if (oldUser) {
      return res.status(409).send("Uživatel už existuje. Přihlaš se.");
    }

    encryptedPassword = await bcrypt.hash(password, 10);

    const color = "#" + ((Math.random() * 0xffffff) << 0).toString(16);
    const token = jwt.sign(
      {
        username,
        email: email.toLowerCase(),
      },
      process.env.TOKEN_KEY,
      {
        expiresIn: "24h",
      }
    );
    const user = await User.create({
      _id: new require("mongoose").Types.ObjectId(),
      email: email.toLowerCase(),
      password: encryptedPassword,
      registered: Date.now(),
      verified: {
        is: false,
        time: null,
      },
      username,
      token,
      color,
    });
    const verToken = jwt.sign(
      {
        id: user._id,
      },
      process.env.VERTOKEN_KEY,
      {
        expiresIn: "2h",
      }
    );

    transporter.sendMail(
      {
        from: "registrace@cykablyat.cz",
        to: [email.toLowerCase()],
        subject: "Registrace",
        html: `<h1>Ověření emailu</h1><a href="${
          req.hostname == "localhost" ? "http" : "https"
        }://${
          req.hostname
        }/ver?token=${verToken}">Ověřit</a><p>Pokud jste se neregistrovali na www.cykablyat.cz, na nic neklikejte.</p>`,
      },
      (err, info) => {
        if (err) {
          console.error(err);
          return;
        }
        console.log(info);
      }
    );

    return res
      .status(200)
      .send(
        'Ověř emailovou adresu kliknutím na odkaz v právě zaslaném emailu. \nEmail se může nacházet ve složce "Spam"'
      );
  } catch (err) {
    console.log(err);
  }
});

app.get("/ver", async (req, res) => {
  var verToken = req.query.token;
  try {
    const decoded = jwt.verify(verToken, process.env.VERTOKEN_KEY);
    const user = await User.findOneAndUpdate(
      { _id: decoded.id },
      { verified: { is: true, when: Date.now() } }
    );
    return res.status(200).redirect("/prihlaseni?overeno=ano");
  } catch (err) {
    return res.status(401).send("Invalid Token");
  }
});

app.post("/log", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!(email && password)) {
      res.status(400).send("Vyplňte všechna políčka.");
    }

    const user = await User.findOne({ email });
 
    if (!user) return res.status(404).send("Uživatel nenalezen.");

    if (!user.verified.is) {
      res.status(410).send("Email ještě nebyl ověřen.");
    }

    if (user && (await bcrypt.compare(password, user.password))) {
      const token = jwt.sign(
        { username: user.username, email },
        process.env.TOKEN_KEY,
        {
          expiresIn: "24h",
        }
      );

      await User.findOneAndUpdate({ email }, { token });

      res.cookie("access_token", token, {
        httpOnly: false,
        secure: true,
        sameSite: "none",
      });

      return res.redirect("/");
    }
    res.status(400).send("Invalid Credentials");
  } catch (err) {
    console.log(err);
  }
});

app.get("/odhlaseni", require("./utils/auth"), (req, res) => {
  res.clearCookie("access_token");
  res.redirect("/");
});
