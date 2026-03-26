// Minimal service worker for PWA installation support
const CACHE_NAME = 'techhive-v1';
const ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/logo3.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
