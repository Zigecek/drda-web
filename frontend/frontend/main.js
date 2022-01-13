function createMsgEl(chat, msg) {
  chat.innerHTML =
    chat.innerHTML +
    `\n<p class="message ${
      username == msg.author.username ? "msg-me" : "msg-other"
    }"><span class="author" style="color: ${msg.author.color}">${
      msg.author.username
    }: </span>${msg.content}</p>`;
}

document.getElementById("sendForm").addEventListener("submit", function (e) {
  e.preventDefault();

  socket.emit("send", {
    token: document.cookie.slice(13),
    content: document.getElementById("zprava").value,
  });
  document.getElementById("zprava").value = "";
});

socket.on("messages", (messages) => {
  var chat = document.getElementById("chat");
  chat.innerHTML = "";
  messages.forEach((msg) => {
    createMsgEl(chat, msg);
  });
});
socket.on("new", (msg) => {
  var chat = document.getElementById("chat");
  createMsgEl(chat, msg);
});

if (document.cookie) {
  document.getElementById("zprava").removeAttribute("disabled");
  document.getElementById("poslat").removeAttribute("disabled");
}
