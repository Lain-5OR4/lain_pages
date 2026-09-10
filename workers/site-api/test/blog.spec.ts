import { SELF, fetchMock } from "cloudflare:test";
import { afterEach, beforeAll, describe, expect, it } from "vitest";

// MICROCMS_SERVICE_DOMAIN is pinned to "test-service" in vitest.config.mts
const MICROCMS_ORIGIN = "https://test-service.microcms.io";

beforeAll(() => {
	fetchMock.activate();
	fetchMock.disableNetConnect();
});

afterEach(() => {
	fetchMock.assertNoPendingInterceptors();
});

describe("blog proxy /api/blog", () => {
	it("GET /api/blog returns the microCMS list with cache + CORS headers", async () => {
		fetchMock
			.get(MICROCMS_ORIGIN)
			.intercept({
				path: (p) => p.startsWith("/api/v1/blogs"),
				headers: { "X-MICROCMS-API-KEY": "test-key" },
			})
			.reply(200, {
				contents: [
					{ id: "post-a", title: "A", publishedAt: "2026-06-01T00:00:00.000Z" },
				],
			});

		const res = await SELF.fetch("http://example.com/api/blog", {
			headers: { Origin: "https://mizora.dev" },
		});
		expect(res.status).toBe(200);
		expect(res.headers.get("cache-control")).toBe("public, max-age=60, s-maxage=300");
		expect(res.headers.get("access-control-allow-origin")).toBe("https://mizora.dev");
		const posts = (await res.json()) as Array<{ id: string }>;
		expect(posts).toHaveLength(1);
		expect(posts[0].id).toBe("post-a");
	});

	it("GET /api/blog/:id returns a single post", async () => {
		fetchMock
			.get(MICROCMS_ORIGIN)
			.intercept({ path: (p) => p.startsWith("/api/v1/blogs/post-a") })
			.reply(200, { id: "post-a", title: "A", content: "<p>hi</p>" });

		const res = await SELF.fetch("http://example.com/api/blog/post-a");
		expect(res.status).toBe(200);
		expect(res.headers.get("cache-control")).toBe("public, max-age=60, s-maxage=300");
		const post = (await res.json()) as { id: string; content: string };
		expect(post.id).toBe("post-a");
		expect(post.content).toBe("<p>hi</p>");
	});

	it("GET /api/blog/:id?draftKey=xxx forwards the key and disables caching", async () => {
		fetchMock
			.get(MICROCMS_ORIGIN)
			.intercept({
				path: (p) =>
					p.startsWith("/api/v1/blogs/draft-post") && p.includes("draftKey=secret"),
			})
			.reply(200, { id: "draft-post", title: "Draft" });

		const res = await SELF.fetch(
			"http://example.com/api/blog/draft-post?draftKey=secret",
		);
		expect(res.status).toBe(200);
		expect(res.headers.get("cache-control")).toBe("private, no-store");
	});

	it("GET /api/blog/:id passes through microCMS 404", async () => {
		fetchMock
			.get(MICROCMS_ORIGIN)
			.intercept({ path: (p) => p.startsWith("/api/v1/blogs/nope") })
			.reply(404, { message: "not found" });

		const res = await SELF.fetch("http://example.com/api/blog/nope");
		expect(res.status).toBe(404);
	});

	it("GET /api/blog maps microCMS server errors to 502", async () => {
		fetchMock
			.get(MICROCMS_ORIGIN)
			.intercept({ path: (p) => p.startsWith("/api/v1/blogs") })
			.reply(500, "boom");

		const res = await SELF.fetch("http://example.com/api/blog");
		expect(res.status).toBe(502);
	});

	it("OPTIONS /api/blog answers preflight with CORS for allowed origins", async () => {
		const res = await SELF.fetch("http://example.com/api/blog", {
			method: "OPTIONS",
			headers: { Origin: "http://localhost:3000" },
		});
		expect(res.status).toBe(204);
		expect(res.headers.get("access-control-allow-origin")).toBe("http://localhost:3000");
	});

	it("disallowed origins get no CORS headers", async () => {
		fetchMock
			.get(MICROCMS_ORIGIN)
			.intercept({ path: (p) => p.startsWith("/api/v1/blogs") })
			.reply(200, { contents: [] });

		const res = await SELF.fetch("http://example.com/api/blog", {
			headers: { Origin: "https://evil.example" },
		});
		expect(res.status).toBe(200);
		expect(res.headers.get("access-control-allow-origin")).toBeNull();
	});
});
