
import Clerk from '@clerk/clerk-js';
import { clerkKey } from "./config";

var clerk;
document.addEventListener('alpine:init', () => {
    Alpine.store('profile', {
        user: undefined
    });
})

var onProfileLoad = undefined;

export const profileLoaded = new Promise((r) => {
    onProfileLoad = r;
});

clerk = new Clerk(clerkKey);
await clerk.load({
});

if (!clerk.session) {
  let url = clerk.buildSignInUrl();
  window.location.assign(url);
  console.log("Redirecting...", url);
}

onProfileLoad(clerk.session);
Alpine.store('profile').user = clerk.session.user;

clerk.session.user.username