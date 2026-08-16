import { env, SELF } from "cloudflare:test";
import { beforeAll, describe, expect, it } from "vitest";

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

const seedBooks = async () => {
	await env.DB.prepare("DELETE FROM books").run();
	await env.DB.batch([
		env.DB.prepare(
			`INSERT INTO books (id, title, author, category, status, rating, amazon_url, publisher, note)
			 VALUES (1, '例題で学ぶグラフ理論', '安藤 清', '数学', 'done', 4, 'https://amzn.asia/d/fevd7z8', '森北出版', '入門としては良いのではないか')`,
		),
		env.DB.prepare(
			`INSERT INTO books (id, title, status) VALUES (2, 'チャート式シリーズ 大学教養 線形代数', 'to_read')`,
		),
	]);
};

beforeAll(async () => {
	await setupSchema();
	await seedBooks();
});

describe("GET /api/books", () => {
	it("returns books as a camelCase Book[] contract", async () => {
		const res = await SELF.fetch("http://example.com/api/books");
		expect(res.status).toBe(200);
		const books = (await res.json()) as Array<{
			id: number;
			title: string;
			author: string | null;
			category: string | null;
			status: string;
			rating: number | null;
			coverUrl: string | null;
			amazonUrl: string | null;
			publisher: string | null;
			note: string | null;
		}>;
		expect(books).toHaveLength(2);

		const rated = books.find((b) => b.id === 1);
		expect(rated?.title).toBe("例題で学ぶグラフ理論");
		expect(rated?.author).toBe("安藤 清");
		expect(rated?.category).toBe("数学");
		expect(rated?.status).toBe("done");
		expect(rated?.rating).toBe(4);
		expect(rated?.amazonUrl).toBe("https://amzn.asia/d/fevd7z8");
		expect(rated?.publisher).toBe("森北出版");
		expect(rated?.note).toBe("入門としては良いのではないか");
		expect(rated?.coverUrl).toBeNull();

		const bare = books.find((b) => b.id === 2);
		expect(bare?.status).toBe("to_read");
		expect(bare?.author).toBeNull();
		expect(bare?.rating).toBeNull();
	});

	it("sets Cache-Control for shared caching", async () => {
		const res = await SELF.fetch("http://example.com/api/books");
		expect(res.headers.get("cache-control")).toBe("public, max-age=60, s-maxage=300");
	});

	it("sets CORS headers for an allowed origin", async () => {
		const res = await SELF.fetch("http://example.com/api/books", {
			headers: { Origin: "https://mizora.dev" },
		});
		expect(res.headers.get("access-control-allow-origin")).toBe("https://mizora.dev");
	});

	it("omits CORS headers for a disallowed origin", async () => {
		const res = await SELF.fetch("http://example.com/api/books", {
			headers: { Origin: "https://evil.example" },
		});
		expect(res.headers.get("access-control-allow-origin")).toBeNull();
	});
});
