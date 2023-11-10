const params = new URLSearchParams(window.location.search);
const arenaId = params.get('arenaId');
if (!arenaId) {
  console.warn("No Arena ID");
  window.location.assign("/");
}

import './style.css'
import { clerkKey } from "./config";
import Clerk from '@clerk/clerk-js';

const worker = new Worker(new URL('/arena-worker.js', import.meta.url));
console.log("Loading Clerk");
const clerk = new Clerk(clerkKey);
await clerk.load({
});


if (!clerk.user) {
  console.warn("Redirecting to Login");
  let url = clerk.buildSignInUrl();
  window.location.assign(url);
  console.log("Redirecting...", url);
}
else {
  console.log("Getting Token")
  clerk.session.getToken().then(token => {
    worker.postMessage({type: "setup", payload: {token, arenaId}});
    console.log("Worker sended token");
  });


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
      console.warn("Redirecting to home as worker crashed");
      window.location.assign("/");
    }
    else if (type === "render-update") {
      let {players, bullets, impacts, impact_counter} = payload;

      player_group.innerHTML = players;
      counter_group.innerHTML = impact_counter;
      bullet_group.innerHTML = bullets;
      impact_group.innerHTML = impacts;
    }
    else if (type === "game-done") {
      game_done = true;
      let {loser} = payload;
      worker.terminate();
      window.location.assign(`/game-end?arenaId=${arenaId}&loser=${loser}&me=${clerk.user.id}`)
    }
    else {
      console.error("Invalid frontend message", {type, payload});
    }
  });
  console.log(worker);
}