function time() {
  document.getElementById("datum").innerText = new Date().toLocaleString(
    "cs-CZ",
    { timeZone: "CET" }
  );
}

time();
setInterval(time, 999);

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
        deleteAllCookies();
        el.innerHTML = `<a href="/prihlaseni">Přihlásit</a>`;
      }
    });
    socket.emit("verify", document.cookie.slice(13));
  } else {
    el.innerHTML = `<a href="/prihlaseni">Přihlásit</a>`;
  }
});

const deleteAllCookies = () => {
  const cookies = document.cookie.split(";");
  for (const cookie of cookies) {
    const eqPos = cookie.indexOf("=");
    const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
    document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT";
  }
};
