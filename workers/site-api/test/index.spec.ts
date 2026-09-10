import { env, SELF } from "cloudflare:test";
import { describe, it, expect, beforeAll } from "vitest";

const JPEG_BYTES = new Uint8Array([0xff, 0xd8, 0xff, 0xe0]);

const setupSchema = async () => {
	await env.DB.prepare(
		"CREATE TABLE IF NOT EXISTS posts (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT NOT NULL DEFAULT '', caption TEXT NOT NULL DEFAULT '', posted_on TEXT NOT NULL, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)",
	).run();
	await env.DB.prepare(
		"CREATE TABLE IF NOT EXISTS post_images (id INTEGER PRIMARY KEY AUTOINCREMENT, post_id INTEGER NOT NULL, r2_key TEXT NOT NULL UNIQUE, sort_order INTEGER NOT NULL DEFAULT 0, taken_at TEXT, width INTEGER, height INTEGER)",
	).run();
};

const seedTwoPosts = async () => {
	await env.DB.prepare("DELETE FROM post_images").run();
	await env.DB.prepare("DELETE FROM posts").run();
	await env.DB.batch([
		env.DB.prepare(
			"INSERT INTO posts (id, title, caption, posted_on) VALUES (1, 'first title', 'old post', '2026-05-08')",
		),
		env.DB.prepare(
			"INSERT INTO posts (id, title, caption, posted_on) VALUES (2, 'second title', 'newer carousel post', '2026-05-10')",
		),
		env.DB.prepare(
			"INSERT INTO post_images (post_id, r2_key, sort_order, taken_at) VALUES (1, 'posts/1/0-aaa.jpg', 0, '2026-05-08T09:30:00.000Z')",
		),
		env.DB.prepare(
			"INSERT INTO post_images (post_id, r2_key, sort_order, taken_at) VALUES (2, 'posts/2/0-bbb.jpg', 0, NULL)",
		),
		env.DB.prepare(
			"INSERT INTO post_images (post_id, r2_key, sort_order, taken_at) VALUES (2, 'posts/2/1-ccc.jpg', 1, NULL)",
		),
	]);
	await env.BUCKET.put("posts/1/0-aaa.jpg", JPEG_BYTES, {
		httpMetadata: { contentType: "image/jpeg" },
	});
	await env.BUCKET.put("posts/2/0-bbb.jpg", JPEG_BYTES, {
		httpMetadata: { contentType: "image/jpeg" },
	});
	await env.BUCKET.put("posts/2/1-ccc.jpg", JPEG_BYTES, {
		httpMetadata: { contentType: "image/jpeg" },
	});
};

beforeAll(async () => {
	await setupSchema();
	await seedTwoPosts();
});

describe("photo-diary read path", () => {
	it("GET / lists posts in posted_on DESC order with image URLs", async () => {
		const res = await SELF.fetch("http://example.com/");
		expect(res.status).toBe(200);
		const body = await res.text();
		expect(body).toContain("newer carousel post");
		expect(body).toContain("old post");
		expect(body.indexOf("newer carousel post")).toBeLessThan(
			body.indexOf("old post"),
		);
		expect(body).toContain("/images/posts/2/0-bbb.jpg");
		expect(body).toContain("/images/posts/2/1-ccc.jpg");
	});

	it("GET /post/:id renders OGP tags with the first image as og:image", async () => {
		const res = await SELF.fetch("http://example.com/post/2");
		expect(res.status).toBe(200);
		const body = await res.text();
		expect(body).toContain('property="og:image"');
		expect(body).toContain("/images/posts/2/0-bbb.jpg");
		expect(body).toContain('property="og:url"');
		expect(body).toContain('content="article"');
		expect(body).toContain('name="twitter:card"');
		expect(body).toContain("second title");
	});

	it("GET /post/:id returns 404 for unknown id", async () => {
		const res = await SELF.fetch("http://example.com/post/999");
		expect(res.status).toBe(404);
	});

	it("GET /images/:key serves bytes from R2 with immutable cache", async () => {
		const res = await SELF.fetch(
			"http://example.com/images/posts/1/0-aaa.jpg",
		);
		expect(res.status).toBe(200);
		expect(res.headers.get("content-type")).toBe("image/jpeg");
		expect(res.headers.get("cache-control")).toContain("immutable");
		const bytes = new Uint8Array(await res.arrayBuffer());
		expect(bytes).toEqual(JPEG_BYTES);
	});

	it("GET /images/:key returns 404 for missing keys", async () => {
		const res = await SELF.fetch("http://example.com/images/posts/0/nope.jpg");
		expect(res.status).toBe(404);
	});

	it("GET /images/:key refuses keys outside posts/ even if the object exists", async () => {
		await env.BUCKET.put("secret/backup.jpg", JPEG_BYTES, {
			httpMetadata: { contentType: "image/jpeg" },
		});
		const res = await SELF.fetch("http://example.com/images/secret/backup.jpg");
		expect(res.status).toBe(404);
		await env.BUCKET.delete("secret/backup.jpg");
	});

	it("GET /images/:key sends X-Content-Type-Options: nosniff", async () => {
		const res = await SELF.fetch(
			"http://example.com/images/posts/1/0-aaa.jpg",
		);
		expect(res.status).toBe(200);
		expect(res.headers.get("x-content-type-options")).toBe("nosniff");
		await res.arrayBuffer();
	});

	it("GET /api/posts merges images with key/taken_at into each post", async () => {
		const res = await SELF.fetch("http://example.com/api/posts");
		const posts = (await res.json()) as Array<{
			id: number;
			title: string;
			caption: string;
			images: Array<{ key: string; taken_at: string | null }>;
		}>;
		expect(posts).toHaveLength(2);
		expect(posts.find((p) => p.id === 2)?.images.map((i) => i.key)).toEqual([
			"posts/2/0-bbb.jpg",
			"posts/2/1-ccc.jpg",
		]);
		expect(posts.find((p) => p.id === 1)?.images).toEqual([
			{ key: "posts/1/0-aaa.jpg", taken_at: "2026-05-08T09:30:00.000Z" },
		]);
	});
});

describe("photo-diary /api/diary + CORS", () => {
	it("GET /api/diary returns DiaryEntry[] with absolute photo URLs and stamps", async () => {
		const res = await SELF.fetch("http://example.com/api/diary");
		expect(res.status).toBe(200);
		const entries = (await res.json()) as Array<{
			id: string;
			date: string;
			title: string;
			description: string;
			photos: Array<{ src: string; alt: string; stamp?: string }>;
		}>;
		expect(entries).toHaveLength(2);
		const e1 = entries.find((e) => e.id === "1");
		expect(e1?.title).toBe("first title");
		expect(e1?.description).toBe("old post");
		expect(e1?.date).toBe("2026-05-08");
		expect(e1?.photos[0].src).toBe(
			"http://example.com/images/posts/1/0-aaa.jpg",
		);
		// taken_at present → stamp derived from it
		expect(e1?.photos[0].stamp).toMatch(/^'\d{2} \d{2} \d{2} \d{2}:\d{2}$/);
		const e2 = entries.find((e) => e.id === "2");
		expect(e2?.photos).toHaveLength(2);
		// taken_at null → stamp falls back to created_at, still in format
		expect(e2?.photos[0].stamp).toMatch(/^'\d{2} \d{2} \d{2} \d{2}:\d{2}$/);
	});

	it("GET /api/diary with allowed Origin sets CORS headers", async () => {
		const res = await SELF.fetch("http://example.com/api/diary", {
			headers: { Origin: "https://mizora.dev" },
		});
		expect(res.status).toBe(200);
		expect(res.headers.get("access-control-allow-origin")).toBe(
			"https://mizora.dev",
		);
		expect(res.headers.get("vary")).toContain("Origin");
	});

	it("GET /api/diary with disallowed Origin omits CORS headers", async () => {
		const res = await SELF.fetch("http://example.com/api/diary", {
			headers: { Origin: "https://evil.example" },
		});
		expect(res.status).toBe(200);
		expect(res.headers.get("access-control-allow-origin")).toBeNull();
	});

	it("GET /api/diary shifts taken_at with UTC marker to JST in the stamp", async () => {
		await env.DB.prepare("DELETE FROM post_images").run();
		await env.DB.prepare("DELETE FROM posts").run();
		await env.DB.batch([
			env.DB.prepare(
				"INSERT INTO posts (id, title, caption, posted_on) VALUES (10, 't', 'c', '2026-05-12')",
			),
			env.DB.prepare(
				"INSERT INTO post_images (post_id, r2_key, sort_order, taken_at) VALUES (10, 'posts/10/0.jpg', 0, '2026-05-12T03:00:00.000Z')",
			),
		]);
		const entries = (await (
			await SELF.fetch("http://example.com/api/diary")
		).json()) as Array<{ id: string; photos: Array<{ stamp?: string }> }>;
		const e = entries.find((x) => x.id === "10");
		// UTC 03:00 + 9h = JST 12:00
		expect(e?.photos[0].stamp).toBe("'26 05 12 12:00");
		// restore baseline
		await seedTwoPosts();
	});

	it("GET /api/diary renders naive (no-TZ) taken_at as-is", async () => {
		await env.DB.prepare("DELETE FROM post_images").run();
		await env.DB.prepare("DELETE FROM posts").run();
		await env.DB.batch([
			env.DB.prepare(
				"INSERT INTO posts (id, title, caption, posted_on) VALUES (11, 't', 'c', '2026-05-12')",
			),
			env.DB.prepare(
				"INSERT INTO post_images (post_id, r2_key, sort_order, taken_at) VALUES (11, 'posts/11/0.jpg', 0, '2026-05-12T07:15:30')",
			),
		]);
		const entries = (await (
			await SELF.fetch("http://example.com/api/diary")
		).json()) as Array<{ id: string; photos: Array<{ stamp?: string }> }>;
		const e = entries.find((x) => x.id === "11");
		// naive → byte-for-byte (no JST shift)
		expect(e?.photos[0].stamp).toBe("'26 05 12 07:15");
		await seedTwoPosts();
	});

	it("OPTIONS /api/diary returns 204 (preflight)", async () => {
		const res = await SELF.fetch("http://example.com/api/diary", {
			method: "OPTIONS",
			headers: { Origin: "https://mizora.dev" },
		});
		expect(res.status).toBe(204);
		expect(res.headers.get("access-control-allow-origin")).toBe(
			"https://mizora.dev",
		);
	});
});

describe("photo-diary admin pages", () => {
	it("GET /admin shows existing posts with delete forms and no-store", async () => {
		const res = await SELF.fetch("http://example.com/admin");
		expect(res.status).toBe(200);
		expect(res.headers.get("cache-control")).toContain("no-store");
		const body = await res.text();
		expect(body).toContain("/admin/new");
		expect(body).toContain("second title");
		expect(body).toContain('action="/admin/posts/2/delete"');
	});

	it("GET /admin/new returns the upload form with title input and EXIF script", async () => {
		const res = await SELF.fetch("http://example.com/admin/new");
		expect(res.status).toBe(200);
		const body = await res.text();
		expect(body).toContain('id="new-post-form"');
		expect(body).toContain('enctype="multipart/form-data"');
		expect(body).toContain('name="title"');
		expect(body).toContain('name="images"');
		expect(body).toContain('name="posted_on"');
		expect(body).toContain("canvas.toBlob"); // resize script present
		expect(body).toContain("exifr"); // EXIF parser imported
		expect(body).toContain('<script type="module">');
	});
});

describe("photo-diary write path", () => {
	it("POST /admin/posts persists title + taken_at and round-trips through /api/diary", async () => {
		const fd = new FormData();
		fd.append("title", "via multipart");
		fd.append("caption", "captioned body");
		fd.append("posted_on", "2026-05-12");
		fd.append("images", new Blob([JPEG_BYTES], { type: "image/jpeg" }), "a.jpg");
		fd.append("taken_at", "2026-05-12T10:11:00.000Z");
		fd.append("images", new Blob([JPEG_BYTES], { type: "image/jpeg" }), "b.png");
		fd.append("taken_at", ""); // no EXIF for the second

		const res = await SELF.fetch("http://example.com/admin/posts", {
			method: "POST",
			body: fd,
		});
		expect(res.status).toBe(200);
		const data = (await res.json()) as { ok: boolean; id: number; url: string };
		expect(data.ok).toBe(true);
		expect(data.url).toBe(`/post/${data.id}`);

		// /api/diary shows the new entry
		const entries = (await (
			await SELF.fetch("http://example.com/api/diary")
		).json()) as Array<{
			id: string;
			title: string;
			description: string;
			photos: Array<{ src: string; stamp?: string }>;
		}>;
		const fresh = entries.find((e) => e.id === String(data.id));
		expect(fresh?.title).toBe("via multipart");
		expect(fresh?.description).toBe("captioned body");
		expect(fresh?.photos).toHaveLength(2);
		// first photo's stamp derived from taken_at
		expect(fresh?.photos[0].stamp).toMatch(/^'26 05 \d{2} \d{2}:\d{2}$/);

		// 2 R2 objects
		const r2 = await env.BUCKET.list({ prefix: `posts/${data.id}/` });
		expect(r2.objects).toHaveLength(2);
		const keys = r2.objects.map((o) => o.key).sort();
		expect(keys[0]).toMatch(new RegExp(`^posts/${data.id}/0-[a-f0-9]{8}\\.jpg$`));
		expect(keys[1]).toMatch(new RegExp(`^posts/${data.id}/1-[a-f0-9]{8}\\.png$`));

		// stored content type comes from the whitelisted extension, not the
		// client-supplied blob MIME (both blobs were sent as image/jpeg)
		const pngObj = await env.BUCKET.head(keys[1]);
		expect(pngObj?.httpMetadata?.contentType).toBe("image/png");

		// DB rows
		const { results } = await env.DB.prepare(
			"SELECT r2_key, sort_order, taken_at FROM post_images WHERE post_id = ? ORDER BY sort_order",
		)
			.bind(data.id)
			.all<{ r2_key: string; sort_order: number; taken_at: string | null }>();
		expect(results).toHaveLength(2);
		expect(results[0].taken_at).toBe("2026-05-12T10:11:00.000Z");
		expect(results[1].taken_at).toBeNull();
	});

	it("POST /admin/posts with no images returns 400", async () => {
		const fd = new FormData();
		fd.append("title", "no files");
		fd.append("caption", "");
		fd.append("posted_on", "2026-05-12");
		const res = await SELF.fetch("http://example.com/admin/posts", {
			method: "POST",
			body: fd,
		});
		expect(res.status).toBe(400);
	});

	it("DELETE /admin/posts/:id removes the post and its R2 objects", async () => {
		const fd = new FormData();
		fd.append("title", "delete me");
		fd.append("caption", "");
		fd.append("posted_on", "2026-05-12");
		fd.append("images", new Blob([JPEG_BYTES], { type: "image/jpeg" }), "x.jpg");
		fd.append("taken_at", "");
		const created = (await (
			await SELF.fetch("http://example.com/admin/posts", { method: "POST", body: fd })
		).json()) as { id: number };

		const before = await env.BUCKET.list({ prefix: `posts/${created.id}/` });
		expect(before.objects.length).toBeGreaterThan(0);

		const res = await SELF.fetch(
			`http://example.com/admin/posts/${created.id}`,
			{ method: "DELETE" },
		);
		expect(res.status).toBe(200);

		const after = await env.BUCKET.list({ prefix: `posts/${created.id}/` });
		expect(after.objects).toHaveLength(0);

		const row = await env.DB.prepare("SELECT id FROM posts WHERE id = ?")
			.bind(created.id)
			.first();
		expect(row).toBeNull();
	});

	it("POST /admin/posts/:id/delete (form fallback) redirects to /admin", async () => {
		const fd = new FormData();
		fd.append("title", "delete via form");
		fd.append("caption", "");
		fd.append("posted_on", "2026-05-12");
		fd.append("images", new Blob([JPEG_BYTES], { type: "image/jpeg" }), "y.jpg");
		fd.append("taken_at", "");
		const created = (await (
			await SELF.fetch("http://example.com/admin/posts", { method: "POST", body: fd })
		).json()) as { id: number };

		const res = await SELF.fetch(
			`http://example.com/admin/posts/${created.id}/delete`,
			{ method: "POST", redirect: "manual" },
		);
		expect(res.status).toBe(302);
		expect(res.headers.get("location")).toBe("/admin");

		const row = await env.DB.prepare("SELECT id FROM posts WHERE id = ?")
			.bind(created.id)
			.first();
		expect(row).toBeNull();
	});

	it("DELETE /admin/posts/:id returns 404 for unknown id", async () => {
		const res = await SELF.fetch("http://example.com/admin/posts/9999", {
			method: "DELETE",
		});
		expect(res.status).toBe(404);
	});
});
