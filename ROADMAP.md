# mizora.dev ポートフォリオ洗練ロードマップ

2026-07-07 時点の現状整理と、ポートフォリオとして磨いていくための段階的な計画。
上から順にやる必要はないが、Phase 0 → 1 は先に済ませると後がすべて楽になる。

## 現状サマリ

| 領域 | 状態 |
|---|---|
| ホーム | Matrix雨 + グリッチ + プロフィール/PROJECTSカード。Mizoraリブランド済み |
| /diary | worker (D1+R2) 連携済み、コルクボードUI完成度高い |
| /blog | microCMS連携実装済み。**本番は環境変数未設定で意図的に空** |
| /text-delta, /fragments, /void | ミニアプリ群。遊び心枠 |
| worker | テスト28件、CORS/ホスト/画像配信のハードニング済み |
| SEO/メタ | **OGP・og:image・sitemap・robots.txt なし**。title/description は最低限 |
| footer | ソーシャルボタンが**リンクなしの飾り** |

### 実験からの学び

- ホームのターミナルUI置き換えは試作 → 却下(2026-07-04)。
  **「既存の世界観を置き換える」より「小さく追加する」方向が合う。**

---

## Phase 0: 公開の土台(残タスクの回収)

すでに作ったものを世に出すフェーズ。作業量は少なく効果が最大。

- [ ] 未プッシュコミットを `git push`(ブログ修正・リファクタ・セキュリティ強化が溜まっている)。
      push で Pages / Workers 両方が GitHub 連携により自動デプロイされる
- [ ] デプロイ後確認: `photo-diary.<account>.workers.dev` が閉じていること(workers.dev 無効化の反映確認)
- [ ] ブログを公開する時: Cloudflare Pages に `MICROCMS_SERVICE_DOMAIN` / `MICROCMS_API_KEY` を設定して再デプロイ(それまで /blog は空表示のままでOK)

## Phase 1: ポートフォリオの基本装備

「人に見せるページ」として欠けている定番要素。デザイン変更なしで足せるものが中心。

- [ ] **OGP / メタデータ整備** — `src/app/layout.tsx` に `openGraph` / `twitter` を追加、
      OG画像を1枚作る(Matrix風のシンプルなものでよい)。blog/diaryはページ別に上書き
- [ ] **footer のソーシャルリンクを実リンクに** — 最低 GitHub。リンク先がないなら消す方が誠実
- [ ] **PROJECTS に「実績」を足す** — 今はミニアプリへの内部リンクのみ。
      GitHubリポジトリへのリンク + 使用技術(このサイト自体が Next.js + CF Workers + D1 + R2 の実績)
- [ ] **sitemap.xml / robots.txt** — 静的エクスポートなので `app/sitemap.ts` / `app/robots.ts` で生成
- [ ] **`<html lang>` の見直し** — 現在 `en` だがコンテンツは日英混在。`ja` が実態に近い
- [ ] **カスタム404** — 世界観に合う not-found ページ(`app/not-found.tsx`)。今はNextのデフォルト

## Phase 2: コンテンツの充実

箱より中身。ポートフォリオの説得力は更新され続けていることから生まれる。

- [ ] **blog 記事を書く** — まず「このサイトの構成」(Next静的エクスポート + Workers + microCMS)が鉄板ネタ。
      diary の EXIF/JST の話も dev シード記事としてすでに種がある
- [ ] **RSS フィード** — `app/feed.xml/route.ts` でビルド時生成。ブログをやるなら必須級
- [ ] **下書きプレビュー** — worker の `/api/blog/:id?draftKey=` は実装済み・未利用。
      クライアントで draftKey を読むプレビューページを1枚足すだけで使える
- [ ] **diary の継続 + 拡張** — 過去アイデア: 地図ページ / フィルム風タイムライン切り替え
- [ ] **READING_LOGS の内製化検討** — 外部 Notion 依存を blog のカテゴリ or 専用ページへ(任意)

## Phase 3: 回遊性と遊び

世界観を活かした「もう1クリックさせる」仕掛け。追加型で小さく。

- [ ] **ページ間ナビの補強** — diary/blog からホーム以外への導線が薄い。
      各世界観のフッターに他ページへの控えめなリンク群
- [ ] **ホームに最新コンテンツの気配** — 最新 diary/blog 1件ずつをカードに一行表示(INCOMING_TRANSMISSION 案の縮小版。UI置き換えなし)
- [ ] **easter egg** — Konami コード or 特定タイプで /void へグリッチ遷移(過去アイデア)
- [ ] **void の続きレイヤー** — THE_WIRED の先にもう一層(過去アイデア)
- [ ] **BGM と diary の紐付け** — 「この日聴いてた曲」(過去アイデア、優先度低)

## Phase 4: 品質と運用

地味だが「わかってる人が作ってる」感はここに出る。

- [ ] **フォントの棚卸し** — root layout で7書体読み込み中。使用状況を調べてサブセット/削減(LCP改善)
- [ ] **画像最適化** — R2画像は2048px固定。diary グリッド用に小さいバリアント配信を検討
- [ ] **アクセシビリティ** — reduced-motion 対応(雨/グリッチ)、コントラスト、キーボード操作
- [ ] **CI にworkerテストを組み込む** — 現在ローカルのみ。push時に `npm test` を回す workflow
- [ ] **microCMS webhook → CF Pages deploy hook** — 記事公開で自動再ビルド(手動デプロイ卒業)
- [ ] **Cloudflare Web Analytics** — cookieless なのでバナー不要で計測できる
- [ ] **worker/D1 の命名見直し**(優先度低) — `workers/photo-diary` は今や写真日記・読書記録・blogプロキシを兼ねる汎用APIになっており実態と乖離。ただしWorker名変更は事実上「新規Worker作成」相当(カスタムドメインルート付け替え・Access設定見直し・secret再設定が必要)で、D1の`database_name`(`photo-diary-db`)もwranglerにrenameコマンドがなく変えるには作り直しが必要。当面はコード側(フォルダ名やCLAUDE.mdの説明)だけ実態に合わせる程度に留め、本番リソースの改名は後回し(2026-08-23 検討・保留)

---

## 優先順位の考え方

1. **Phase 0 は今すぐ**(数分、すでに完成しているものの公開)
2. **Phase 1 → 2 の順で「見せられる状態」を作る**(OGP なしで記事をシェアすると損をする)
3. Phase 3 は書くネタ・作るネタが溜まってから気分で
4. Phase 4 は他フェーズの合間に1個ずつ

更新履歴: 2026-07-07 初版(Claude と作成)
