import { env } from "cloudflare:test";
import { afterEach, expect, it, vi } from "vitest";
import {
  getPendingPostDeletions,
  getPostDeletion,
  stageFailedPostCleanup,
} from "../src/data/post-deletions";
import { getPost, getRecentPosts } from "../src/data/posts";
import app from "../src/index";
import { PostDeletionError, deletePost } from "../src/services/delete-post";

afterEach(() => vi.restoreAllMocks());

const keys = ["posts/1/a.jpg", "posts/1/b.jpg"];
async function seed() {
  await env.DB.batch([
    env.DB.prepare(
      "INSERT INTO posts (id, title, posted_on) VALUES (1, 'remove', '2026-09-14'), (2, 'keep', '2026-09-13')",
    ),
    env.DB.prepare(
      "INSERT INTO post_images (post_id, r2_key) VALUES (1, ?), (1, ?), (2, 'posts/2/keep.jpg')",
    ).bind(...keys),
  ]);
  for (const key of [...keys, "posts/2/keep.jpg"]) await env.BUCKET.put(key, "image");
}

async function assertHidden() {
  expect(await getPost(env.DB, 1)).toBeNull();
  expect((await getRecentPosts(env.DB)).map((post) => post.id)).toEqual([2]);
  expect(
    (await env.DB.prepare("SELECT * FROM post_images WHERE post_id = 1").all()).results,
  ).toEqual([]);
  expect(await env.BUCKET.head("posts/2/keep.jpg")).not.toBeNull();
}

async function assertComplete() {
  await assertHidden();
  expect(await getPostDeletion(env.DB, 1)).toBeNull();
  for (const key of keys) expect(await env.BUCKET.head(key)).toBeNull();
}

it.each([
  "BEFORE INSERT ON post_deletions",
  "BEFORE DELETE ON post_images",
  "BEFORE DELETE ON posts",
])("rolls back the entire database change if %s fails", async (trigger) => {
  await seed();
  await env.DB.prepare(
    `CREATE TRIGGER fail_stage ${trigger} BEGIN SELECT RAISE(ABORT, 'stage failed'); END`,
  ).run();
  const remove = vi.spyOn(env.BUCKET, "delete");
  await expect(deletePost(env, 1)).rejects.toMatchObject({
    name: "PostDeletionError",
    step: "database",
    postId: 1,
  });
  expect(remove).not.toHaveBeenCalled();
  expect((await getPost(env.DB, 1))?.images).toHaveLength(2);
  expect(await getPendingPostDeletions(env.DB)).toEqual([]);
  for (const key of keys) expect(await env.BUCKET.head(key)).not.toBeNull();
});

it("persists cleanup after a partial R2 failure and lets the admin retry after reload", async () => {
  await seed();
  const remove = env.BUCKET.delete.bind(env.BUCKET);
  vi.spyOn(env.BUCKET, "delete").mockImplementationOnce(async () => {
    await remove(keys[0]);
    throw new Error("partial R2 failure");
  });
  vi.spyOn(console, "error").mockImplementation(() => {});
  const response = await app.request("/admin/posts/1", { method: "DELETE" }, env);
  expect(response.status).toBe(500);
  await assertHidden();
  expect(JSON.parse((await getPostDeletion(env.DB, 1))?.image_keys ?? "null")).toEqual(keys);
  expect(await env.BUCKET.head(keys[0])).toBeNull();
  expect(await env.BUCKET.head(keys[1])).not.toBeNull();
  const admin = await app.request("/admin", {}, env);
  expect(admin.headers.get("cache-control")).toBe("no-store");
  const body = await admin.text();
  expect(body).toContain("削除を再試行");
  expect(body).toContain('action="/admin/posts/1/delete"');
  expect(body).not.toContain('href="/post/1"');
  const retry = await app.request("/admin/posts/1/delete", { method: "POST" }, env);
  expect(retry.status).toBe(302);
  expect(retry.headers.get("location")).toBe("/admin");
  await assertComplete();
});

it("keeps the cleanup record when finalization fails and safely repeats absent-object deletion", async () => {
  await seed();
  await env.DB.prepare(
    "CREATE TRIGGER fail_finalize BEFORE DELETE ON post_deletions BEGIN SELECT RAISE(ABORT, 'finalize failed'); END",
  ).run();
  await expect(deletePost(env, 1)).rejects.toMatchObject({ step: "finalize" });
  await assertHidden();
  expect(await getPendingPostDeletions(env.DB)).toEqual([1]);
  for (const key of keys) expect(await env.BUCKET.head(key)).toBeNull();
  await env.DB.prepare("DROP TRIGGER fail_finalize").run();
  expect(await deletePost(env, 1)).toBe(true);
  await assertComplete();
});

it("can retry a committed database stage whose acknowledgement was lost", async () => {
  await seed();
  const batch = env.DB.batch.bind(env.DB);
  vi.spyOn(env.DB, "batch").mockImplementationOnce(async (statements) => {
    await batch(statements);
    throw new Error("database acknowledgement lost");
  });
  const remove = vi.spyOn(env.BUCKET, "delete");
  await expect(deletePost(env, 1)).rejects.toBeInstanceOf(PostDeletionError);
  expect(remove).not.toHaveBeenCalled();
  await assertHidden();
  expect(await getPendingPostDeletions(env.DB)).toEqual([1]);
  expect(await deletePost(env, 1)).toBe(true);
  await assertComplete();
});

it("retries when R2 removed all objects but lost its acknowledgement", async () => {
  await seed();
  const remove = env.BUCKET.delete.bind(env.BUCKET);
  vi.spyOn(env.BUCKET, "delete").mockImplementationOnce(async (targets) => {
    await remove(targets);
    throw new Error("R2 acknowledgement lost");
  });
  await expect(deletePost(env, 1)).rejects.toMatchObject({ step: "images" });
  expect(await getPendingPostDeletions(env.DB)).toEqual([1]);
  expect(await deletePost(env, 1)).toBe(true);
  await assertComplete();
});

it("renders a retry form when an HTML deletion request fails", async () => {
  await seed();
  vi.spyOn(env.BUCKET, "delete").mockRejectedValueOnce(new Error("storage unavailable"));
  const log = vi.spyOn(console, "error").mockImplementation(() => {});
  const response = await app.request("/admin/posts/1/delete", { method: "POST" }, env);
  expect(response.status).toBe(500);
  expect(response.headers.get("cache-control")).toBe("no-store");
  const body = await response.text();
  expect(body).toContain('action="/admin/posts/1/delete"');
  expect(body).toContain("削除を再試行");
  expect(body).not.toContain("storage unavailable");
  expect(log).toHaveBeenCalledWith("Post deletion failed", { postId: 1, step: "images" });
  expect(await deletePost(env, 1)).toBe(true);
  await assertComplete();
});

it("handles posts with no images and unknown IDs without touching R2", async () => {
  await env.DB.prepare("INSERT INTO posts (id, posted_on) VALUES (1, '2026-09-14')").run();
  const remove = vi.spyOn(env.BUCKET, "delete");
  expect(await deletePost(env, 1)).toBe(true);
  expect(await deletePost(env, 999)).toBe(false);
  expect(await getPendingPostDeletions(env.DB)).toEqual([]);
  expect(remove).not.toHaveBeenCalled();
});

it("does not discard failed-upload keys added while an older deletion is running", async () => {
  await seed();
  const extraKey = "posts/1/late-upload.jpg";
  await env.BUCKET.put(extraKey, "late upload");
  let release: () => void = () => {};
  let started: () => void = () => {};
  const gate = new Promise<void>((resolve) => {
    release = resolve;
  });
  const entered = new Promise<void>((resolve) => {
    started = resolve;
  });
  const remove = env.BUCKET.delete.bind(env.BUCKET);
  vi.spyOn(env.BUCKET, "delete").mockImplementationOnce(async (targets) => {
    started();
    await gate;
    await remove(targets);
  });
  const first = deletePost(env, 1).catch((error) => error);
  await entered;
  try {
    await stageFailedPostCleanup(env.DB, 1, [keys[0], extraKey]);
  } finally {
    release();
  }
  expect(await first).toMatchObject({ name: "PostDeletionError", step: "finalize" });
  const pending = JSON.parse((await getPostDeletion(env.DB, 1))?.image_keys ?? "null");
  expect(pending.sort()).toEqual([...keys, extraKey].sort());
  expect(await env.BUCKET.head(extraKey)).not.toBeNull();
  expect(await deletePost(env, 1)).toBe(true);
  expect(await env.BUCKET.head(extraKey)).toBeNull();
  await assertComplete();
});

it("allows overlapping retries without losing pending keys or touching another post", async () => {
  await seed();
  let release: () => void = () => {};
  let started: () => void = () => {};
  const gate = new Promise<void>((resolve) => {
    release = resolve;
  });
  const entered = new Promise<void>((resolve) => {
    started = resolve;
  });
  const remove = env.BUCKET.delete.bind(env.BUCKET);
  vi.spyOn(env.BUCKET, "delete").mockImplementationOnce(async (targets) => {
    started();
    await gate;
    await remove(targets);
  });
  const first = deletePost(env, 1);
  await entered;
  try {
    expect(await deletePost(env, 1)).toBe(true);
  } finally {
    release();
    await first;
  }
  await assertComplete();
});
