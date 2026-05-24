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
