import { Hono } from "hono";
import { html } from "hono/html";
import { getPost, getRecentPosts } from "../db";
import { layout, renderPost } from "../views";

const pub = new Hono<{ Bindings: Env }>();

pub.get("/", async (c) => {
	const posts = await getRecentPosts(c.env.DB);
	c.header("Cache-Control", "public, max-age=60, s-maxage=300");
	return c.html(
		layout({
			title: "photo-diary",
			description: "個人の写真日記",
			body:
				posts.length === 0
					? html`<p class="empty">(no posts yet)</p>`
					: html`${posts.map(renderPost)}`,
		}),
	);
});

pub.get("/post/:id{[0-9]+}", async (c) => {
	const id = Number(c.req.param("id"));
	const post = await getPost(c.env.DB, id);
	if (!post) return c.notFound();

	const origin = new URL(c.req.url).origin;
	const ogImage = post.images[0] ? `${origin}/images/${post.images[0].key}` : undefined;
	const ogUrl = `${origin}/post/${post.id}`;
	const description = post.caption || post.title || `posted on ${post.posted_on}`;
	const titleText = post.title || post.caption || `#${post.id}`;
	const pageTitle = `${titleText.slice(0, 60)} — photo-diary`;

	c.header("Cache-Control", "public, max-age=60, s-maxage=300");
	return c.html(
		layout({
			title: pageTitle,
			description,
			ogImage,
			ogUrl,
			body: renderPost(post),
		}),
	);
});

pub.get("/images/:key{.+}", async (c) => {
	const key = c.req.param("key");
	const obj = await c.env.BUCKET.get(key);
	if (!obj) return c.notFound();

	const headers = new Headers();
	obj.writeHttpMetadata(headers);
	headers.set("etag", obj.httpEtag);
	headers.set("cache-control", "public, max-age=31536000, immutable");
	return new Response(obj.body, { headers });
});

export default pub;
