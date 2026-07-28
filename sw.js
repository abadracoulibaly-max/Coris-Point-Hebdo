// Service worker minimal : rend l'application installable (PWA) et met en cache
// uniquement le "shell" de l'app (index.html) pour un chargement plus rapide.
// Ne met JAMAIS en cache les appels Supabase (origine différente) : on ne veut
// jamais qu'un manager ou un CAF voie un statut de dossier périmé hors-ligne.
const CACHE_NAME = "cmf-shell-v1";
const APP_SHELL = ["./", "./index.html"];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))))
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return; // Supabase, Google Fonts, etc. : direct au réseau

  event.respondWith(
    fetch(event.request)
      .then((resp) => {
        const copy = resp.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
        return resp;
      })
      .catch(() => caches.match(event.request))
  );
});
