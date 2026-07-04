import {
  type MicroCMSBlogPost,
  fetchAllPosts,
  fetchPostById,
  isMicroCMSConfigured,
} from "@/lib/microcms";
import { marked } from "marked";

export function estimateReadingMinutes(md: string): number {
  // Mixed Japanese/English; ~600 visible chars/min is a reasonable rough rate.
  const chars = md.replace(/\s+/g, "").length;
  return Math.max(1, Math.round(chars / 600));
}

export interface BlogPost {
  slug: string;
  title: string;
  date: string;
  category?: string;
  eyecatch?: { url: string; width: number; height: number };
  contentHtml: string;
  readingMinutes: number;
}

async function fromMicroCMS(item: MicroCMSBlogPost): Promise<BlogPost> {
  // Rich editor wraps lines in <p> tags, which prevents marked from seeing
  // markdown syntax. Strip the HTML wrapper back to plain text first.
  const markdown = item.content
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<p[^>]*>/gi, "")
    .replace(/<[^>]+>/g, "")
    .trim();
  const contentHtml = await marked.parse(markdown);
  return {
    slug: item.id,
    title: item.title,
    date: item.publishedAt.slice(0, 10),
    category: item.category?.name,
    eyecatch: item.eyecatch,
    contentHtml,
    readingMinutes: estimateReadingMinutes(item.content.replace(/<[^>]*>/g, "")),
  };
}

// Dev seed rendered as HTML so the layout works without a microCMS account.
const DEV_SEED_MD = `Cloudflare Workers + D1 + R2 で小さな photo-diary を運用している。アップロード画面はクライアント側で exifr に EXIF を読ませて、D1 に行を書き、公開フィードでは現像写真っぽいタイムスタンプを焼き込んで表示する。dev では特に異常なし。ところがある日、すべての写真が撮影時刻ぴったり 9 時間前で焼かれていることに気付いた。

## exifr が実際に返してくるもの

EXIF の DateTimeOriginal にタイムゾーンは入っていない。シャッターが切られた瞬間の wall-clock 文字列だ。exifr はこれを JS の Date に変換してくれるが、Date は常に UTC 上の一点を指す型なので、ゾーンをひとつ選ばないと値が確定しない。

\`\`\`ts
const { DateTimeOriginal } = await exifr.parse(file);
const stamp = DateTimeOriginal.toISOString();
// "2026-05-18T05:32:11.000Z" ← 9時間前
\`\`\`

## 直し方: wall-clock をそのまま保存する

カメラのタイムスタンプは定義上ローカル時刻だ。格納する形も naive な datetime 文字列が一番素直になる。

\`\`\`ts
const pad = (n) => String(n).padStart(2, "0");
const d = DateTimeOriginal;
const stamp = d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate())
  + "T" + pad(d.getHours()) + ":" + pad(d.getMinutes()) + ":" + pad(d.getSeconds());
// "2026-05-18T14:32:11" ← wall-clock そのまま
\`\`\`

> Date は瞬間を表す型で、カメラのタイムスタンプは壁掛け時計だ。
`;

async function devSeedPosts(): Promise<BlogPost[]> {
  const contentHtml = await marked.parse(DEV_SEED_MD);
  return [
    {
      slug: "exif-jst-trap",
      title: "EXIFのタイムスタンプとJSTの落とし穴",
      date: "2026-05-18",
      category: "cloudflare",
      contentHtml,
      readingMinutes: estimateReadingMinutes(DEV_SEED_MD),
    },
  ];
}

// Seed posts are dev-only: a production build without microCMS env vars gets
// an empty blog instead of publishing the placeholder article.
function fallbackPosts(): Promise<BlogPost[]> {
  console.warn("[blog] microCMS env not set — using local dev seed posts");
  if (process.env.NODE_ENV === "production") return Promise.resolve([]);
  return devSeedPosts();
}

export async function getAllPosts(): Promise<BlogPost[]> {
  if (!isMicroCMSConfigured()) return fallbackPosts();
  const items = await fetchAllPosts();
  return Promise.all(items.map(fromMicroCMS));
}

export async function getPostBySlug(slug: string): Promise<BlogPost | undefined> {
  if (!isMicroCMSConfigured()) {
    return (await fallbackPosts()).find((p) => p.slug === slug);
  }
  const item = await fetchPostById(slug);
  return item ? fromMicroCMS(item) : undefined;
}
