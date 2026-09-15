-- Initial photo tables, previously maintained only in schema.sql.
-- Existing tables are preserved; existing databases require a schema/history audit.
CREATE TABLE IF NOT EXISTS posts (
	id         INTEGER PRIMARY KEY AUTOINCREMENT,
	title      TEXT NOT NULL DEFAULT '',
	caption    TEXT NOT NULL DEFAULT '',
	posted_on  TEXT NOT NULL,
	created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_posts_feed ON posts(posted_on DESC, id DESC);

CREATE TABLE IF NOT EXISTS post_images (
	id          INTEGER PRIMARY KEY AUTOINCREMENT,
	post_id     INTEGER NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
	r2_key      TEXT    NOT NULL UNIQUE,
	sort_order  INTEGER NOT NULL DEFAULT 0,
	taken_at    TEXT,
	width       INTEGER,
	height      INTEGER
);
CREATE INDEX IF NOT EXISTS idx_post_images_post ON post_images(post_id, sort_order);

