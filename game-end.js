import "./style.css";
import "./game-end.css";
const params = new URLSearchParams(window.location.search);
const arenaId = params.get('arenaId');
const loserId = params.get('loser');
const myId = params.get('me');
if (!arenaId || !loserId || !myId) {
  console.warn("Invalid Params");
  window.location.assign("/");
}

const isWin = loserId == myId;

document.getElementById('data').innerHTML = `<p>You ${isWin ? 'Win' : 'Loose'}</p><a id="continue" href="/">Continue</a>`