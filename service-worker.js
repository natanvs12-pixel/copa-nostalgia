/* BOLÃO BR — Service Worker
   Cache offline básico. Atualiza automaticamente quando muda a versão. */

const CACHE_VERSION = "bolao-br-v3";
const CORE_ASSETS = [
  "./",
  "./index.html",
  "./firebase-config.js",
  "./firebase-sync.js",
  "./auth-ui.js",
  "./manifest.json",
  "./icon.svg",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION).then((cache) => {
      return cache.addAll(CORE_ASSETS).catch(() => {
        // Continua mesmo se algum asset falhar
      });
    })
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((k) => k !== CACHE_VERSION).map((k) => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;

  // Não cacheia chamadas pro Firebase
  if (req.url.includes("firebaseio.com") || req.url.includes("googleapis.com")) {
    return;
  }

  event.respondWith(
    caches.match(req).then((cached) => {
      const fetchPromise = fetch(req)
        .then((res) => {
          // Cache only successful same-origin responses
          if (res && res.ok && new URL(req.url).origin === self.location.origin) {
            const copy = res.clone();
            caches.open(CACHE_VERSION).then((cache) => cache.put(req, copy));
          }
          return res;
        })
        .catch(() => cached || caches.match("./index.html"));
      return cached || fetchPromise;
    })
  );
});
