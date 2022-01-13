const mongoose = require("mongoose");

const messageSchema = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  author: {
    username: String,
    color: String,
  },
  content: String,
  posted: Number,
});

module.exports = mongoose.model("Message", messageSchema, "messages");
