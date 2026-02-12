const CACHE_NAME = 'impostar-v7';
const ASSETS = [
    './',
    './index.html',
    './css/styles.css',
    './js/game.js',
    './js/ui.js',
    './js/store.js',
    './js/app.js',
    './js/data.js',
    './img/logo.png',
    './img/banner.png',
    './manifest.json'
];

// Install Event
self.addEventListener('install', (e) => {
    self.skipWaiting(); // Force the waiting service worker to become the active service worker
    e.waitUntil(
        caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
    );
});

// Activate Event - Clean up old caches
self.addEventListener('activate', (e) => {
    e.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(keys.map((key) => {
                if (key !== CACHE_NAME) return caches.delete(key);
            }));
        }).then(() => self.clients.claim()) // Become control of all clients immediately
    );
});

// Fetch Event - Stale-While-Revalidate
self.addEventListener('fetch', (e) => {
    e.respondWith(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.match(e.request).then((response) => {
                const fetchPromise = fetch(e.request).then((networkResponse) => {
                    cache.put(e.request, networkResponse.clone());
                    return networkResponse;
                });
                return response || fetchPromise;
            });
        })
    );
});
