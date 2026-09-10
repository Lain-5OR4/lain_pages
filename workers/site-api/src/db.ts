import { drizzle } from "drizzle-orm/d1";
import { asc, desc, eq, sql } from "drizzle-orm";
import { books, postImages, posts } from "./schema";

export type Post = typeof posts.$inferSelect;
export type PostImageRow = typeof postImages.$inferSelect;
export type PostImage = { key: string; taken_at: string | null };
export type PostWithImages = Post & { images: PostImage[] };

export const createDb = (d1: D1Database) => drizzle(d1);

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

export const getRecentPosts = async (
	d1: D1Database,
	limit = 50,
): Promise<PostWithImages[]> => {
	const db = createDb(d1);
	const [allPosts, allImages] = await Promise.all([
		db.select().from(posts).orderBy(desc(posts.posted_on), desc(posts.id)).limit(limit),
		db.select().from(postImages).orderBy(asc(postImages.post_id), asc(postImages.sort_order)),
	]);
	return mergeImages(allPosts, allImages);
};

export const getPost = async (
	d1: D1Database,
	id: number,
): Promise<PostWithImages | null> => {
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

// --- books (reading log) ---

export type Book = typeof books.$inferSelect;
export type NewBook = typeof books.$inferInsert;

export const getBooks = async (d1: D1Database): Promise<Book[]> => {
	const db = createDb(d1);
	return db.select().from(books).orderBy(desc(books.updated_at), desc(books.id));
};

export const getBook = async (d1: D1Database, id: number): Promise<Book | null> => {
	const db = createDb(d1);
	const [book] = await db.select().from(books).where(eq(books.id, id)).limit(1);
	return book ?? null;
};

export const createBook = async (d1: D1Database, input: NewBook): Promise<Book> => {
	const db = createDb(d1);
	const [book] = await db.insert(books).values(input).returning();
	return book;
};

export const updateBook = async (
	d1: D1Database,
	id: number,
	patch: Partial<NewBook>,
): Promise<Book | null> => {
	const db = createDb(d1);
	const [book] = await db
		.update(books)
		.set({ ...patch, updated_at: sql`CURRENT_TIMESTAMP` })
		.where(eq(books.id, id))
		.returning();
	return book ?? null;
};

export const deleteBook = async (d1: D1Database, id: number): Promise<boolean> => {
	const db = createDb(d1);
	const result = await db.delete(books).where(eq(books.id, id)).returning({ id: books.id });
	return result.length > 0;
};
