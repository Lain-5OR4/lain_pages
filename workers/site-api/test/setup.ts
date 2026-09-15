import { applyD1Migrations, env } from "cloudflare:test";

await applyD1Migrations(env.DB, env.TEST_MIGRATIONS);
// Historical migrations include imported reading records. Tests use their own
// data while retaining the exact migrated schema and migration history.
await env.DB.batch([
  env.DB.prepare("DELETE FROM post_deletions"),
  env.DB.prepare("DELETE FROM post_images"),
  env.DB.prepare("DELETE FROM posts"),
  env.DB.prepare("DELETE FROM books"),
  env.DB.prepare("DELETE FROM sqlite_sequence WHERE name IN ('posts', 'post_images', 'books')"),
]);
