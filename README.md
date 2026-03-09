# iOS PWA Template 🚀

iOS対応のProgressive Web App（PWA）テンプレートです。  
Service Worker、Web Push通知、オフラインキャッシュ、Apple独自メタタグを完備しています。

## テンプレートとして使う

```bash
# degit でクローン（.git なし）
pnpm dlx degit kn892/webPush my-pwa-app
cd my-pwa-app
pnpm install
```

または GitHub UI の「**Use this template**」ボタンからリポジトリを作成。

### カスタマイズ箇所

| ファイル | 変更箇所 |
|---------|---------|
| `package.json` | `name` |
| `public/manifest.json` | `name`, `short_name`, `description`, `theme_color` |
| `public/index.html` | `<title>`, `apple-mobile-web-app-title`, `theme-color`, ヒーローセクションのテキスト |
| `public/icons/` | アプリ固有のアイコン画像に差し替え |

## セットアップ

```bash
# 依存関係のインストール
pnpm install

# 開発サーバー起動（http://localhost:3000）
pnpm dev

# 別ターミナルでngrokトンネル起動（HTTPS必須）
pnpm tunnel
# または
ngrok http 3000
```

## iOSでのインストール手順

1. iPhoneの **Safari** でngrokのHTTPS URLにアクセス
2. 画面下部の **共有ボタン** (⬆️) をタップ
3. **「ホーム画面に追加」** を選択
4. ホーム画面に追加されたアイコンからアプリを起動

> ⚠️ Push通知を利用するには **iOS 16.4以上** が必要です

## プロジェクト構成

```
webPush/
├── public/              # 静的ファイル
│   ├── index.html       # メインHTML（Apple独自メタタグ含む）
│   ├── manifest.json    # Web App Manifest
│   ├── sw.js            # Service Worker
│   ├── styles.css       # スタイルシート
│   ├── app.js           # メインスクリプト
│   ├── offline.html     # オフラインフォールバック
│   └── icons/           # アプリアイコン
├── server.js            # Express開発サーバー
├── package.json
└── docs/                # ドキュメント
    └── ios_pwa_specification.md  # iOS PWA仕様書
```

## 機能

- ✅ Web App Manifest（iOS対応）
- ✅ Service Worker（オフラインキャッシュ）
- ✅ Web Push通知（iOS 16.4+）
- ✅ Apple独自メタタグ完備
- ✅ Safe Area対応（ノッチ/Dynamic Island）
- ✅ インストール案内バナー（iOS Safari検出）
- ✅ ダークモード/ライトモード対応
- ✅ レスポンシブデザイン
