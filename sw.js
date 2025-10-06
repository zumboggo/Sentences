const CACHE = 'sentence-drill-cache-v5';
const ASSETS = [
  './',
  './index.html',
  './player.html',
  './style.css',
  './manifest.webmanifest'
];

self.addEventListener('install', e => {
  console.log('Service Worker installing...');
  e.waitUntil(
    caches.open(CACHE).then(cache => {
      console.log('Caching app shell');
      return cache.addAll(ASSETS);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  console.log('Service Worker activating...');
  e.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  if (!e.request.url.startsWith(self.location.origin)) return;

  e.respondWith(
    caches.match(e.request).then(response => {
      return response || fetch(e.request).then(fetchResponse => {
        if (!fetchResponse || fetchResponse.status !== 200) {
          return fetchResponse;
        }
        const responseToCache = fetchResponse.clone();
        caches.open(CACHE).then(cache => {
          cache.put(e.request, responseToCache);
        });
        return fetchResponse;
      });
    }).catch(() => {
      if (e.request.mode === 'navigate') {
        return caches.match('./index.html');
      }
    })
  );
});
