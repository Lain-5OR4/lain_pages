# 開発・自動検証

依存復元とスクリプト実行にはBun 1.4.2を使用する。Next.jsや検証ツール向けにNode.js 22も用意する。
ルートと `workers/site-api` の既存 `bun.lockb` を維持し、依存バージョンやロック形式は変更しない。ルートに元から存在する `package-lock.json` も今回削除しない。

## 初回準備

```sh
bun install --frozen-lockfile
cd workers/site-api
bun install --frozen-lockfile
cd ../..
```

## 手元でのチェック

```sh
bun run check
bun run typecheck
bun run check:worker
bun run build
bun run check:export
```

ビルドスクリプトはWindowsでも同じコマンドで動く。ビルド確認はCIではPR時のみ実行する。

`bun run format` はフロント・共有型・検証スクリプト・Workerソース/テストを整形する。
生成されたWorker型定義は対象外。CSSは現在のBiome設定の対象外であり、CSS整形は次のリファクタリングで別途導入する。

## CIとデプロイ

`.github/workflows/ci.yml` はmainへのpushと全PRで以下を実行する。外部サービスの秘密情報は不要。

- Code and types: コードチェックとフロント型チェック。
- Build（PR時のみ）: 通常版の静的ビルドと、主要ページのNext.js資材のパス・出力ファイルの存在確認。
- Worker types and tests: Worker本体とテストの型チェック、Vitestの非watch実行。

静的出力チェックはブラウザE2Eや全リンク検査の代替ではない。CMS未設定時のビルドを確認するもので、実CMSの内容は検証しない。

CloudflareのGitHub連携による自動デプロイとは独立したCI。push時に重複するビルドは行わない。GitHub Pages用ワークフロー・コマンド・サブパス設定は削除した。
マージを必ずブロックしたい場合は、GitHubのrulesetで上記CIを必須チェックに指定する必要がある（今回リポジトリ設定は変更しない）。

## Worker名

`wrangler.jsonc` のnameは指定に合わせて `site-api` に変更した。D1/R2の既存バインディング・リソース名・カスタムドメイン設定は継続する。
これはCloudflare上の既存Workerをその場で改名する操作ではない。次回のデプロイは新しいWorker名を対象とするため、既存の `api.mizora.dev` の割り当て移行を確認すること。今回はデプロイしていない。

## 今回の検証結果（2026-09-13）

- コードチェック: 99ファイル成功。
- フロント、Worker本体、Workerテストの型チェック: 成功。
- Bun 1.4.2でルートとWorkerの `bun install --frozen-lockfile` が成功。既存の `bun.lockb` とルートの `package-lock.json` に変更はない。
- Bun経由でコードチェック99ファイル、フロントとWorker本体・テストの型チェック、7ファイル・63テストが成功。
- WorkerテストのローカルRuntimeは設定の互換日付 `2026-05-03` をサポートせず、`2026-03-10` にフォールバックする警告がある。本番と同じ互換日付での保証には、テストRuntimeの更新が必要。
- 通常版のビルド・静的出力チェックが成功。GitHub Pages向けの検証は廃止した。
- 新しいCIのGitHub上での実行は未実施。

Google Fontsの単体取得は成功する一方、ビルド中に接続タイムアウトが再現した。HTTPSのホストごとの同時接続を6本に制限した試行ではビルドが成功したため、`scripts/build-network.mjs` をビルド時のみ読み込む。接続数が影響している可能性はあるが、ネットワーク側の根本原因までは特定していない。フォント・依存バージョンは変更していない。外部取得自体は継続するため、オフラインビルドへの対応ではない。

## ローカル検証データの提案（未導入）

### 推奨: 固定fixture + MSW + WranglerローカルDB

1. 画面単体の調整: MSWで `/api/books` と `/api/diary` を置き換える。通常・空・長文・画像なし・500エラー・遅延を切り替える。アプリ本体のfetch経路を使えるため、画面内にモック分岐を増やさずに済む。
2. 登録・更新・削除の確認: `wrangler dev` のローカルD1/R2を使う。共有の固定データをseedし、実際の保存処理を通す。DB操作では `--local` を明示し、本番へ接続しない。
3. 自動テスト: 既存のVitest/Cloudflare統合を維持する。fixtureの値は共用しつつ、DB初期化はmigration統一の改修と合わせる。

このユーザー環境ではスマホのLANアクセスも重要。MSWのブラウザ版はService Workerを使うため、PCのlocalhostでは使えても `http://192.168.x.x` では利用条件を満たさない。スマホのHTTPプレビューはローカルAPIをPC側で動かして同一オリジンへプロキシする構成を推奨し、MSWを使いたい場合は端末が信頼するHTTPS環境を別途整える。

fixtureは `shared/fixtures/` に置き、`satisfies Book[]` 等で共有型との整合を確認する案がよい。画像もローカル固定素材にすると外部画像サイトの状態に左右されない。
ランダム大量データが必要になった場合のみFakerを追加し、seed・基準日時・バージョンを固定する。通常の見た目確認は手書きの代表例の方が安定する。

想定する起動モード（今後追加する案であり、現時点のコマンドではない）:
- mock: 固定シナリオでUIを確認。
- local: ローカルAPI/DBと連携し、スマホからも確認。
- live: 明示的に実APIの公開データを参照。開発環境だからという理由で自動選択しない。

MSWやFakerは今回インストールしていない。現在の日記画面のdevelopment時モック分岐も、API取得統一の段階で置き換える。

参考:
- [MSW Browser integration](https://mswjs.io/docs/integrations/browser/)
- [Cloudflare D1 local development](https://developers.cloudflare.com/d1/best-practices/local-development/)
- [Faker Usage / reproducible results](https://fakerjs.dev/guide/usage.html)
