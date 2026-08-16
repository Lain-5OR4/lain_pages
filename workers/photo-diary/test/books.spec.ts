import { env } from "cloudflare:test";
import { beforeEach, describe, expect, it } from "vitest";
import { createBook, deleteBook, getBook, getBooks, updateBook } from "../src/db";

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

describe("books data model", () => {
	it("createBook applies kind/status/timestamp defaults", async () => {
		const book = await createBook(env.DB, { title: "UNIXという考え方" });
		expect(book.id).toBeGreaterThan(0);
		expect(book.kind).toBe("book");
		expect(book.status).toBe("to_read");
		expect(book.created_at).toBeTruthy();
		expect(book.updated_at).toBeTruthy();
	});

	it("createBook stores optional fields (author, isbn, cover_url pasted from Amazon)", async () => {
		const book = await createBook(env.DB, {
			title: "オブジェクト指向でなぜつくるのか 第3版",
			author: "平澤章",
			isbn: "9784822284688",
			cover_url: "https://m.media-amazon.com/images/I/xxxxx.jpg",
		});
		expect(book.author).toBe("平澤章");
		expect(book.isbn).toBe("9784822284688");
		expect(book.cover_url).toContain("media-amazon.com");
	});

	it("createBook stores category/rating/publisher/amazon_url (from the Notion 種別/評価/出版社/リンク properties)", async () => {
		const book = await createBook(env.DB, {
			title: "例題で学ぶグラフ理論",
			author: "安藤 清",
			category: "数学",
			status: "done",
			rating: 4,
			publisher: "森北出版",
			amazon_url: "https://amzn.asia/d/fevd7z8",
			note: "入門としては良いのではないか",
		});
		expect(book.category).toBe("数学");
		expect(book.rating).toBe(4);
		expect(book.publisher).toBe("森北出版");
		expect(book.amazon_url).toBe("https://amzn.asia/d/fevd7z8");
		expect(book.note).toBe("入門としては良いのではないか");
	});

	it("getBooks orders by most recently updated first", async () => {
		// Seed updated_at directly — CURRENT_TIMESTAMP has 1s resolution, too
		// coarse to rely on wall-clock ordering between two fast inserts.
		await env.DB.prepare(
			"INSERT INTO books (id, title, updated_at) VALUES (1, 'A', '2026-01-01T00:00:00'), (2, 'B', '2026-02-01T00:00:00')",
		).run();
		const list = await getBooks(env.DB);
		expect(list.map((x) => x.id)).toEqual([2, 1]);
	});

	it("getBook returns null for a missing id", async () => {
		expect(await getBook(env.DB, 999)).toBeNull();
	});

	it("updateBook changes status and keeps updated_at populated", async () => {
		const book = await createBook(env.DB, { title: "テスト自動化実践ガイド" });
		const updated = await updateBook(env.DB, book.id, { status: "reading" });
		expect(updated?.status).toBe("reading");
		expect(updated?.updated_at).toBeTruthy();
	});

	it("updateBook returns null for a missing id", async () => {
		expect(await updateBook(env.DB, 999, { status: "done" })).toBeNull();
	});

	it("deleteBook removes the row and returns true", async () => {
		const book = await createBook(env.DB, { title: "delete me" });
		expect(await deleteBook(env.DB, book.id)).toBe(true);
		expect(await getBook(env.DB, book.id)).toBeNull();
	});

	it("deleteBook returns false for a missing id", async () => {
		expect(await deleteBook(env.DB, 999)).toBe(false);
	});
});
