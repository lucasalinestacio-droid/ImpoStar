const CACHE_NAME = 'impostar-v3';
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

self.addEventListener('install', (e) => {
    e.waitUntil(
        caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
    );
});

self.addEventListener('fetch', (e) => {
    e.respondWith(
        caches.match(e.request).then((response) => response || fetch(e.request))
    );
});
