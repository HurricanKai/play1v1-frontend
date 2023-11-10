/// <reference no-default-lib="true"/>
/// <reference lib="esnext" />
/// <reference lib="webworker" />
import { Socket } from "phoenix";
import { wsEndpoint } from "./config";

let controls = {
  accelerate: false,
  decelerate: false,
  rotate_left: false,
  rotate_right: false,
  is_firing: false,
};

let arenaId;
onmessage = (ev) => {
  let token;
  let { type, payload } = ev.data;

  if (type === "setup") {
    console.log("Got Setup!")
    token = payload.token;
    arenaId = payload.arenaId;

    onmessage = (ev) => {
      let { type, payload } = ev.data;

      if (type === "set-token") {
        token = payload;
      } else if (type === "keydown") {
        if (payload === "KeyA") {
          controls.rotate_left = true;
        } else if (payload === "KeyD") {
          controls.rotate_right = true;
        } else if (payload === "KeyW") {
          controls.accelerate = true;
        } else if (payload === "KeyS") {
          controls.decelerate = true;
        } else if (payload === "Space") {
          controls.is_firing = true;
        }
        flushControls();
      } else if (type === "keyup") {
        if (payload === "KeyA") {
          controls.rotate_left = false;
        } else if (payload === "KeyD") {
          controls.rotate_right = false;
        } else if (payload === "KeyW") {
          controls.accelerate = false;
        } else if (payload === "KeyS") {
          controls.decelerate = false;
        } else if (payload === "Space") {
          controls.is_firing = false;
        }
        flushControls();
      } else {
        console.error("Unknown Internal Message", type, payload);
      }
    };

    let socket = new Socket(wsEndpoint, {
      params: { token },
    });

    let arenaChannel;
    let gameState;
    let game_done = false;
    socket.onOpen(() => {
      let arena = socket.channel("arena:" + arenaId);
      arena.onError((e) => console.error("Arena", e));
      arena.on("full_state", (payload) => {
        let players = payload.players;
        let impacts = payload.impacts;
        let bullets = payload.bullets;

        gameState = {
          players: players.map((e) => ({
            x: e.x,
            y: e.y,
            h: e.h,
            c: e.color,
            i: e.impact_counter,
          })),
          bullets: bullets.map((e) => ({ x: e.x, y: e.y, h: e.h })),
          impacts: impacts.map((e) => ({ x: e.x, y: e.y })),
        };

        flushGameState();
      });
      arena.on("game-done", ({loser: loser_id}) => {
        console.log("got game-done");
        game_done = true;
        arenaChannel.leave();
        postMessage({ type: "game-done", payload: { loser: loser_id}});
      });
      arena.join();
      arenaChannel = arena;
    });
    socket.onClose(() => {
      postMessage({ type: "close" });
      socket.disconnect(undefined, 1000);
    });
    socket.onError((e) => {
      if (game_done) {
        socket.disconnect(undefined, 1000);
      }
      else {
        console.error("Socket", e);
      }
    });

    console.log("Connecting...")
    socket.connect();

    function flushControls() {
      arenaChannel.push("control_update", { controls });
    }

    function flushGameState() {
      let players = gameState.players
        .map(
          ({ x, y, h, c }) => `<g
                xmlns="http://www.w3.org/2000/svg"
                transform="matrix(${Math.cos(h)} ${-Math.sin(h)} ${Math.sin(
            h
          )} ${Math.cos(h)} ${x} ${y})"
                >
                    <path
                        style="stroke: ${c}; fill: none; stroke-width: 2; opacity: 1;"
                        vector-effect="non-scaling-stroke"
                        d="M -3 0 L 3 2 l -1 -0.3333 l -0 -3.3333 L 3 -2 L -3 0"
                        stroke-linecap="round"
                    />
                </g>`
        )
        .join();

      let bullets = gameState.bullets
        .map(
          ({ x, y, h }) => `<g
                xmlns="http://www.w3.org/2000/svg"
                transform="matrix(${Math.cos(h)} ${-Math.sin(h)} ${Math.sin(
            h
          )} ${Math.cos(h)} ${x} ${y})"
                >
                <path
                    style="stroke: white; fill: none; stroke-width: 2; opacity: 1;"
                    vector-effect="non-scaling-stroke"
                    d="M -0.625 -0 L 0.375 0.25 l 0 -0.5 L -0.625 -0"
                    stroke-linecap="round"
                />
                </g>`
        )
        .join();

      let impacts = gameState.impacts
        .map(
          ({ x, y }) => `<g
                xmlns="http://www.w3.org/2000/svg"
                transform="matrix(1 0 0 1 ${x} ${y})"
                >
                <path
                    style="stroke: cyan; fill: none; stroke-width: 2; opacity: 1;"
                    vector-effect="non-scaling-stroke"
                    d="M -3 0 L 0 -3 L 3 0 L 0 3 L -3 0"
                    stroke-linecap="round"
                />
                </g>`
        )
        .join();

      let impact_counter = gameState.players
        .map(
          ({ c, i }, idx) => `
                    <text x="3" y="${
                      idx * 10 + 10
                    }" style="fill: ${c}; font-size: 0.5rem">${i}</text>`
        )
        .join();

      self.postMessage({
        type: "render-update",
        payload: { players, bullets, impacts, impact_counter },
      });
    }
  }
};
