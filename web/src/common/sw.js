const CACHE_NAME = '__CACHE_NAME__';
const OFFLINE_PAGE = '/offline.html';

const ESSENTIAL_ASSETS = [OFFLINE_PAGE, '/favicon.png', '/'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(ESSENTIAL_ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.filter((cacheName) => cacheName !== CACHE_NAME).map((cacheName) => caches.delete(cacheName))
        );
      })
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  const pathname = url.pathname;
  const isEssentialAsset = ESSENTIAL_ASSETS.some((asset) => {
    return pathname === asset || (asset === '/' && pathname === '/');
  });

  if (event.request.mode === 'navigate') {
    event.respondWith(fetch(event.request).catch(() => caches.match(OFFLINE_PAGE)));
  } else if (isEssentialAsset) {
    event.respondWith(
      caches
        .match(event.request)
        .then((response) => response || fetch(event.request))
        .catch(() => {
          if (event.request.destination === 'document') {
            return caches.match(OFFLINE_PAGE);
          }
        })
    );
  }
});
