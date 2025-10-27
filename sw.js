// Service Worker for offline support
const CACHE_NAME = 'glossary-cache-v2';
const urlsToCache = [
    '/',
    '/home.html',
    '/index.html',
    '/index2.html',
    '/index3.html',
    '/index4.html',
    '/index5.html',
    '/password.html',
    '/login.html',
    '/logout.html',
    '/static/script2.js',
    '/static/style2.css',
    '/static/QA.json',
    '/static/python_methods.json',
    '/static/ExcelVBA.json',
    '/static/sql_glossary.json',
    '/static/html_elements.json',
    '/static/other_glossary.json',
    '/hate/base.html',
    '/hate/python.json',
    '/hate/sql.json',
    '/hate/web.json'
    // Add other assets like CSS if needed
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                return cache.addAll(urlsToCache);
            })
    );
});

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // Return cached version or fetch from network
                return response || fetch(event.request);
            })
    );
});

self.addEventListener('activate', event => {
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