-- Additive-only migration. Apply to prod with:
--   bunx wrangler d1 execute photo-diary-db --remote --file=migrations/0004_add_face_out.sql --yes
--
-- face_out: was meant as a tri-state override for the /reading bookshelf UI
-- (NULL/1/0), but the decision was to keep face-out selection purely
-- frontend (deterministic rotation in theme.ts), so no application code
-- reads or writes this column. Left as an inert column rather than dropping
-- it — additive-only migrations only, see CLAUDE.md.

ALTER TABLE books ADD COLUMN face_out INTEGER;
