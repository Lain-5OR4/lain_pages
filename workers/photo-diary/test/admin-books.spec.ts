import { env, SELF } from "cloudflare:test";
import { beforeEach, describe, expect, it } from "vitest";

const setupSchema = async () => {
	await env.DB.prepare(
		`CREATE TABLE IF NOT EXISTS books (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			title TEXT NOT NULL,
			author TEXT,
			kind TEXT NOT NULL DEFAULT 'book',
			category TEXT,
			status TEXT NOT NULL DEFAULT 'to_read',
			rating INTEGER,
			isbn TEXT,
			cover_url TEXT,
			amazon_url TEXT,
			publisher TEXT,
			note TEXT,
			started_on TEXT,
			finished_on TEXT,
			created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
			updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
		)`,
	).run();
};

beforeEach(async () => {
	await setupSchema();
	await env.DB.prepare("DELETE FROM books").run();
});

describe("admin books pages", () => {
	it("GET /admin/books lists books with status/edit/delete and no-store", async () => {
		await env.DB.prepare(
			"INSERT INTO books (id, title, author, status, rating) VALUES (1, 'UNIXという考え方', '田中', 'done', 4)",
		).run();
		const res = await SELF.fetch("http://example.com/admin/books");
		expect(res.status).toBe(200);
		expect(res.headers.get("cache-control")).toBe("no-store");
		const body = await res.text();
		expect(body).toContain("UNIXという考え方");
		expect(body).toContain("/admin/books/new");
		expect(body).toContain('href="/admin/books/1/edit"');
		expect(body).toContain('action="/admin/books/1/delete"');
	});

	it("GET /admin/books/new returns the create form", async () => {
		const res = await SELF.fetch("http://example.com/admin/books/new");
		expect(res.status).toBe(200);
		const body = await res.text();
		expect(body).toContain('action="/admin/books"');
		expect(body).toContain('name="title"');
		expect(body).toContain('name="status"');
	});

	it("POST /admin/books creates a book and redirects to its edit page", async () => {
		const fd = new FormData();
		fd.append("title", "新しい本");
		fd.append("author", "著者A");
		fd.append("kind", "book");
		fd.append("status", "reading");
		fd.append("rating", "");
		const res = await SELF.fetch("http://example.com/admin/books", {
			method: "POST",
			body: fd,
			redirect: "manual",
		});
		expect(res.status).toBe(302);
		const location = res.headers.get("location") ?? "";
		expect(location).toMatch(/^\/admin\/books\/\d+\/edit$/);

		const list = await (await SELF.fetch("http://example.com/admin/books")).text();
		expect(list).toContain("新しい本");
		expect(list).toContain("読書中");
	});

	it("POST /admin/books with a blank title returns 400", async () => {
		const fd = new FormData();
		fd.append("title", "   ");
		const res = await SELF.fetch("http://example.com/admin/books", {
			method: "POST",
			body: fd,
		});
		expect(res.status).toBe(400);
	});

	it("GET /admin/books/:id/edit shows the prefilled form", async () => {
		await env.DB.prepare(
			"INSERT INTO books (id, title, author, status) VALUES (2, '編集対象', '著者B', 'to_read')",
		).run();
		const res = await SELF.fetch("http://example.com/admin/books/2/edit");
		expect(res.status).toBe(200);
		const body = await res.text();
		expect(body).toContain('value="編集対象"');
		expect(body).toContain('value="著者B"');
		expect(body).toContain('action="/admin/books/2"');
	});

	it("GET /admin/books/:id/edit returns 404 for an unknown id", async () => {
		const res = await SELF.fetch("http://example.com/admin/books/9999/edit");
		expect(res.status).toBe(404);
	});

	it("POST /admin/books/:id updates fields and redirects to the list", async () => {
		await env.DB.prepare(
			"INSERT INTO books (id, title, status) VALUES (3, '更新前', 'to_read')",
		).run();
		const fd = new FormData();
		fd.append("title", "更新後");
		fd.append("status", "done");
		fd.append("rating", "5");
		fd.append("finished_on", "2026-08-01");
		const res = await SELF.fetch("http://example.com/admin/books/3", {
			method: "POST",
			body: fd,
			redirect: "manual",
		});
		expect(res.status).toBe(302);
		expect(res.headers.get("location")).toBe("/admin/books");

		const edit = await (await SELF.fetch("http://example.com/admin/books/3/edit")).text();
		expect(edit).toContain('value="更新後"');
		expect(edit).toContain('value="2026-08-01"');
	});

	it("POST /admin/books/:id returns 404 for an unknown id", async () => {
		const fd = new FormData();
		fd.append("title", "x");
		const res = await SELF.fetch("http://example.com/admin/books/9999", {
			method: "POST",
			body: fd,
		});
		expect(res.status).toBe(404);
	});

	it("POST /admin/books/:id/delete removes the book and redirects to the list", async () => {
		await env.DB.prepare(
			"INSERT INTO books (id, title, status) VALUES (4, '削除対象', 'to_read')",
		).run();
		const res = await SELF.fetch("http://example.com/admin/books/4/delete", {
			method: "POST",
			redirect: "manual",
		});
		expect(res.status).toBe(302);
		expect(res.headers.get("location")).toBe("/admin/books");

		const list = await (await SELF.fetch("http://example.com/admin/books")).text();
		expect(list).not.toContain("削除対象");
	});

	it("POST /admin/books/:id/delete returns 404 for an unknown id", async () => {
		const res = await SELF.fetch("http://example.com/admin/books/9999/delete", {
			method: "POST",
		});
		expect(res.status).toBe(404);
	});
});
