var queryDict = {};
location.search
  .substr(1)
  .split("&")
  .forEach(function (item) {
    queryDict[item.split("=")[0]] = item.split("=")[1];
  });
console.log(queryDict);
if (queryDict.overeno) {
  var el = document.getElementById("main");
  var newline = `<h2 style="color: green;">Tvůj účet byl ověřen, můžeš se přihlásit!</h2>`;
  el.innerHTML = newline + el.innerHTML;
}
