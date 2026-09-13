# Lain Pages

> [English](README.md) | **日本語**

> 開発・CIの最新手順: [DEVELOPMENT.md](DEVELOPMENT.md)。CloudflareのGitHub連携で自動デプロイします。
Next.jsで構築した個人サイト。Cloudflare PagesのGitHub連携で自動デプロイします。

## 🌟 機能

- **個人ポートフォリオ**: アニメーション雨エフェクト付きのモダンなダークテーマホームページ
- **ミニアプリケーション**: インタラクティブなウェブツールのコレクション
  - **TextDelta**: 文字レベル・行レベル比較モード付きの高度なテキスト差分ビューア

## 🛠️ 技術スタック

- **フレームワーク**: Next.js 15 with TypeScript
- **スタイリング**: Tailwind CSS + shadcn/ui components
- **コード品質**: Biome (ESLint + Prettier代替)
- **デプロイ**: Cloudflare PagesのGitHub連携
- **フォント**: LoveLetter、Geist Sans、Geist Monoなどのカスタムフォント

## 📱 ミニアプリ

### TextDelta
WinMergeにインスパイアされた高機能なテキスト比較ツール：
- **2つの表示モード**: GitHub風とUnified diff
- **2つの比較レベル**: 行レベルと文字レベルのハイライト
- **リアルタイム比較**: 瞬時の差分計算と可視化
- **クリーンなUI**: 明確な視覚的指標を持つモダンでアクセシブルなインターフェース

## 🔧 開発

### 前提条件
- Node.js 22
- Bun 1.4.2

## 🚀 デプロイ

mainへのpushとPRではコード・型チェックとWorkerテストを実行します。ビルド確認はPR時のみ。デプロイはCloudflareのGitHub連携が担当します。

### CI/CDパイプライン
1. **Lint Check**: Biomeリンターによる検証
2. **Format Check**: コードフォーマットの確認
3. **Tests**: Workerの型チェック・Vitestテスト
4. **Build**: PR時のみNext.js静的エクスポートを確認
5. **Deploy**: CloudflareのGitHub連携による自動デプロイ

CIとCloudflareのデプロイは独立しています。CIの成功をマージ条件にする場合はGitHubのrulesetを設定します。CIがデプロイを自動で停止させる構成ではありません。

## 🎨 デザイン機能

- **雨エフェクト**: ホームページのアニメーション背景雨エフェクト（TextDeltaでは無効）
- **ダークテーマ**: マトリックス風の緑と黒の配色
- **レスポンシブデザイン**: モバイルフレンドリーなレイアウト
- **カスタムタイポグラフィ**: 視覚的魅力を高めるスタイル化されたフォント
- **グリッチエフェクト**: サイバーパンク美学のためのCSSアニメーション

## 📁 プロジェクト構造

```
├── src/
│   ├── app/                    # Next.js app routerページ
│   │   ├── text-delta/         # TextDeltaミニアプリ
│   │   ├── fonts/              # カスタムフォントファイル
│   │   └── styles/             # グローバルスタイルとアニメーション
│   ├── components/             # Reactコンポーネント
│   │   ├── ui/                 # shadcn/uiコンポーネント
│   │   ├── background/         # 雨エフェクトと条件付きレンダリング
│   │   ├── audio/              # バックグラウンドミュージックプレーヤー
│   │   └── footer/             # サイトフッター
│   └── hooks/                  # カスタムReactフック
├── public/                     # 静的アセット
│   └── assets/                 # 画像とロゴ
├── .github/workflows/          # CI/CD設定
└── out/                        # ビルド済み静的ファイル（生成）
```

## 🔧 設定

### Biome設定
コード品質は以下を含むBiomeで強制されます：
- ESLint風のリンティングルール
- Prettier風のフォーマット
- TypeScriptサポート
- ファイルタイプフィルタリング（js, ts, jsx, tsx, json）

## 🎯 今後の計画

- [ ] 追加のミニアプリケーション
- [ ] ダーク/ライトテーマ切り替え
- [ ] より多くのインタラクティブアニメーション
- [ ] ブログセクション
- [ ] お問い合わせフォーム
