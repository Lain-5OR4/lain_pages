// microCMS client wrapper around the official SDK.
//
// Reads two env vars (server-side only — never `NEXT_PUBLIC_*` prefixed):
//   MICROCMS_SERVICE_DOMAIN   subdomain part of `<x>.microcms.io`
//   MICROCMS_API_KEY          read-only API key
//
// Used exclusively at build time by Next.js (output: "export"), so the key
// never leaves the build container.

import { type MicroCMSQueries, createClient } from "microcms-js-sdk";

const ENDPOINT = "blogs";

export interface MicroCMSImage {
  url: string;
  width: number;
  height: number;
}

// Schema this code assumes (designed; not yet wired in the microCMS dashboard
// as of the pause point — see docs/blog-microcms.md):
//   title      テキストフィールド
//   subtitle   テキストフィールド (optional)
//   body       テキストエリア (Markdown text)
//   tags       複数選択
//   thumbnail  画像 (optional)
export interface MicroCMSBlogPost {
  id: string; // contentId — used as our URL slug
  title: string;
  subtitle?: string;
  body: string; // markdown text — parsed client-side with `marked`
  tags: string[];
  thumbnail?: MicroCMSImage;
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
