// Capture keys and remove public rows atomically. INSERT...SELECT avoids a
// separate read/snapshot window; a retry keeps its previously recorded keys.
export async function stagePostDeletion(db: D1Database, postId: number): Promise<void> {
  await db.batch([
    db
      .prepare(`INSERT INTO post_deletions (post_id, image_keys)
      SELECT p.id, (SELECT json_group_array(value) FROM (
        SELECT r2_key AS value FROM post_images WHERE post_id = p.id
        UNION SELECT value FROM json_each(p.upload_keys)
      ))
      FROM posts p WHERE p.id = ?
      ON CONFLICT(post_id) DO NOTHING`)
      .bind(postId),
    db.prepare("DELETE FROM post_images WHERE post_id = ?").bind(postId),
    db.prepare("DELETE FROM posts WHERE id = ?").bind(postId),
  ]);
}

// Failed uploads may have keys that never reached post_images. Persist them in
// the same transaction that removes the failed post, merging any concurrent
// deletion record rather than discarding keys already scheduled for cleanup.
export async function stageFailedPostCleanup(
  db: D1Database,
  postId: number,
  keys: string[],
): Promise<void> {
  await db.batch([
    db
      .prepare(`INSERT INTO post_deletions (post_id, image_keys) VALUES (?, ?)
      ON CONFLICT(post_id) DO UPDATE SET image_keys = (
        SELECT json_group_array(value) FROM (
          SELECT value FROM json_each(post_deletions.image_keys)
          UNION SELECT value FROM json_each(excluded.image_keys)
        )
      )`)
      .bind(postId, JSON.stringify(keys)),
    db.prepare("DELETE FROM post_images WHERE post_id = ?").bind(postId),
    db.prepare("DELETE FROM posts WHERE id = ?").bind(postId),
  ]);
}

export const getPostDeletion = (db: D1Database, postId: number) =>
  db
    .prepare("SELECT image_keys FROM post_deletions WHERE post_id = ?")
    .bind(postId)
    .first<{ image_keys: string }>();

export async function getPendingPostDeletions(db: D1Database): Promise<number[]> {
  const { results } = await db
    .prepare("SELECT post_id FROM post_deletions ORDER BY created_at, post_id")
    .all<{ post_id: number }>();
  return results.map((row) => row.post_id);
}

export const finishPostDeletion = (db: D1Database, postId: number, imageKeys: string) =>
  db
    .prepare("DELETE FROM post_deletions WHERE post_id = ? AND image_keys = ?")
    .bind(postId, imageKeys)
    .run();
