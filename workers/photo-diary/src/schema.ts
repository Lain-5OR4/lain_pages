import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const posts = sqliteTable("posts", {
	id: integer("id").primaryKey({ autoIncrement: true }),
	title: text("title").notNull().default(""),
	caption: text("caption").notNull().default(""),
	posted_on: text("posted_on").notNull(),
	created_at: text("created_at").notNull().default("CURRENT_TIMESTAMP"),
});

export const postImages = sqliteTable("post_images", {
	id: integer("id").primaryKey({ autoIncrement: true }),
	post_id: integer("post_id").notNull(),
	r2_key: text("r2_key").notNull(),
	sort_order: integer("sort_order").notNull().default(0),
	taken_at: text("taken_at"),
	width: integer("width"),
	height: integer("height"),
});

// kind: 'book' | 'article'
// status: 'to_read' | 'reading' | 'done'
// cover_url is a plain URL string (Amazon product image, pasted manually) — no
// scraping or upload pipeline.
export const books = sqliteTable("books", {
	id: integer("id").primaryKey({ autoIncrement: true }),
	title: text("title").notNull(),
	author: text("author"),
	kind: text("kind").notNull().default("book"),
	status: text("status").notNull().default("to_read"),
	isbn: text("isbn"),
	cover_url: text("cover_url"),
	note: text("note"),
	started_on: text("started_on"),
	finished_on: text("finished_on"),
	created_at: text("created_at").notNull().default("CURRENT_TIMESTAMP"),
	updated_at: text("updated_at").notNull().default("CURRENT_TIMESTAMP"),
});
