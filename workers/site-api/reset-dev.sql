-- DESTRUCTIVE: disposable local D1 only. Never run against remote D1.
-- After this file, run: bun run db:migrate:local
DROP TABLE IF EXISTS post_images;
DROP TABLE IF EXISTS post_deletions;
DROP TABLE IF EXISTS posts;
DROP TABLE IF EXISTS books;
DROP TABLE IF EXISTS d1_migrations;
