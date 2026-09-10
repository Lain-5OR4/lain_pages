# site-api

mizora.dev の写真日記・読書記録・ブログ中継・管理画面を担当する Cloudflare Worker。
TypeScript / Hono / Drizzle を使い、D1・R2・microCMS と連携する。

## コードの構成

```text
workers/site-api/
├── src/
│   ├── index.ts                 # Workerの入口・ルートの登録
│   ├── db.ts                    # D1接続の生成
│   ├── schema.ts                # Drizzleのテーブル定義
│   ├── types.ts                 # フロントと共有するAPI型の再公開
│   ├── env.d.ts                 # secret用の環境型を補完
│   ├── cors.ts                  # 公開APIのCORS処理
│   ├── utils.ts                 # 日時・画像拡張子などの共通処理
│   ├── routes/                  # HTTPリクエストとレスポンス
│   │   ├── api.ts               # 写真・読書記録のJSON API
│   │   ├── blog.ts              # microCMSへの中継
│   │   ├── public.ts            # 写真日記のHTML・R2画像配信
│   │   └── admin/
│   │       ├── index.ts         # 管理ルートの登録
│   │       ├── posts.ts         # 写真の管理・アップロード
│   │       └── books.ts         # 本の管理
│   ├── data/                    # データの取得・更新・削除
│   │   ├── posts.ts             # 投稿・画像（削除時はR2も扱う）
│   │   └── books.ts             # 読書記録
│   ├── inputs/
│   │   └── book-form.ts         # 管理フォームから保存用データへ変換
│   ├── serializers/             # DBのデータから公開API形式へ変換
│   │   ├── diary.ts             # 写真URL・日時などの日記形式への変換
│   │   └── book.ts              # 読書記録の項目名・公開項目の変換
│   └── views/                   # サーバーで生成するHTMLと画面用資材
│       ├── layout.ts            # 共通HTMLレイアウト
│       ├── styles.ts            # 共通CSS
│       ├── posts.ts             # 投稿表示
│       ├── books.ts             # 本の編集フォーム
│       ├── admin-posts.ts       # 写真の管理画面
│       ├── admin-books.ts       # 本の管理画面
│       └── upload-script.ts     # ブラウザ側の写真アップロード処理
├── test/                        # API・管理画面・データ操作などのテスト
│   └── fixtures/                # テスト用の共通初期化処理
├── migrations/                  # 既存のSQLマイグレーション
├── schema.sql                   # DBの初期化用SQL（既存テーブルを削除する）
├── seed-dev.sql                 # 開発用データ
├── wrangler.jsonc               # Worker・D1・R2などの設定
├── worker-configuration.d.ts    # Wranglerが生成する環境の型定義
├── vitest.config.mts            # Workers環境でのテスト設定
├── tsconfig.json                # TypeScriptの設定
├── package.json                 # 依存関係・実行コマンド
├── bun.lockb                    # 依存バージョンの固定
├── .dev.vars.example            # ローカル環境変数の記入例
└── ACCESS.md                    # 管理画面のAccess設定手順
```

ルートではHTTPと保存処理を扱い、表示関数には取得済みデータを渡す。
表示側からD1・R2へのアクセスは行わない。
公開APIは `routes → data → serializers`、管理画面の表示は
`routes/admin → data → views` の順に処理を追える。
写真一覧の画像取得は、表示対象の投稿に限定する。

## ローカル検証

`workers/site-api` で依存を復元した後に実行する。

```sh
bun install --frozen-lockfile
bun run test --run
bunx tsc --noEmit
bunx tsc --noEmit -p test/tsconfig.json
```

管理ルート・表示の分割前後で、既存の5ファイル・54テストと型チェックが成功した。
続くデータ操作・API変換の分離では、画像取得範囲・空一覧・並び順・日時変換の
9テストを追加し、7ファイル・63テストと型チェックが成功した。
現在のロックファイルのローカル実行環境では、compatibility date が
`2026-05-03` から対応上限の `2026-03-10` にフォールバックする警告が出る。
本番設定や依存バージョンの変更は、この構造整理とは別に扱う。

## 命名と現在のデプロイ先

| 対象 | 名前 |
| --- | --- |
| ソースディレクトリ | `workers/site-api/` |
| package.json | `site-api` |
| 現在のCloudflare Worker | `photo-diary` |
| 将来のWorker名 | `mizora-api`（移行前） |
| 公開URL | `https://api.mizora.dev` |
| D1 | `photo-diary-db` / binding `DB` |
| R2 | `photo-diary-photos` / binding `BUCKET` |

コードの改名では `wrangler.jsonc` のnameやリソースIDを変えない。
記事タイトルや写真日記のページ名としての `photo-diary` もコードの配置名とは別物なので維持する。

## ディレクトリ変更を反映するとき

Workers Builds は GitHub と連携している。旧パスを参照する外部設定はgitの改名では更新されない。
**改名コミットをpushする前に**、Cloudflare側で現在のルートディレクトリを確認し、旧パスを使っていれば `workers/site-api` に変更する。
ビルド・デプロイコマンドや監視対象パスに旧パスがあれば同様に更新する。フロント側の監視対象設定も確認する。
この設定変更はまだ実施・検証していない。

既存の `bun.lockb` を維持し、依存更新は改名と混ぜない。依存を復元した環境で非watchの `vitest run` と `tsc --noEmit` を実行する。

## 将来の mizora-api 移行

1. 現在のカスタムドメイン、Access、Workers Builds、bindings、secret名と環境設定を棚卸しする。secret値をリポジトリへ保存しない。
2. `mizora-api` を別のデプロイ先として準備し、同じD1/R2をbindingする。DBやバケットを作り直さない。
3. secretの再設定、build連携、ログ等を揃える。管理ルートがAccessを経由しない公開経路を作らない。
4. 認証された確認経路を用意し、公開API・管理フォーム・画像配信を確認する。
5. `api.mizora.dev` の接続先を切り替え、Access保護とフロントの疎通を確認する。
6. 問題時は旧Workerへ接続先を戻せるよう残しておく。旧Worker削除は別の判断とする。

これは移行方針であり、実行時にはCloudflareの現行仕様と実アカウント設定を確認して具体化する。
今回のコード改名で本番リソース移行やDBマイグレーションは行わない。
