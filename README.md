# 🏠 東京賃貸物件マップ

1都3県（東京・神奈川・埼玉・千葉）の賃貸物件を地図上に可視化するWebアプリです。

![東京賃貸物件マップ](https://img.shields.io/badge/Next.js-16-black?logo=next.js) ![Deck.gl](https://img.shields.io/badge/Deck.gl-9-blue) ![MapLibre](https://img.shields.io/badge/MapLibre-GL-green) ![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)

---

## 📸 スクリーンショット

地図上に800件超の物件マーカーを表示。色で価格帯を直感的に把握できます。

| カラー | 価格帯 |
|--------|--------|
| 🟢 緑 | 〜¥10万/月 |
| 🟡 黄 | ¥10万〜¥20万/月 |
| 🔴 赤 | ¥20万〜/月 |

---

## ✨ 機能

- **地図表示** — 国土地理院タイルをベースに物件マーカーを重ねて表示
- **価格帯フィルター** — ボタン1クリックで表示する価格帯を切り替え
- **場所検索** — 地名・住所を入力してその場所にスムーズに移動（Nominatim API）
- **物件詳細パネル** — マーカーをクリックすると間取り・広さ・最寄駅・建築年を表示
- **800件超のデータ** — 1都3県の主要市区町村をカバー
- **国土交通省APIフォールバック** — ネットワーク環境が許す場合は実際の取引価格データを取得

---

## 🛠 技術スタック

| カテゴリ | 技術 |
|----------|------|
| フレームワーク | [Next.js 16](https://nextjs.org/) (App Router) |
| 地図レンダリング | [Deck.gl 9](https://deck.gl/) + [react-map-gl](https://visgl.github.io/react-map-gl/) |
| 地図タイル | [MapLibre GL JS](https://maplibre.org/) + [国土地理院タイル](https://maps.gsi.go.jp/development/ichiran.html) |
| スタイリング | [Tailwind CSS v4](https://tailwindcss.com/) |
| 言語 | TypeScript |
| 場所検索 | [Nominatim (OpenStreetMap)](https://nominatim.org/) |
| 物件データ | [国土交通省 不動産取引価格情報](https://www.land.mlit.go.jp/webland/) / 生成データ（フォールバック） |

---

## 🚀 セットアップ

### 必要環境

- Node.js 20+
- npm 10+

### インストール・起動

```bash
# リポジトリのクローン
git clone https://github.com/moruku36/tokyo-realestate-map.git
cd tokyo-realestate-map

# 依存関係のインストール
npm install

# 開発サーバー起動
npm run dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開いてください。

### ビルド

```bash
npm run build
npm start
```

---

## 📁 ディレクトリ構成

```
src/
├── app/
│   ├── api/
│   │   └── properties/
│   │       └── route.ts        # 物件データAPI（国土交通省API + フォールバック）
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx                # メインページ
├── components/
│   ├── FilterBar.tsx           # 価格帯フィルター + 場所検索バー
│   ├── Map.tsx                 # Deck.gl地図コンポーネント
│   └── PropertyPanel.tsx       # 物件詳細パネル
├── data/
│   ├── generated-properties.ts # フォールバック用生成物件データ
│   ├── municipalities.ts       # 市区町村座標ルックアップテーブル
│   └── properties.ts           # 初期サンプルデータ
└── types/
    └── property.ts             # 物件データ型定義
```

---

## 📊 データについて

### 物件データの取得方法

1. **国土交通省 不動産取引価格情報API** — ネットワーク環境が利用可能な場合、2023〜2024年の中古マンション取引データを取得し、取引価格から月額家賃を推定（年間利回り4%換算）
2. **フォールバック生成データ** — API接続不可の場合、1都3県の主要市区町村ごとに地域別家賃相場に基づいたリアルな物件データを800件超生成

> ⚠️ 表示される家賃は推定値・参考値です。実際の賃貸物件の情報ではありません。

---

## 📝 ライセンス

MIT License

---

## 🙏 使用データ・API

- [国土地理院タイル](https://maps.gsi.go.jp/development/ichiran.html) — 地図タイル
- [国土交通省 不動産取引価格情報](https://www.land.mlit.go.jp/webland/) — 取引データ
- [Nominatim / OpenStreetMap](https://nominatim.org/) — ジオコーディング（場所検索）
