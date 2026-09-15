import { and, asc, desc, eq, inArray } from "drizzle-orm";
import { createDb } from "../db";
import { postImages, posts } from "../schema";

const publicPostFields = {
  id: posts.id,
  title: posts.title,
  caption: posts.caption,
  posted_on: posts.posted_on,
  created_at: posts.created_at,
};
type Post = Pick<typeof posts.$inferSelect, keyof typeof publicPostFields>;
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
    .select(publicPostFields)
    .from(posts)
    .where(eq(posts.publication_state, "published"))
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
  const [post] = await db
    .select(publicPostFields)
    .from(posts)
    .where(and(eq(posts.id, id), eq(posts.publication_state, "published")))
    .limit(1);
  if (!post) return null;
  const imgs = await db
    .select()
    .from(postImages)
    .where(eq(postImages.post_id, id))
    .orderBy(asc(postImages.sort_order));
  return { ...post, images: imgs.map((r) => ({ key: r.r2_key, taken_at: r.taken_at })) };
};

export const isPublicPostImage = async (d1: D1Database, key: string): Promise<boolean> => {
  const rows = await createDb(d1)
    .select({ id: postImages.id })
    .from(postImages)
    .innerJoin(posts, eq(posts.id, postImages.post_id))
    .where(and(eq(postImages.r2_key, key), eq(posts.publication_state, "published")))
    .limit(1);
  return rows.length > 0;
};

export const getPendingUploads = (d1: D1Database) =>
  createDb(d1)
    .select({ id: posts.id, title: posts.title, created_at: posts.created_at })
    .from(posts)
    .where(eq(posts.publication_state, "pending"))
    .orderBy(asc(posts.created_at), asc(posts.id));
