import { Hono } from "hono";
import { getRecentPosts } from "../db";
import { formatStamp } from "../utils";
import type { DiaryEntry } from "../types";

const ALLOWED_ORIGINS = new Set([
	"https://mizora.dev",
	"http://localhost:3000",
]);

const api = new Hono<{ Bindings: Env }>();

api.use("/*", async (c, next) => {
	const origin = c.req.header("Origin") ?? "";
	await next();
	if (ALLOWED_ORIGINS.has(origin)) {
		c.header("Access-Control-Allow-Origin", origin);
		c.header("Vary", "Origin");
	}
});

api.options("/*", () => new Response(null, { status: 204 }));

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

export default api;
