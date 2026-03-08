// Dev Server — Express
// manifest.jsonの正しいMIMEタイプ設定を含む静的ファイルサーバー
import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = join(__dirname, 'public');

// manifest.jsonの正しいContent-Type
app.get('/manifest.json', (req, res) => {
    res.setHeader('Content-Type', 'application/manifest+json');
    res.sendFile(join(PUBLIC_DIR, 'manifest.json'));
});

// Service Workerのスコープ設定
app.get('/sw.js', (req, res) => {
    res.setHeader('Content-Type', 'application/javascript');
    res.setHeader('Service-Worker-Allowed', '/');
    res.sendFile(join(PUBLIC_DIR, 'sw.js'));
});

// 静的ファイル配信
app.use(express.static(PUBLIC_DIR));

// SPA用フォールバック（Express 5 対応ルーティング）
app.get('/{*splat}', (req, res) => {
    res.sendFile(join(PUBLIC_DIR, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`\n🚀 PWA Dev Server 起動中`);
    console.log(`   ローカル:  http://localhost:${PORT}`);
    console.log(`\n   ngrokでHTTPSトンネルを開くには:`);
    console.log(`   $ ngrok http ${PORT}\n`);
});
