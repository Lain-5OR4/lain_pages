// Blog data layer.
//
// In production this reads from microCMS at build time (Next's static export
// runs these fetchers during `next build` and bakes the result into HTML).
// In local dev without microCMS env vars set, falls back to a single seed
// article in markdown so the editorial styling can be developed end-to-end
// without a CMS account.

import { type MarkdownBlock, estimateReadingMinutes, parseMarkdownToBlocks } from "@/lib/markdown";
import {
  type MicroCMSBlogPost,
  fetchAllPosts,
  fetchPostById,
  isMicroCMSConfigured,
} from "@/lib/microcms";

export interface BlogPost {
  slug: string;
  title: string;
  subtitle?: string;
  date: string; // YYYY-MM-DD
  tags: string[];
  thumbnail?: { url: string; width: number; height: number };
  blocks: MarkdownBlock[];
  readingMinutes: number;
}

async function fromMicroCMS(item: MicroCMSBlogPost): Promise<BlogPost> {
  const blocks = await parseMarkdownToBlocks(item.body);
  return {
    slug: item.id,
    title: item.title,
    subtitle: item.subtitle,
    date: item.publishedAt.slice(0, 10),
    tags: item.tags,
    thumbnail: item.thumbnail,
    blocks,
    readingMinutes: estimateReadingMinutes(item.body),
  };
}

// Dev-only seed: markdown version of the original EXIF article. Renders when
// microCMS isn't configured so the editorial layout keeps working locally.
const DEV_SEED_POSTS: Array<{
  slug: string;
  title: string;
  subtitle: string;
  date: string;
  tags: string[];
  body: string;
}> = [
  {
    slug: "exif-jst-trap",
    title: "EXIFのタイムスタンプとJSTの落とし穴",
    subtitle:
      "photo-diary の撮影日時が 9 時間ずれていた話と、 wall-clock のまま保存し直したらピタッと止まった話。",
    date: "2026-05-18",
    tags: ["cloudflare-workers", "d1", "exif", "javascript"],
    body: `Cloudflare Workers + D1 + R2 で小さな photo-diary を運用している。 アップロード画面はクライアント側で exifr に EXIF を読ませて、 D1 に行を書き、 公開フィードでは現像写真っぽいタイムスタンプを焼き込んで表示する。 dev では特に異常なし。 ところがある日、 すべての写真が撮影時刻ぴったり 9 時間前で焼かれていることに気付いた。 嫌な予感がする数字だった。

この記事はその post-mortem。 9 時間がどこで蒸発したのか、 なぜカメラのタイムスタンプには naive な datetime 文字列が一番素直な形なのか、 そして既存行を backfill せずに新旧両方を読めるようにした小細工までを残しておく。

## exifr が実際に返してくるもの

EXIF の DateTimeOriginal にタイムゾーンは入っていない。 シャッターが切られた瞬間の wall-clock 文字列だ。 たとえば 2026-05-18 14:32:11。 exifr はこれを JS の Date に変換してくれるが、 Date は常に UTC 上の一点を指す型なので、 ゾーンをひとつ選ばないと値が確定しない。 exifr が選ぶのはブラウザのローカル — JST のブラウザで動かせば、 その Date は暗黙のうちに 14:32:11+09:00 を意味することになる。

\`\`\`ts:upload.ts
const { DateTimeOriginal } = await exifr.parse(file);
// DateTimeOriginal はローカル時刻として解釈された Date。
// .toISOString() で UTC に直すと、 9時間分の意味が抜け落ちる。
const stamp = DateTimeOriginal.toISOString();
// "2026-05-18T05:32:11.000Z"  ← 9時間前
\`\`\`

この ISO 文字列を UTC で動いている Worker に送ると、 フィードは律儀に 05:32 と表示する。 カメラは UTC のことなど何も知らない。 Date が知っているふりをしたせいで、 wall-clock が round-trip の途中で捨てられていた。

## 直し方: wall-clock をそのまま保存する

カメラのタイムスタンプは定義上ローカル時刻だ。 だったら格納する形も、 Z も offset も付かない naive な datetime 文字列 — EXIF が元から持っていた桁そのまま — が一番素直になる。 クライアント側では toISOString を経由せず、 Date のコンポーネントから直接組み立てる。

\`\`\`ts:upload.ts
const pad = (n) => String(n).padStart(2, "0");
const d = DateTimeOriginal;
const stamp =
  d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate()) +
  "T" + pad(d.getHours()) + ":" + pad(d.getMinutes()) + ":" + pad(d.getSeconds());
// "2026-05-18T14:32:11"  ← タイムゾーンなし、 wall-clock そのまま
\`\`\`

読み出し側では、 Z や offset を持たない文字列はすでにローカルだと見なして Date のパースをスキップする。 過去に Z 付きで書き込まれてしまった行は、 出力直前に +9h して JST に寄せる。 これで backfill なしに新旧どちらもまっとうに表示できる。

\`\`\`ts:format.ts
const JST_OFFSET_MS = 9 * 60 * 60 * 1000;

export const formatStamp = (s) => {
  if (!s) return "";
  const naive = /^(\\d{4})-(\\d{2})-(\\d{2})[T ](\\d{2}):(\\d{2})/.exec(s);
  if (naive) {
    // naive な wall-clock はそのまま整形して返す
    return \`'\${naive[1].slice(2)} \${naive[2]} \${naive[3]} \${naive[4]}:\${naive[5]}\`;
  }
  // 旧 UTC 文字列は JST にシフトしてから整形する
  const d = new Date(s);
  if (Number.isNaN(d.getTime())) return "";
  const j = new Date(d.getTime() + JST_OFFSET_MS);
  const p = (n) => String(n).padStart(2, "0");
  return \`'\${p(j.getUTCFullYear() % 100)} \${p(j.getUTCMonth() + 1)} \${p(j.getUTCDate())} \${p(j.getUTCHours())}:\${p(j.getUTCMinutes())}\`;
};
\`\`\`

> Date は瞬間を表す型で、 カメラのタイムスタンプは壁掛け時計だ。 バグはふたつの間の変換にしか棲んでいない。

## 持ち帰り

- EXIF DateTimeOriginal はタイムゾーンを持たない値。 Date.toISOString() を通すと意味が壊れる。
- wall-clock データに対しては naive な datetime 文字列 (YYYY-MM-DDTHH:MM:SS) は立派なストレージ形式で、 workaround ではない。
- Workers は UTC で動く。 サーバ側で Date に触る箇所は、 元の文字列がどのゾーンに属していたかを必ず明示しておく。
- 途中でデータ形状を直す時は read 側で分岐させて backfill を回避する。 古い行はそのまま生き残り、 新しい行はクリーンに揃う。

回帰テストは 2 本: naive な文字列がそのまま表示されること、 Z 付きの文字列が +9h されてから表示されること。 それ以来、 時計は正直に動いている。
`,
  },
];

async function devSeedPosts(): Promise<BlogPost[]> {
  return Promise.all(
    DEV_SEED_POSTS.map(async (s) => ({
      slug: s.slug,
      title: s.title,
      subtitle: s.subtitle,
      date: s.date,
      tags: s.tags,
      blocks: await parseMarkdownToBlocks(s.body),
      readingMinutes: estimateReadingMinutes(s.body),
    })),
  );
}

export async function getAllPosts(): Promise<BlogPost[]> {
  if (!isMicroCMSConfigured()) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("[blog] microCMS env not set — using local dev seed posts");
    }
    return devSeedPosts();
  }
  const items = await fetchAllPosts();
  return Promise.all(items.map(fromMicroCMS));
}

export async function getPostBySlug(slug: string): Promise<BlogPost | undefined> {
  if (!isMicroCMSConfigured()) {
    const seeds = await devSeedPosts();
    return seeds.find((p) => p.slug === slug);
  }
  const item = await fetchPostById(slug);
  return item ? fromMicroCMS(item) : undefined;
}
