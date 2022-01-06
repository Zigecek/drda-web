var username = null;
var socket = io.connect("https://cykablyat.cz");
var el = document.getElementById("loginBtn");
socket.on("connect", () => {
  if (document.cookie) {
    socket.on("tokenVer", (usrnm) => {
      if (usrnm) {
        username = usrnm;
        socket.emit("getMessages");
        el.innerHTML = `<p><span><a href="/ucet">${usrnm}</a></span> <span><a href="/odhlaseni">Odhlásit</a></span></p>`;
      } else {
        document.cookie = null;
        el.innerHTML = `<a href="/prihlaseni">Přihlásit</a>`;
      }
    });
    socket.emit("verify", document.cookie.slice(13));
  } else {
    el.innerHTML = `<a href="/prihlaseni">Přihlásit</a>`;
  }
});

setInterval(
  () =>
    (document.getElementById("datum").innerText = new Date().toLocaleString(
      "cs-CZ",
      { timeZone: "CET" }
    )),
  999
);
