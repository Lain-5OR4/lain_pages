import { Hono } from "hono";

const ALLOWED_ORIGINS = new Set([
	"https://mizora.dev",
	"http://localhost:3000",
	"http://localhost:3001",
]);

const blog = new Hono<{ Bindings: Env }>();

blog.use("/*", async (c, next) => {
	const origin = c.req.header("Origin") ?? "";
	await next();
	if (ALLOWED_ORIGINS.has(origin)) {
		c.header("Access-Control-Allow-Origin", origin);
		c.header("Vary", "Origin");
	}
});

blog.options("/*", () => new Response(null, { status: 204 }));

// microCMS endpoint name — must match the API name set in the dashboard
const MICROCMS_ENDPOINT = "blogs";

function microCMSBase(env: Env) {
	return `https://${env.MICROCMS_SERVICE_DOMAIN}.microcms.io/api/v1/${MICROCMS_ENDPOINT}`;
}

function microCMSHeaders(env: Env): HeadersInit {
	return { "X-MICROCMS-API-KEY": env.MICROCMS_API_KEY };
}

// GET /api/blog — list (content excluded to keep payload light)
blog.get("/", async (c) => {
	const url = new URL(microCMSBase(c.env));
	url.searchParams.set("limit", "100");
	url.searchParams.set("orders", "-publishedAt");
	url.searchParams.set("fields", "id,title,eyecatch,category,publishedAt");

	const res = await fetch(url, { headers: microCMSHeaders(c.env) });
	if (!res.ok) return c.json({ error: "microCMS error", status: res.status }, 502);

	const data = await res.json<{ contents: unknown[] }>();
	c.header("Cache-Control", "public, max-age=60, s-maxage=300");
	return c.json(data.contents);
});

// GET /api/blog/:id — single post with full HTML content
// Pass ?draftKey=xxx to preview unpublished content
blog.get("/:id", async (c) => {
	const id = c.req.param("id");
	const draftKey = c.req.query("draftKey");

	const url = new URL(`${microCMSBase(c.env)}/${id}`);
	if (draftKey) url.searchParams.set("draftKey", draftKey);

	const res = await fetch(url, { headers: microCMSHeaders(c.env) });
	if (res.status === 404) return c.json({ error: "not found" }, 404);
	if (!res.ok) return c.json({ error: "microCMS error", status: res.status }, 502);

	const data = await res.json();
	// Don't cache drafts
	c.header(
		"Cache-Control",
		draftKey ? "private, no-store" : "public, max-age=60, s-maxage=300",
	);
	return c.json(data);
});

export default blog;
