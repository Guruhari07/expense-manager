const CACHE_NAME = 'expense-cache-v3';
const urlsToCache = [
  './',
  './index.html',
  './style.css',
  './script.js',
  './manifest.json',
  './icon.svg'
];

self.addEventListener('install', event => {
  // Force the waiting service worker to become the active service worker.
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('activate', event => {
  // Take control of all pages immediately.
  event.waitUntil(self.clients.claim());
  
  // Clear any old, outdated caches so the new CSS is forced to load.
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Network First strategy instead of Cache First
self.addEventListener('fetch', event => {
  // Try to grab fresh files from the internet FIRST.
  event.respondWith(
    fetch(event.request).catch(() => {
        // Only use the cache if the user is literally offline (Airplane mode).
        return caches.match(event.request);
    })
  );
});
