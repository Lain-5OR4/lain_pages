# site-api

mizora.dev の写真日記・読書記録・ブログ中継・管理画面を担当する Cloudflare Worker。
TypeScript / Hono / Drizzle を使い、D1・R2・microCMS と連携する。

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
