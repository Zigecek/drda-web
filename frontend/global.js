var username = null;
var socket = io.connect("https://cykablyat.cz");
var el = document.getElementById("loginBtn");
socket.on("connect", () => {
  if (document.cookie) {
    socket.on("tokenVer", (usrnm) => {
      if (usrnm) {
        username = usrnm;
        el.innerHTML = `<p><span><a href="/ucet">${usrnm}</a></span> <span><a href="/odhlaseni">Odhlásit</a></span></p>`;
      } else {
        deleteAllCookies();
        el.innerHTML = `<a href="/prihlaseni">Přihlásit</a>`;
      }
    });
    socket.emit("verify", document.cookie.slice(13));
    socket.emit("getMessages");
  } else {
    el.innerHTML = `<a href="/prihlaseni">Přihlásit</a>`;
  }
});

const deleteAllCookies = () => {
  const cookies = document.cookie.split(";");
  for (const cookie of cookies) {
    const eqPos = cookie.indexOf("=");
    const name = eqPos > -1 ? cookie.substring(0, eqPos) : cookie;
    document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT";
  }
};

var loadtime = Date.now();

const cas = () => {
  let newTime = new Date();
  let dif = new Date(newTime.getTime() - loadtime);
  document.getElementById("cas").innerText = dif.toLocaleTimeString("cs-CZ", {
    timeZone: "UTC",
  });
  document.getElementById("cas2").innerText = newTime.toLocaleTimeString(
    "cs-CZ",
    { timeZone: "Europe/Prague" }
  );
};
cas();
setInterval(cas, 1000);
