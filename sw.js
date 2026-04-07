/* 빼빼한의원 상담앱 서비스워커 — 캐시 우선, 서버 없이도 작동 */
var CACHE_NAME = 'bbaebbae-v12';
var FILES = [
  './index.html',
  './treatment.html',
  './clinic.html',
  './event.html',
  './consent.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  './logo-white.png',
  './logo-color.png'
];

self.addEventListener('install', function(e) {
  e.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(keys.map(function(k) { return caches.delete(k); }));
    }).then(function() {
      return caches.open(CACHE_NAME).then(function(cache) {
        return cache.addAll(FILES);
      });
    })
  );
  self.skipWaiting();
});

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

self.addEventListener('fetch', function(e) {
  /* 캐시 우선 — 캐시에 있으면 바로 제공, 없으면 네트워크 */
  e.respondWith(
    caches.match(e.request).then(function(cached) {
      if (cached) return cached;
      return fetch(e.request).then(function(response) {
        var clone = response.clone();
        caches.open(CACHE_NAME).then(function(cache) {
          cache.put(e.request, clone);
        });
        return response;
      });
    })
  );
});
