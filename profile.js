import Clerk from "@clerk/clerk-js";
import { clerkKey } from "./config";

var clerk;
document.addEventListener("alpine:init", () => {
  Alpine.store("profile", {
    user: undefined,
  });
  Alpine.store("matchmaker", {
    config: m_config,
  });
});

var onProfileLoad = undefined;

export const profileLoaded = new Promise((r) => {
  onProfileLoad = r;
});

clerk = new Clerk(clerkKey);
await clerk.load({});

if (!clerk.session) {
  let url = clerk.buildSignInUrl();
  const queuebtn = document.getElementById("queuebtn");
  if (queuebtn) {
    queuebtn.onclick = function (e) {
        e.preventDefault();
        window.location.assign(url);
    };
    queuebtn.disabled = false;
    queuebtn.textContent = "Press to Login";
  }
  else {
    window.location.assign(url);
    console.log("Redirecting...", url);
  }
} else {
    plausible('Login');
    onProfileLoad(clerk.session);
    Alpine.store("profile").user = clerk.session.user;

    clerk.session.user.username;
}
