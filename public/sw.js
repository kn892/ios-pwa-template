// Service Worker — iOS PWA Template
// キャッシュ名（バージョン管理用）
const CACHE_NAME = 'pwa-template-v1';

// プリキャッシュするリソース
const PRECACHE_URLS = [
    '/',
    '/index.html',
    '/styles.css',
    '/app.js',
    '/manifest.json',
    '/icons/icon-192x192.png',
    '/icons/icon-512x512.png',
    '/offline.html'
];

// インストール — 静的アセットをキャッシュに保存
self.addEventListener('install', (event) => {
    console.log('[SW] インストール中...');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('[SW] プリキャッシュ完了');
                return cache.addAll(PRECACHE_URLS);
            })
            .then(() => self.skipWaiting()) // 即座にアクティベート
    );
});

// アクティベート — 古いキャッシュを削除
self.addEventListener('activate', (event) => {
    console.log('[SW] アクティベート中...');
    event.waitUntil(
        caches.keys().then((keyList) =>
            Promise.all(keyList.map((key) => {
                if (key !== CACHE_NAME) {
                    console.log('[SW] 古いキャッシュを削除:', key);
                    return caches.delete(key);
                }
            }))
        ).then(() => self.clients.claim()) // すべてのクライアントを制御下に
    );
});

// フェッチ — Network First戦略（フォールバック付き）
self.addEventListener('fetch', (event) => {
    // ナビゲーションリクエスト（HTML）
    if (event.request.mode === 'navigate') {
        event.respondWith(
            fetch(event.request)
                .catch(() => caches.match('/offline.html'))
        );
        return;
    }

    // その他のリクエスト — Cache First
    event.respondWith(
        caches.match(event.request)
            .then((cachedResponse) => {
                if (cachedResponse) {
                    return cachedResponse;
                }
                return fetch(event.request).then((response) => {
                    // 正常なレスポンスのみキャッシュに追加
                    if (response && response.status === 200 && response.type === 'basic') {
                        const responseToCache = response.clone();
                        caches.open(CACHE_NAME).then((cache) => {
                            cache.put(event.request, responseToCache);
                        });
                    }
                    return response;
                });
            })
    );
});

// Push通知の受信
self.addEventListener('push', (event) => {
    console.log('[SW] Push通知を受信');
    let data = { title: 'PWA Template', body: '新しい通知があります' };

    if (event.data) {
        try {
            data = event.data.json();
        } catch (e) {
            data.body = event.data.text();
        }
    }

    const options = {
        body: data.body,
        icon: '/icons/icon-192x192.png',
        badge: '/icons/icon-192x192.png',
        vibrate: [100, 50, 100],
        data: {
            url: data.url || '/'
        }
    };

    event.waitUntil(
        self.registration.showNotification(data.title, options)
    );
});

// 通知クリック時の処理
self.addEventListener('notificationclick', (event) => {
    console.log('[SW] 通知がクリックされました');
    event.notification.close();

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true })
            .then((clientList) => {
                // 既に開いているウィンドウがあればフォーカス
                for (const client of clientList) {
                    if (client.url === event.notification.data.url && 'focus' in client) {
                        return client.focus();
                    }
                }
                // なければ新しいウィンドウを開く
                return clients.openWindow(event.notification.data.url);
            })
    );
});
