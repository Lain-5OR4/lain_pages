import { createClient, type MicroCMSQueries } from "microcms-js-sdk";

const ENDPOINT = "blogs";

export interface MicroCMSImage {
  url: string;
  width: number;
  height: number;
}

// Schema (microCMS dashboard):
//   title      テキストフィールド
//   content    リッチエディタ → returns HTML string
//   eyecatch   画像 (optional)
//   category   コンテンツ参照 (optional)
export interface MicroCMSBlogPost {
  id: string;
  title: string;
  content: string;
  eyecatch?: MicroCMSImage;
  category?: { id: string; name: string } | null;
  publishedAt: string;
  updatedAt: string;
  createdAt: string;
  revisedAt: string;
}

export function isMicroCMSConfigured(): boolean {
  return !!process.env.MICROCMS_SERVICE_DOMAIN && !!process.env.MICROCMS_API_KEY;
}

// Cache the client on globalThis so dev HMR doesn't spawn new instances.
const cache = globalThis as unknown as {
  __microCMSClient?: ReturnType<typeof createClient>;
};

function getClient() {
  if (!cache.__microCMSClient) {
    const serviceDomain = process.env.MICROCMS_SERVICE_DOMAIN;
    const apiKey = process.env.MICROCMS_API_KEY;
    if (!serviceDomain || !apiKey) {
      throw new Error("microCMS env vars (MICROCMS_SERVICE_DOMAIN, MICROCMS_API_KEY) are not set");
    }
    cache.__microCMSClient = createClient({ serviceDomain, apiKey });
  }
  return cache.__microCMSClient;
}

export async function fetchAllPosts(queries?: MicroCMSQueries): Promise<MicroCMSBlogPost[]> {
  const data = await getClient().getList<MicroCMSBlogPost>({
    endpoint: ENDPOINT,
    queries: { limit: 100, orders: "-publishedAt", ...queries },
  });
  return data.contents;
}

export async function fetchPostById(id: string): Promise<MicroCMSBlogPost | null> {
  try {
    return await getClient().getListDetail<MicroCMSBlogPost>({
      endpoint: ENDPOINT,
      contentId: id,
    });
  } catch (e) {
    if (e instanceof Error && /404/.test(e.message)) return null;
    throw e;
  }
}
