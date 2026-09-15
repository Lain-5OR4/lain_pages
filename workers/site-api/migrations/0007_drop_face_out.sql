-- books.face_out (added by 0004) was never read or written by any
-- application code; confirmed 0 non-null values in prod before dropping.
-- Apply to prod with:
--   bunx wrangler d1 execute photo-diary-db --remote --file=migrations/0007_drop_face_out.sql --yes

ALTER TABLE books DROP COLUMN face_out;
