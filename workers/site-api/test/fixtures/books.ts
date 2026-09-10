import { env } from "cloudflare:test";

export const setupBookSchema = async () => {
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
