import { env } from "cloudflare:test";

export const setupPostSchema = async () => {
  await env.DB.prepare(
    "CREATE TABLE IF NOT EXISTS posts (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT NOT NULL DEFAULT '', caption TEXT NOT NULL DEFAULT '', posted_on TEXT NOT NULL, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)",
  ).run();
  await env.DB.prepare(
    "CREATE TABLE IF NOT EXISTS post_images (id INTEGER PRIMARY KEY AUTOINCREMENT, post_id INTEGER NOT NULL, r2_key TEXT NOT NULL UNIQUE, sort_order INTEGER NOT NULL DEFAULT 0, taken_at TEXT, width INTEGER, height INTEGER)",
  ).run();
};
