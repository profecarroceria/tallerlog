const CACHE_NAME = 'tallerlog-v3';
const ASSETS = [
  '/tallerlog/',
  '/tallerlog/index.html',
  '/tallerlog/manifest.json',
  '/tallerlog/icon-192.png',
  '/tallerlog/icon-512.png'
];

// Instalar y cachear assets esenciales
self.addEventListener('install', function(e) {
  e.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.addAll(ASSETS).catch(function() {
        // Si algún asset falla, continuar igual
      });
    })
  );
  self.skipWaiting();
});

// Activar y limpiar caches viejas
self.addEventListener('activate', function(e) {
  e.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys.filter(function(k) { return k !== CACHE_NAME; })
            .map(function(k) { return caches.delete(k); })
      );
    })
  );
  self.clients.claim();
});

// Fetch: cache first, luego red
self.addEventListener('fetch', function(e) {
  // Solo manejar GET
  if (e.request.method !== 'GET') return;

  e.respondWith(
    caches.match(e.request).then(function(cached) {
      if (cached) return cached;
      return fetch(e.request).then(function(response) {
        // Cachear respuestas válidas del mismo origen
        if (response && response.status === 200 && response.type === 'basic') {
          var clone = response.clone();
          caches.open(CACHE_NAME).then(function(cache) {
            cache.put(e.request, clone);
          });
        }
        return response;
      }).catch(function() {
        // Sin red y sin cache — devolver página principal si existe
        return caches.match('/tallerlog/index.html');
      });
    })
  );
});
