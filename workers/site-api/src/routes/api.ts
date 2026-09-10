import { Hono } from "hono";
import { corsMiddleware, preflight } from "../cors";
import { getBooks, getRecentPosts } from "../db";
import { formatStamp } from "../utils";
import type { Book, DiaryEntry } from "../types";

const api = new Hono<{ Bindings: Env }>();

api.use("/*", corsMiddleware);
api.options("/*", preflight);

api.get("/posts", async (c) => {
	const posts = await getRecentPosts(c.env.DB);
	return c.json(posts);
});

api.get("/diary", async (c) => {
	const posts = await getRecentPosts(c.env.DB);
	const origin = new URL(c.req.url).origin;
	const entries: DiaryEntry[] = posts.map((p) => {
		// D1's CURRENT_TIMESTAMP is UTC but written as "YYYY-MM-DD HH:MM:SS" with no
		// marker; tag it so formatStamp treats it as UTC and shifts to JST.
		const createdUtc = /[Z]|[+-]\d{2}:?\d{2}$/.test(p.created_at)
			? p.created_at
			: `${p.created_at.replace(" ", "T")}Z`;
		return {
			id: String(p.id),
			date: p.posted_on,
			title: p.title,
			description: p.caption,
			photos: p.images.map((img) => ({
				src: `${origin}/images/${img.key}`,
				alt: p.title || p.caption || `#${p.id}`,
				stamp: formatStamp(img.taken_at ?? createdUtc),
			})),
		};
	});
	c.header("Cache-Control", "public, max-age=60, s-maxage=300");
	return c.json(entries);
});

api.get("/books", async (c) => {
	const rows = await getBooks(c.env.DB);
	const books: Book[] = rows.map((b) => ({
		id: b.id,
		title: b.title,
		author: b.author,
		kind: b.kind as Book["kind"],
		category: b.category,
		status: b.status as Book["status"],
		rating: b.rating,
		isbn: b.isbn,
		coverUrl: b.cover_url,
		amazonUrl: b.amazon_url,
		publisher: b.publisher,
		note: b.note,
		startedOn: b.started_on,
		finishedOn: b.finished_on,
	}));
	c.header("Cache-Control", "public, max-age=60, s-maxage=300");
	return c.json(books);
});

export default api;
