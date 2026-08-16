DROP TABLE IF EXISTS post_images;
DROP TABLE IF EXISTS posts;
DROP TABLE IF EXISTS books;

CREATE TABLE posts (
	id         INTEGER PRIMARY KEY AUTOINCREMENT,
	title      TEXT NOT NULL DEFAULT '',
	caption    TEXT NOT NULL DEFAULT '',
	posted_on  TEXT NOT NULL,
	created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_posts_feed ON posts(posted_on DESC, id DESC);

CREATE TABLE post_images (
	id          INTEGER PRIMARY KEY AUTOINCREMENT,
	post_id     INTEGER NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
	r2_key      TEXT    NOT NULL UNIQUE,
	sort_order  INTEGER NOT NULL DEFAULT 0,
	taken_at    TEXT,
	width       INTEGER,
	height      INTEGER
);
CREATE INDEX idx_post_images_post ON post_images(post_id, sort_order);

CREATE TABLE books (
	id          INTEGER PRIMARY KEY AUTOINCREMENT,
	title       TEXT    NOT NULL,
	author      TEXT,
	kind        TEXT    NOT NULL DEFAULT 'book',
	status      TEXT    NOT NULL DEFAULT 'to_read',
	isbn        TEXT,
	cover_url   TEXT,
	note        TEXT,
	started_on  TEXT,
	finished_on TEXT,
	created_at  TEXT    NOT NULL DEFAULT CURRENT_TIMESTAMP,
	updated_at  TEXT    NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_books_status ON books(status, id);
