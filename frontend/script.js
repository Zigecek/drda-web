var socket = io.connect("https://cykablyat.cz");

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
    (document.getElementById("datum").innerText = new Date().toLocaleString(
      "cs-CZ",
      { timeZone: "CET" }
    )),
  999
);

var el = document.getElementById("loginBtn");
if (document.cookie) {
  document.getElementById("zprava").removeAttribute("disabled");
  document.getElementById("poslat").removeAttribute("disabled");
  socket.on("username", (username) => {
    el.innerHTML = `<p>${username} <span><a href="/odhlaseni">Odhlásit</a></span></p>`;
  });
  socket.emit("getUsername", document.cookie.slice(13));
} else {
  el.innerHTML = `<a  href="/prihlaseni">Přihlásit</a>`;
}
