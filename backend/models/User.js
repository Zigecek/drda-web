const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  username: String,
  email: String,
  password: String,
  token: String,
  color: String,
});

module.exports = mongoose.model("User", userSchema, "users");
