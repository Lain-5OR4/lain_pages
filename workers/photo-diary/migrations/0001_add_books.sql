-- Additive-only migration. Apply to prod with:
--   bunx wrangler d1 execute photo-diary-db --remote --file=migrations/0001_add_books.sql --yes
-- Deliberately does NOT touch existing tables — schema.sql (which DROPs
-- everything) must never be re-run against the remote database.

CREATE TABLE IF NOT EXISTS books (
	id          INTEGER PRIMARY KEY AUTOINCREMENT,
	title       TEXT    NOT NULL,
	author      TEXT,
	kind        TEXT    NOT NULL DEFAULT 'book',
	category    TEXT,
	status      TEXT    NOT NULL DEFAULT 'to_read',
	rating      INTEGER,
	isbn        TEXT,
	cover_url   TEXT,
	amazon_url  TEXT,
	publisher   TEXT,
	note        TEXT,
	started_on  TEXT,
	finished_on TEXT,
	created_at  TEXT    NOT NULL DEFAULT CURRENT_TIMESTAMP,
	updated_at  TEXT    NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_books_status ON books(status, id);
