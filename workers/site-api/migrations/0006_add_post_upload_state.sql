-- Existing posts remain published. Only the upload service creates pending rows.
ALTER TABLE posts ADD COLUMN publication_state TEXT NOT NULL DEFAULT 'published';
ALTER TABLE posts ADD COLUMN upload_token TEXT;
ALTER TABLE posts ADD COLUMN upload_keys TEXT NOT NULL DEFAULT '[]';
CREATE UNIQUE INDEX idx_posts_upload_token ON posts(upload_token);
