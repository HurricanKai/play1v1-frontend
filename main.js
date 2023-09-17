import './style.css'
const worker = new Worker(new URL('/arena-worker.js', import.meta.url));

document.addEventListener("keydown",function(e){
    worker.postMessage({type: "keydown", payload: e.code});
});

document.addEventListener("keyup",function(e){
    worker.postMessage({type: "keyup", payload: e.code});
});

let player_group = document.getElementById("player-group");
let counter_group = document.getElementById("counter-group");
let bullet_group = document.getElementById("bullet-group");
let impact_group = document.getElementById("impact-group");

worker.onmessage = ((ev) => {
  let {type, payload} = ev.data;
  if (type === "close") {
    worker.terminate();
    window.location.assign("/");
  }
  else if(type === "render-update") {
    let {players, bullets, impacts, impact_counter} = payload;

    player_group.innerHTML = players;
    counter_group.innerHTML = impact_counter;
    bullet_group.innerHTML = bullets;
    impact_group.innerHTML = impacts;
  }else {
    console.error("Invalid frontend message", {type, payload});
  }
});
console.log(worker);
