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

const User = require("./models/User");
const Message = require("./models/Message");
const port = process.env.PORT || 80;
console.log("PORT: " + port);

const unless = function (middleware, ...paths) {
  return function (req, res, next) {
    const pathCheck = paths.some((path) => path === req.path);
    pathCheck ? next() : middleware(req, res, next);
  };
};

const app = express();

app.use(serveStatic("./frontend/"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

const httpServer = createServer(app);
httpServer.listen(port);

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
    socket.emit("load", messages);
  }

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

  socket.on("getUsername", async (token) => {
    var decoded;
    try {
      decoded = jwt.verify(token, process.env.TOKEN_KEY);
    } catch (error) {}

    const user = await User.findOne({ email: decoded.email });
    if (!user) return;

    socket.emit("username", user.username);
  });
});

app.post("/reg", async (req, res) => {
  // Our register logic starts here
  try {
    const { username, email, password } = req.body;

    // Validate user input
    if (!(email && password && username)) {
      res.status(400).send("All input is required");
    }

    // check if user already exist
    // Validate if user exist in our database
    const oldUser = await User.findOne({ email });

    if (oldUser) {
      return res.status(409).send("User Already Exist. Please Login");
    }

    //Encrypt user password
    encryptedPassword = await bcrypt.hash(password, 10);

    const token = jwt.sign({ username, email }, process.env.TOKEN_KEY, {
      expiresIn: "24h",
    });
    // Create user in our database
    const color = "#" + ((Math.random() * 0xffffff) << 0).toString(16);
    const user = await User.create({
      _id: new require("mongoose").Types.ObjectId(),
      username,
      email: email.toLowerCase(), // sanitize: convert email to lowercase
      password: encryptedPassword,
      token,
      color,
    });

    // save user token
    user.token = token;
    res.cookie("access_token", token, {
      httpOnly: false,
      secure: true,
      sameSite: "none",
    });

    // return new user
    return res.redirect("/");
  } catch (err) {
    console.log(err);
  }
  // Our register logic ends here
});

app.post("/log", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!(email && password)) {
      res.status(400).send("All input is required");
    }

    const user = await User.findOne({ email });

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
