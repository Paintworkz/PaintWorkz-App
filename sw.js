// PaintWorkz Pro service worker — v1.16.464
// Lets the app open and run with no internet, using the copy saved on this device.
//  • The app page: always tries the internet first (so updates arrive straight away),
//    falls back to the saved copy when offline.
//  • App libraries (Firebase, PDF, charts): saved once, reused offline.
//  • Database / login / payments traffic is never touched — it always goes direct.
const CACHE_NAME = 'paintworkz-v1.16.464';
const CORE = [
  './', './index.html', './manifest.json', './logo.png',
  './icon-192.png', './icon-512.png', './icon-maskable-512.png', './icon-180.png', './favicon-32.png'
];
const LIBS = [
  'https://www.gstatic.com/firebasejs/12.9.0/firebase-app.js',
  'https://www.gstatic.com/firebasejs/12.9.0/firebase-auth.js',
  'https://www.gstatic.com/firebasejs/12.9.0/firebase-firestore.js',
  'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/qrious/4.0.2/qrious.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js'
];

self.addEventListener('install', e => {
  e.waitUntil((async () => {
    const c = await caches.open(CACHE_NAME);
    // One file failing must not stop the rest being saved
    await Promise.all(CORE.concat(LIBS).map(u => c.add(u).catch(() => {})));
  })());
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k.startsWith('paintworkz-') && k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

function isLib(url) {
  return (url.hostname === 'www.gstatic.com' && url.pathname.startsWith('/firebasejs/')) ||
         (url.hostname === 'cdnjs.cloudflare.com' && url.pathname.startsWith('/ajax/libs/'));
}

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  let url;
  try { url = new URL(req.url); } catch (err) { return; }

  // App pages and files on our own site: internet first, saved copy when offline
  if (url.origin === self.location.origin) {
    e.respondWith((async () => {
      try {
        const res = await fetch(req);
        if (res && res.ok && res.type === 'basic') {
          const copy = res.clone();
          caches.open(CACHE_NAME).then(c => c.put(req, copy)).catch(() => {});
        }
        return res;
      } catch (err) {
        const cached = await caches.match(req, { ignoreSearch: true });
        if (cached) return cached;
        if (req.mode === 'navigate') {
          const page = await caches.match('./index.html') || await caches.match('./');
          if (page) return page;
        }
        throw err;
      }
    })());
    return;
  }

  // Libraries (versioned URLs never change): saved copy first, internet if not saved yet
  if (isLib(url)) {
    e.respondWith((async () => {
      const cached = await caches.match(req);
      if (cached) return cached;
      const res = await fetch(req);
      if (res && (res.ok || res.type === 'opaque')) {
        const copy = res.clone();
        caches.open(CACHE_NAME).then(c => c.put(req, copy)).catch(() => {});
      }
      return res;
    })());
    return;
  }
  // Everything else (Firebase database/login, Paddle, EmailJS, Google): not touched
});
