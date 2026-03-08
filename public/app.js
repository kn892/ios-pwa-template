// ===== iOS PWA テンプレート — メインスクリプト =====

// --- ユーティリティ ---
const $ = (sel) => document.querySelector(sel);

// ステータスの更新ヘルパー
function setStatus(id, state, text, value) {
    const indicator = $(`#${id}Indicator`);
    const textEl = $(`#${id}Text`);
    const valueEl = $(`#${id}Value`);

    indicator.className = `status-indicator ${state}`;
    textEl.textContent = text;
    if (value !== undefined) valueEl.textContent = value;
}

// --- 動作モード検出 ---
function detectMode() {
    const isStandalone =
        window.navigator.standalone === true ||
        window.matchMedia('(display-mode: standalone)').matches;

    const isIOS = /iphone|ipad|ipod/.test(navigator.userAgent.toLowerCase());

    if (isStandalone) {
        setStatus('mode', 'active', 'スタンドアロン', 'PWAモード 🎉');
        $('#modeBadge').textContent = 'PWA';
    } else if (isIOS) {
        setStatus('mode', 'pending', 'ブラウザ', 'Safari（未インストール）');
        $('#modeBadge').textContent = 'Safari';
        // インストールバナーを表示
        showInstallBanner();
    } else {
        setStatus('mode', 'inactive', 'ブラウザ', navigator.userAgent.includes('Chrome') ? 'Chrome' : 'ブラウザ');
        $('#modeBadge').textContent = 'Browser';
    }
}

// --- Service Worker 登録 ---
async function registerServiceWorker() {
    if (!('serviceWorker' in navigator)) {
        setStatus('sw', 'inactive', '非対応', 'Service Worker非対応');
        return;
    }

    try {
        const registration = await navigator.serviceWorker.register('/sw.js');
        console.log('[App] Service Worker登録成功:', registration.scope);

        // 待機 → アクティブになるまで監視
        if (registration.installing) {
            setStatus('sw', 'pending', 'インストール中', 'インストール中...');
            registration.installing.addEventListener('statechange', (e) => {
                if (e.target.state === 'activated') {
                    setStatus('sw', 'active', 'アクティブ', '登録済み ✅');
                }
            });
        } else if (registration.active) {
            setStatus('sw', 'active', 'アクティブ', '登録済み ✅');
        }

        // Push通知ボタンを有効化
        setupPushButton(registration);
    } catch (error) {
        console.error('[App] Service Worker登録失敗:', error);
        setStatus('sw', 'inactive', 'エラー', `エラー: ${error.message}`);
    }
}

// --- Push通知 ---
async function setupPushButton(registration) {
    const notifyBtn = $('#notifyBtn');
    const testBtn = $('#testNotifyBtn');

    if (!('Notification' in window) || !('PushManager' in window)) {
        setStatus('push', 'inactive', '非対応', 'Push API非対応');
        notifyBtn.textContent = '🔔 Push通知非対応';
        return;
    }

    const permission = Notification.permission;

    if (permission === 'granted') {
        setStatus('push', 'active', '許可済み', '通知ON ✅');
        notifyBtn.textContent = '🔔 通知は許可済みです';
        notifyBtn.disabled = true;
        testBtn.disabled = false;
    } else if (permission === 'denied') {
        setStatus('push', 'inactive', '拒否', '通知ブロック済み ❌');
        notifyBtn.textContent = '🔔 通知がブロックされています';
        notifyBtn.disabled = true;
    } else {
        setStatus('push', 'pending', '未許可', '許可を待っています');
        notifyBtn.disabled = false;
    }

    // 通知許可ボタン
    notifyBtn.addEventListener('click', async () => {
        try {
            const result = await Notification.requestPermission();
            if (result === 'granted') {
                setStatus('push', 'active', '許可済み', '通知ON ✅');
                notifyBtn.textContent = '🔔 通知は許可済みです';
                notifyBtn.disabled = true;
                testBtn.disabled = false;
                console.log('[App] 通知が許可されました');
            } else {
                setStatus('push', 'inactive', '拒否', '通知が拒否されました');
                notifyBtn.textContent = '🔔 通知が拒否されました';
            }
        } catch (error) {
            console.error('[App] 通知許可リクエスト失敗:', error);
        }
    });

    // テスト通知ボタン
    testBtn.addEventListener('click', async () => {
        if (Notification.permission !== 'granted') return;

        const reg = await navigator.serviceWorker.ready;
        await reg.showNotification('テスト通知 🔔', {
            body: 'iOS PWAからの通知テストです！',
            icon: '/icons/icon-192x192.png',
            badge: '/icons/icon-192x192.png',
            tag: 'test-notification',
            data: { url: '/' }
        });
        console.log('[App] テスト通知を送信しました');
    });
}

// --- ネットワーク状態 ---
function detectNetwork() {
    const updateStatus = () => {
        if (navigator.onLine) {
            setStatus('network', 'active', 'オンライン', 'オンライン 🌐');
        } else {
            setStatus('network', 'inactive', 'オフライン', 'オフライン 📴');
        }
    };

    updateStatus();
    window.addEventListener('online', updateStatus);
    window.addEventListener('offline', updateStatus);
}

// --- キャッシュ確認 ---
function setupCacheButton() {
    $('#cacheBtn').addEventListener('click', async () => {
        if (!('caches' in window)) {
            alert('Cache API非対応');
            return;
        }

        const keys = await caches.keys();
        let info = `キャッシュ名: ${keys.join(', ') || 'なし'}\n\n`;

        for (const key of keys) {
            const cache = await caches.open(key);
            const requests = await cache.keys();
            info += `[${key}] ${requests.length}件のリソース\n`;
            requests.forEach((req) => {
                info += `  - ${new URL(req.url).pathname}\n`;
            });
        }

        alert(info);
    });
}

// --- インストールバナー ---
function showInstallBanner() {
    const banner = $('#installBanner');
    const isStandalone = window.navigator.standalone === true;
    const isDismissed = localStorage.getItem('install-banner-dismissed');

    if (!isStandalone && !isDismissed) {
        setTimeout(() => banner.classList.add('visible'), 1500);
    }

    $('#dismissBanner').addEventListener('click', () => {
        banner.classList.remove('visible');
        localStorage.setItem('install-banner-dismissed', 'true');
    });
}

// --- 初期化 ---
document.addEventListener('DOMContentLoaded', () => {
    detectMode();
    registerServiceWorker();
    detectNetwork();
    setupCacheButton();
});
