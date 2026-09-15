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
│   └── setup.ts                 # migration適用とテストデータ初期化
├── migrations/                  # 既存のSQLマイグレーション
├── reset-dev.sql                # ローカル専用リセット（初期化はmigrationを適用）
├── DATABASE.md                  # DB定義・migration・既存DBの移行手順
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
bun run test:run
bun run typecheck
bun run typecheck:test
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

既存の `bun.lockb` を維持し、`bun install --frozen-lockfile` で復元する。依存更新は今回の改修に含めない。依存を復元した環境で非watchの `vitest run` と `tsc --noEmit` を実行する。

## 将来の mizora-api 移行

1. 現在のカスタムドメイン、Access、Workers Builds、bindings、secret名と環境設定を棚卸しする。secret値をリポジトリへ保存しない。
2. `mizora-api` を別のデプロイ先として準備し、同じD1/R2をbindingする。DBやバケットを作り直さない。
3. secretの再設定、build連携、ログ等を揃える。管理ルートがAccessを経由しない公開経路を作らない。
4. 認証された確認経路を用意し、公開API・管理フォーム・画像配信を確認する。
5. `api.mizora.dev` の接続先を切り替え、Access保護とフロントの疎通を確認する。
6. 問題時は旧Workerへ接続先を戻せるよう残しておく。旧Worker削除は別の判断とする。

これは移行方針であり、実行時にはCloudflareの現行仕様と実アカウント設定を確認して具体化する。
今回のコード改名で本番リソース移行やDBマイグレーションは行わない。

## 写真保存の失敗対策

`src/services/create-post.ts` が投稿作成と画像保存を担当する。画像は順次アップロードし、全画像が保存できた後に画像行を登録する。保存に失敗したら、書き込みを試みたキーの記録と対象投稿の画像行・投稿行の削除をD1の同一batchで行い、その成功後にR2画像を削除する。

新規投稿は非公開で作り、R2書き込み前に全保存予定キーをDBへ記録する。全画像保存後に公開し、公開一覧・詳細・画像配信には保存中の投稿を出さない。初回INSERTの応答喪失は識別子から回復し、公開更新の応答だけ失われた場合はDBを確認して成功扱いにする。

DBの後片付けが失敗した場合はR2画像を保持し、投稿ID・識別子・失敗段階をログに残す。中断した投稿は管理画面の「保存中・未完了の投稿」から削除できる。アップロード終了・中断を確認してから操作する。後片付け記録が残っていれば削除を再試行可能。重複送信、自動回復、稼働中処理との排他は今後の対応。詳細は [REFACTORING.md](../../REFACTORING.md) の項目2を参照。

## 写真削除の再試行

`src/services/delete-post.ts` が削除を担当する。画像キーの記録と投稿行の削除をD1の同一トランザクションで行い、その後R2画像を削除する。すべて完了するまで `post_deletions` の記録を残す。

失敗した削除は管理画面の「写真の削除が完了していない投稿」から再試行できる。途中で削除できた画像は、再試行で再度削除対象にしても問題ない。自動再試行やキャッシュの即時無効化は含めていない。デプロイ前に0005・0006の適用が必要。既存DBへの適用方法は [DATABASE.md](DATABASE.md) を参照。

## 開発・検証の共通手順

DB定義の基準とテスト初期化、ローカル起動前の準備は [DATABASE.md](DATABASE.md) を参照。

[DEVELOPMENT.md](../../DEVELOPMENT.md) にCIとローカル検証の手順を記載。Worker名は `site-api`。既存Cloudflareリソースへの切り替えは次回デプロイ時に確認する。
