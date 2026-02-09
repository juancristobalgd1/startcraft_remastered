const CACHE_NAME = "starcraft-pwa-v1";
const CORE_ASSETS = [
  "./",
  "./index.html",
  "./manifest.json",
  "./css/style.css",
  "./css/mapStyle.css",
  "./css/buttonStyle.css",
  "./css/portraitStyle.css",
  "./css/modern_ui.css",
  "./Utils/jquery.min.js",
  "./Utils/gFrame.js",
  "./Utils/sourceLoader.js",
  "./Characters/Gobj.js",
  "./Characters/Burst.js",
  "./Characters/Animation.js",
  "./Characters/Units.js",
  "./Characters/Magic.js",
  "./Characters/Upgrade.js",
  "./Characters/Building.js",
  "./Characters/Zerg.js",
  "./Characters/Terran.js",
  "./Characters/Protoss.js",
  "./Characters/Neutral.js",
  "./Characters/Hero.js",
  "./Characters/Bullets.js",
  "./Characters/Button.js?v=3",
  "./Characters/Map.js?v=3",
  "./GameRule/Resource.js",
  "./GameRule/Referee.js",
  "./GameRule/Levels.js?v=3",
  "./GameRule/Game.js?v=3",
  "./GameRule/Cheat.js?v=3",
  "./Controller/mouseController.js?v=3",
  "./Controller/keyController.js?v=3"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      await cache.addAll(
        CORE_ASSETS.map((url) => new Request(url, { cache: "reload" }))
      );
      await self.skipWaiting();
    })()
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      );
      await self.clients.claim();
    })()
  );
});

function isSameOrigin(requestUrl) {
  return requestUrl.origin === self.location.origin;
}

async function staleWhileRevalidate(request) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request);
  const networkPromise = fetch(request)
    .then((response) => {
      if (response && response.ok) cache.put(request, response.clone());
      return response;
    })
    .catch(() => undefined);
  return cached || (await networkPromise);
}

async function cacheFirst(request) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request);
  if (cached) return cached;
  const response = await fetch(request);
  if (response && response.ok) cache.put(request, response.clone());
  return response;
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (!isSameOrigin(url)) return;

  if (request.mode === "navigate") {
    event.respondWith(
      (async () => {
        try {
          const response = await fetch(request);
          const cache = await caches.open(CACHE_NAME);
          cache.put("./index.html", response.clone());
          return response;
        } catch (_) {
          const cached = await caches.match("./index.html");
          if (cached) return cached;
          return new Response("Offline", {
            status: 503,
            headers: { "Content-Type": "text/plain; charset=utf-8" }
          });
        }
      })()
    );
    return;
  }

  if (request.destination === "image") {
    event.respondWith(cacheFirst(request));
    return;
  }

  if (request.destination === "style" || request.destination === "script") {
    event.respondWith(staleWhileRevalidate(request));
    return;
  }

  event.respondWith(staleWhileRevalidate(request));
});
