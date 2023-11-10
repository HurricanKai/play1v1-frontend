document.addEventListener("alpine:init", () => {
  Alpine.store("profile", {
    user: undefined,
  });
  Alpine.store("stats", {
    matchmaker: undefined,
  });
  Alpine.store("presence", {
    matchmaker: undefined
  })
});