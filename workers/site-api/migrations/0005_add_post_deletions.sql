-- Durable image cleanup records. No foreign key: the post is removed before
-- its R2 objects, and retries must survive that removal.
CREATE TABLE IF NOT EXISTS post_deletions (
  post_id INTEGER PRIMARY KEY,
  image_keys TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
