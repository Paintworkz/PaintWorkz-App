const CACHE_NAME = 'paintworkz-v1.16.461';
const ASSETS = ['./', './index.html', './logo.png', './manifest.json', './icon-192.png', './icon-512.png', './icon-maskable-512.png', './icon-180.png', './favicon-32.png'];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(c => c.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  e.respondWith(fetch(e.request).catch(() => caches.match(e.request)));
});
