// NEHODNOTIT //
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
//\ NEHODNOTIT //
// prosím nehodnotit, udělal jsem funkční přihlašování, to nebylo v zadání



// prezentace obrázků
var urls = [
  "https://www.esports.net/wp-content/uploads/2022/01/Operation-Riptide-CSGO.jpg",
  "https://cdn.akamai.steamstatic.com/steamcommunity/public/images/clans/3381077/0c12ffa19211c716abafc127f20b018e90c1fd0e.png",
  "https://cdn.akamai.steamstatic.com/steamcommunity/public/images/clans/3381077/efc856439818e8a976e426f8588d895f4cb743f6.png",
];
var index = 1;
setInterval(() => {
  var obrazek = document.getElementById("prezentaceObrazek");
  obrazek.src = urls[index];

  if (index == 2) {
    index = 0;
  } else {
    index++;
  }
}, 3000);

// tabulka se záhlavím
var tabulka = document.createElement("table");
tabulka.border = "1";
tabulka.cellSpacing = "0";
tabulka.id = "nikdonic";
var trs = [
  ["th", "Jméno", "Přijímení", "Práce"],
  ["td", "Honza", "Kozohorský", "CSS, JavaScript"],
  ["td", "Václav", "Drda", "HTML, CSS"],
];
trs.forEach((row) => {
  var tr = document.createElement("tr");
  var type = row.shift();
  row.forEach((data) => {
    var tdata = document.createElement(type);
    tdata.innerText = data;
    tr.appendChild(tdata);
  });
  tabulka.appendChild(tr);
});
document.getElementById("generovanaTabulka").appendChild(tabulka);
