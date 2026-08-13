// Kill-switch service worker: evicts the old Dopamind app-shell cache and unregisters itself.
// Cache Storage is origin-scoped; only delete this registration's own caches.
function isAppShellCache(name) {
  return /^dopamind-/.test(name) || /(^|-)precache-v\d+-|(^|-)runtime-/.test(name);
}

self.addEventListener("install", () => self.skipWaiting());

self.addEventListener("activate", (event) =>
  event.waitUntil(
    (async () => {
      try {
        const cacheNames = await caches.keys();
        await Promise.allSettled(
          cacheNames.filter(isAppShellCache).map((name) => caches.delete(name))
        );
        await self.clients.claim();
        const windowClients = await self.clients.matchAll({ type: "window" });
        await Promise.allSettled(windowClients.map((client) => client.navigate(client.url)));
      } finally {
        await self.registration.unregister();
      }
    })()
  )
);
