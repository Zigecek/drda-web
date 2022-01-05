var socket = io.connect("http://localhost");

if (document.cookie) {
  document.getElementById("zprava").removeAttribute("disabled");
  document.getElementById("poslat").removeAttribute("disabled");
}

function createMsgEl(chat, msg) {
  chat.innerHTML =
    chat.innerHTML +
    `\n<p class="message"><span class="author" style="color: ${msg.author.color}">${msg.author.username}: </span> ${msg.content}</p>`;
}

document.getElementById("sendForm").addEventListener("submit", function (e) {
  e.preventDefault();

  socket.emit("send", {
    token: document.cookie.slice(13),
    content: document.getElementById("zprava").value,
  });
  document.getElementById("zprava").value = "";
});

socket.on("connect", () => {
  socket.on("load", (messages) => {
    console.log("loaded");
    var chat = document.getElementById("chat");
    messages.forEach((msg) => {
      createMsgEl(chat, msg);
    });
  });
  socket.on("new", (msg) => {
    var chat = document.getElementById("chat");
    createMsgEl(chat, msg);
  });
});

setInterval(
  () =>
    (document.getElementById("datum").innerHTML = new Date().toLocaleString(
      "cs-CZ",
      { timeZone: "CET" }
    )),
  999
);
