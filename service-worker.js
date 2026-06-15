const CACHE_NAME = "quarky-v2";
const ASSETS = ["./", "./index.html", "./pwa.js", "./manifest.json"];

// Instalação: Cria o cache inicial
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    }),
  );
});

// Ativação: Limpa caches antigos
self.addEventListener("activate", (event) => {
  console.log("Service Worker ativo!");
});

// Fetch: Necessário para o PWA ser considerado instalável
self.addEventListener("fetch", (event) => {
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request)),
  );
});
