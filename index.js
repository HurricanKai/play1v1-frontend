import "./style.css";
import "./index.css";
import { Socket } from "phoenix";
import { wsEndpoint } from "./config";
import { profileLoaded } from "./profile";

let m_state = undefined;
let m_config;
let in_progress = false;
let has_enabled_queuebtn = false;
let redirectingToGame = false;
const queuebtn = document.getElementById("queuebtn");

queuebtn.disabled = true;
queuebtn.textContent = "Authenticating...";

/** @type {ActiveSessionResource} */
const session = await profileLoaded;

const token = await session.getToken();

queuebtn.textContent = "Connecting...";

let socket = new Socket(wsEndpoint, {
  params: { token: token },
});

let channel;
socket.onOpen(() => {
  queuebtn.textContent = "Loading Config...";

  channel = socket.channel("matchmaking");
  channel.on("config", (config) => {
    m_config = config;

    if (!has_enabled_queuebtn) {
      has_enabled_queuebtn = true;
      queuebtn.textContent = "Enter Queue";
      queuebtn.disabled = false;
      queuebtn.onclick = function (e) {
        e.preventDefault();
        if (in_progress) return;
        in_progress = true;
        plausible('Start Matchmaking');

        // TODO: Update Visuals, add spinner, etc.
        channel.push("start-matchmaking", {});
        queuebtn.textContent = "In Queue...";
        queuebtn.disabled = true;

        // TODO: Allow canceling queue - send stop-matchmaking
      };
    }
  });

  channel.on("begin-accept-game", (body) => {
    // TODO: Make the user accept the game
    channel.push("end-accept-game", body);
  });

  channel.on("join-arena", ({ arena_id: arena_id }) => {
    queuebtn.textContent = "Found Game...";
    plausible('Play Game');
    // TODO: Preload page
    socket.disconnect();
    redirectingToGame = true;
    window.location.assign("/arena?arenaId=" + arena_id);
  });

  channel.join();
});
socket.onClose(() => {
  // TODO: Better reconnect
  if (!redirectingToGame) {
    window.location.reload(false);
  }
});

socket.connect();