import { asc, desc, eq, inArray } from "drizzle-orm";
import { createDb } from "../db";
import { postImages, posts } from "../schema";

type Post = typeof posts.$inferSelect;
type PostImageRow = typeof postImages.$inferSelect;
type PostImage = { key: string; taken_at: string | null };
export type PostWithImages = Post & { images: PostImage[] };

const mergeImages = (allPosts: Post[], allImages: PostImageRow[]): PostWithImages[] => {
  const byPost = new Map<number, PostImage[]>();
  for (const r of allImages) {
    const img: PostImage = { key: r.r2_key, taken_at: r.taken_at };
    const arr = byPost.get(r.post_id);
    if (arr) arr.push(img);
    else byPost.set(r.post_id, [img]);
  }
  return allPosts.map((p) => ({ ...p, images: byPost.get(p.id) ?? [] }));
};

export const getRecentPosts = async (d1: D1Database, limit = 50): Promise<PostWithImages[]> => {
  const db = createDb(d1);
  const allPosts = await db
    .select()
    .from(posts)
    .orderBy(desc(posts.posted_on), desc(posts.id))
    .limit(limit);
  if (allPosts.length === 0) return [];

  const allImages = await db
    .select()
    .from(postImages)
    .where(
      inArray(
        postImages.post_id,
        allPosts.map((post) => post.id),
      ),
    )
    .orderBy(asc(postImages.post_id), asc(postImages.sort_order));
  return mergeImages(allPosts, allImages);
};

export const getPost = async (d1: D1Database, id: number): Promise<PostWithImages | null> => {
  const db = createDb(d1);
  const [post] = await db.select().from(posts).where(eq(posts.id, id)).limit(1);
  if (!post) return null;
  const imgs = await db
    .select()
    .from(postImages)
    .where(eq(postImages.post_id, id))
    .orderBy(asc(postImages.sort_order));
  return { ...post, images: imgs.map((r) => ({ key: r.r2_key, taken_at: r.taken_at })) };
};

export const deletePost = async (env: Env, id: number): Promise<boolean> => {
  const db = createDb(env.DB);
  const [post] = await db.select({ id: posts.id }).from(posts).where(eq(posts.id, id)).limit(1);
  if (!post) return false;
  const imgs = await db
    .select({ r2_key: postImages.r2_key })
    .from(postImages)
    .where(eq(postImages.post_id, id));
  if (imgs.length > 0) await env.BUCKET.delete(imgs.map((r) => r.r2_key));
  await db.batch([
    db.delete(postImages).where(eq(postImages.post_id, id)),
    db.delete(posts).where(eq(posts.id, id)),
  ]);
  return true;
};
