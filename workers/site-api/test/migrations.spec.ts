import { applyD1Migrations, env } from "cloudflare:test";
import { eq } from "drizzle-orm";
import { getTableConfig } from "drizzle-orm/sqlite-core";
import { expect, it } from "vitest";
import { createDb } from "../src/db";
import { books, postDeletions, postImages, posts } from "../src/schema";

const timestamp = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/;

it("uses real timestamp expressions for raw SQL and Drizzle inserts", async () => {
  const db = createDb(env.DB);
  const [book] = await db.insert(books).values({ title: "default test" }).returning();
  const [post] = await db.insert(posts).values({ posted_on: "2026-09-13" }).returning();
  const raw = await env.DB.prepare("INSERT INTO books (title) VALUES ('raw') RETURNING *").first<{
    created_at: string;
    updated_at: string;
  }>();
  for (const value of [
    book.created_at,
    book.updated_at,
    post.created_at,
    raw?.created_at,
    raw?.updated_at,
  ]) {
    expect(value).toMatch(timestamp);
    expect(value).not.toBe("CURRENT_TIMESTAMP");
  }
});

it("enforces image uniqueness, foreign keys, and cascading deletion", async () => {
  const db = createDb(env.DB);
  const [post] = await db.insert(posts).values({ posted_on: "2026-09-13" }).returning();
  await db.insert(postImages).values({ post_id: post.id, r2_key: "posts/test.jpg" });
  await expect(
    env.DB.prepare("INSERT INTO post_images (post_id, r2_key) VALUES (?, ?)")
      .bind(post.id, "posts/test.jpg")
      .run(),
  ).rejects.toThrow(/UNIQUE/);
  await expect(
    env.DB.prepare("INSERT INTO post_images (post_id, r2_key) VALUES (?, ?)")
      .bind(post.id + 999, "posts/orphan.jpg")
      .run(),
  ).rejects.toThrow(/FOREIGN KEY/);
  await db.delete(posts).where(eq(posts.id, post.id));
  expect(await db.select().from(postImages)).toEqual([]);
});

it("keeps Drizzle columns, nullability, unique keys, and indexes aligned with migrated D1", async () => {
  for (const table of [posts, postImages, books, postDeletions]) {
    const config = getTableConfig(table);
    const columns = (
      await env.DB.prepare(`PRAGMA table_info('${config.name}')`).all<{
        name: string;
        notnull: number;
        pk: number;
      }>()
    ).results;
    expect(columns.map((column) => column.name)).toEqual(
      config.columns.map((column) => column.name),
    );
    for (const column of config.columns) {
      const actual = columns.find((item) => item.name === column.name);
      expect(Boolean(actual?.notnull || actual?.pk)).toBe(column.notNull);
    }
    const indexes = (
      await env.DB.prepare(`PRAGMA index_list('${config.name}')`).all<{
        name: string;
        unique: number;
      }>()
    ).results;
    for (const index of config.indexes)
      expect(indexes.map((item) => item.name)).toContain(index.config.name);
    for (const column of config.columns.filter((item) => item.isUnique)) {
      const uniqueColumns = await Promise.all(
        indexes
          .filter((item) => item.unique)
          .map(async (item) =>
            (
              await env.DB.prepare(`PRAGMA index_info('${item.name}')`).all<{ name: string }>()
            ).results.map((entry) => entry.name),
          ),
      );
      expect(uniqueColumns).toContainEqual([column.name]);
    }
  }
  const foreignKeys = (await env.DB.prepare("PRAGMA foreign_key_list('post_images')").all())
    .results;
  expect(foreignKeys).toEqual([
    expect.objectContaining({ table: "posts", from: "post_id", to: "id", on_delete: "CASCADE" }),
  ]);
  const feedIndex = (await env.DB.prepare("PRAGMA index_xinfo('idx_posts_feed')").all()).results;
  expect(feedIndex).toEqual(
    expect.arrayContaining([
      expect.objectContaining({ name: "posted_on", desc: 1 }),
      expect.objectContaining({ name: "id", desc: 1 }),
    ]),
  );
});

it("upgrades a populated pre-0004 database to the same schema without changing user data", async () => {
  const db = env.MIGRATION_TEST_DB;
  const beforeFaceOut = env.TEST_MIGRATIONS.filter(
    (migration) => migration.name < "0004_add_face_out.sql",
  );
  await applyD1Migrations(db, beforeFaceOut);
  await db
    .prepare("UPDATE books SET title = 'user edited title', note = 'keep this' WHERE id = 1")
    .run();
  await db
    .prepare("INSERT INTO posts (title, posted_on) VALUES ('existing post', '2026-09-13')")
    .run();
  await db
    .prepare("INSERT INTO post_images (post_id, r2_key) VALUES (1, 'posts/existing.jpg')")
    .run();
  const snapshot = async () =>
    Promise.all(
      ["books", "posts", "post_images"].map(
        async (table) => (await db.prepare(`SELECT * FROM ${table} ORDER BY id`).all()).results,
      ),
    );
  const before = await snapshot();
  await applyD1Migrations(db, env.TEST_MIGRATIONS);
  const after = await snapshot();
  expect(after[0].map(({ face_out, ...row }) => row)).toEqual(before[0]);
  expect(after[1].map(({ publication_state, upload_token, upload_keys, ...row }) => row)).toEqual(
    before[1],
  );
  expect(after[1][0]).toMatchObject({
    publication_state: "published",
    upload_token: null,
    upload_keys: "[]",
  });
  expect(after[2]).toEqual(before[2]);
  const schema = async (database: D1Database) =>
    (
      await database
        .prepare(
          "SELECT type, name, tbl_name, sql FROM sqlite_master WHERE tbl_name IN ('books', 'posts', 'post_images', 'post_deletions') ORDER BY type, name",
        )
        .all()
    ).results;
  expect(await schema(db)).toEqual(await schema(env.DB));
  await applyD1Migrations(db, env.TEST_MIGRATIONS);
  expect(await snapshot()).toEqual(after);
});
