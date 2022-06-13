// NEHODNOTIT //
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
  } else {
    el.innerHTML = `<a href="/prihlaseni">Přihlásit</a>`;
  }
  socket.emit("getMessages");
});

const deleteAllCookies = () => {
  const cookies = document.cookie.split(";");
  for (const cookie of cookies) {
    const eqPos = cookie.indexOf("=");
    const name = eqPos > -1 ? cookie.substring(0, eqPos) : cookie;
    document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT";
  }
};
//\ NEHODNOTIT //
// prosím nehodnotit, udělal jsem funkční přihlašování, to nebylo v zadání



// čas - stopky, aktuální
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

// nejlepší animace pod sluncem
var cisloKrizku = 0;
var parent = document.getElementById("fullScreenAnimace");
setInterval(() => {
  //parent.innerHTML += `<div id="y${cisloKrizku}"> <img src="krizek.png" id="x${cisloKrizku}" class="krizek" /></div>`;
  var y = document.createElement("div");
  var x = document.createElement("img");
  y.id = "y" + cisloKrizku;
  x.id = "x" + cisloKrizku;
  x.src = "/krizek.png";
  x.className = "krizek";
  y.appendChild(x);
  parent.appendChild(y);

  y.animate([{}, { transform: "translateY(calc(100vh - 30px))" }], {
    duration: getRandomInt(3000, 7000),
    direction: "alternate",
    iterations: Infinity,
  });
  x.animate([{}, { transform: "translateX(calc(100vw - 30px - 7px))" }], {
    duration: getRandomInt(7000, 10000),
    direction: "alternate",
    iterations: Infinity,
  });

  cisloKrizku++;
}, 4000);

// z internetu
function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
