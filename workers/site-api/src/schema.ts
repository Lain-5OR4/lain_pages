import { desc, sql } from "drizzle-orm";
import { index, integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";
import type { BookKind, BookStatus } from "../../../shared/types/book";

export const postDeletions = sqliteTable("post_deletions", {
  post_id: integer("post_id").primaryKey(),
  image_keys: text("image_keys").notNull(),
  created_at: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const posts = sqliteTable(
  "posts",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    title: text("title").notNull().default(""),
    caption: text("caption").notNull().default(""),
    posted_on: text("posted_on").notNull(),
    created_at: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
    publication_state: text("publication_state").notNull().default("published"),
    upload_token: text("upload_token"),
    upload_keys: text("upload_keys").notNull().default("[]"),
  },
  (table) => [
    index("idx_posts_feed").on(desc(table.posted_on), desc(table.id)),
    uniqueIndex("idx_posts_upload_token").on(table.upload_token),
  ],
);

export const postImages = sqliteTable(
  "post_images",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    post_id: integer("post_id")
      .notNull()
      .references(() => posts.id, { onDelete: "cascade" }),
    r2_key: text("r2_key").notNull().unique(),
    sort_order: integer("sort_order").notNull().default(0),
    taken_at: text("taken_at"),
    width: integer("width"),
    height: integer("height"),
  },
  (table) => [index("idx_post_images_post").on(table.post_id, table.sort_order)],
);

export const books = sqliteTable(
  "books",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    title: text("title").notNull(),
    author: text("author"),
    kind: text("kind").$type<BookKind>().notNull().default("book"),
    category: text("category"),
    status: text("status").$type<BookStatus>().notNull().default("to_read"),
    rating: integer("rating"),
    isbn: text("isbn"),
    cover_url: text("cover_url"),
    amazon_url: text("amazon_url"),
    publisher: text("publisher"),
    note: text("note"),
    started_on: text("started_on"),
    finished_on: text("finished_on"),
    created_at: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
    updated_at: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [index("idx_books_status").on(table.status, table.id)],
);
