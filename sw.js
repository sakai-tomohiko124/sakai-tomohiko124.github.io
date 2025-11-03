// Service Worker for offline support
const CACHE_NAME = 'glossary-cache-v3';
const urlsToCache = [
    '/',
    '/home.html',
    '/index.html',
    '/index2.html',
    '/index3.html',
    '/index4.html',
    '/index5.html',
    '/login.html',
    '/logout.html',
    '/loading.html',
    '/thanks.html',
    '/static/script2.js',
    '/static/style2.css',
    '/static/security.js',
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
];

// Service Workerのインストールイベント
self.addEventListener('install', event => {
    // 新しいService Workerをすぐに有効化する
    self.skipWaiting(); 
    
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Opened cache and caching files');
                return cache.addAll(urlsToCache);
            })
    );
});

// fetchイベント（ネットワークリクエストを横取りする）
self.addEventListener('fetch', event => {
    // Stale-While-Revalidate戦略:
    // 1. まずキャッシュからリソースを探す。
    // 2. キャッシュにあればそれをすぐに返す（高速表示）。
    // 3. 同時に、ネットワークにリクエストを送り、新しいリソースがあればキャッシュを更新する。
    // 4. キャッシュになければ、ネットワークリクエストの結果を待って返す。
    event.respondWith(
        caches.open(CACHE_NAME).then(cache => {
            return cache.match(event.request).then(response => {
                const fetchPromise = fetch(event.request).then(networkResponse => {
                    // ネットワークから取得した新しいレスポンスをキャッシュに入れる
                    cache.put(event.request, networkResponse.clone());
                    return networkResponse;
                });
                
                // キャッシュがあればそれを返し、裏でネットワーク更新を実行
                // キャッシュがなければネットワークの結果を待つ
                return response || fetchPromise;
            });
        })
    );
});

// activateイベント（古いキャッシュを削除する）
self.addEventListener('activate', event => {
    // このService Workerが管理するキャッシュ名のホワイトリスト
    const cacheWhitelist = [CACHE_NAME];
    
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    // ホワイトリストに含まれていないキャッシュ（＝古いキャッシュ）は削除する
                    if (cacheWhitelist.indexOf(cacheName) === -1) {
                        console.log('Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});