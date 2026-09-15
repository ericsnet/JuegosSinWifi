const CACHE_NAME = 'juegossinwifi-v1.0.0';
const ASSETS_TO_CACHE = [
    './',
    './index.html',
    './manifest.json',
    './icons/icon.svg',
    './css/style.css',
    './css/games.css',
    './css/responsive.css',
    './js/audio.js',
    './js/storage.js',
    './js/achievements.js',
    './js/profile.js',
    './js/app.js',
    './js/games/snake.js',
    './js/games/tetris.js',
    './js/games/space-invaders.js',
    './js/games/flappy.js',
    './js/games/game2048.js',
    './js/games/minesweeper.js',
    './js/games/memory.js',
    './js/games/sudoku.js',
    './js/games/connect4.js',
    './js/games/hangman.js',
    './js/games/pong.js',
    './js/games/runner.js',
    './js/games/typing.js',
    './js/games/solitaire.js'
];

// Install Event
self.addEventListener('install', (e) => {
    e.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(ASSETS_TO_CACHE);
        }).then(() => self.skipWaiting())
    );
});

// Activate Event
self.addEventListener('activate', (e) => {
    e.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(
                keys.map((key) => {
                    if (key !== CACHE_NAME) {
                        return caches.delete(key);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

// Fetch Event (Cache First with Network Fallback)
self.addEventListener('fetch', (e) => {
    // Only handle GET requests and avoid GitHub API caching by SW
    if (e.request.method !== 'GET' || e.request.url.includes('api.github.com')) {
        return;
    }

    e.respondWith(
        caches.match(e.request).then((cachedResponse) => {
            if (cachedResponse) {
                return cachedResponse;
            }
            return fetch(e.request).then((networkResponse) => {
                if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
                    return networkResponse;
                }
                const responseToCache = networkResponse.clone();
                caches.open(CACHE_NAME).then((cache) => {
                    cache.put(e.request, responseToCache);
                });
                return networkResponse;
            }).catch(() => {
                // If offline and request is HTML, return cached index
                if (e.request.headers.get('accept')?.includes('text/html')) {
                    return caches.match('./index.html');
                }
            });
        })
    );
});
