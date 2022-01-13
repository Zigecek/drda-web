const nodemailer = require("nodemailer");

let transporter = nodemailer.createTransport({
  host: "smtp.seznam.cz",
  port: 465,
  secure: true,
  auth: {
    user: process.env.SEZNAM_EMAIL,
    pass: process.env.SEZNAM_PASS,
  },
});

transporter.sendMail(
  {
    from: "registrace@cykablyat.cz",
    to: ["honza007cz@hotmail.com"],
    subject: "Registrace",
    text: "test",
  },
  (err, info) => {
    if (err) {
      console.error(err);
      return;
    }
    console.log(info);
  }
);
