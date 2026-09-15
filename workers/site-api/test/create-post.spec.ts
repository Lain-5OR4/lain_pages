import { env } from "cloudflare:test";
import { afterEach, expect, it, vi } from "vitest";
import { getPendingPostDeletions, getPostDeletion } from "../src/data/post-deletions";
import app from "../src/index";
import { createPost, PostCreationError } from "../src/services/create-post";
import { deletePost } from "../src/services/delete-post";

afterEach(() => vi.restoreAllMocks());

const input = (count = 2) => ({
  title: "new post",
  caption: "private caption",
  posted_on: "2026-09-14",
  images: Array.from({ length: count }, (_, i) => ({
    file: new File([new Uint8Array([0xff, 0xd8, i])], `${i}.jpg`, { type: "image/jpeg" }),
    takenAt: i === 0 ? "2026-09-14T12:34:56" : null,
  })),
});

const assertEmpty = async () => {
  expect(await getPendingPostDeletions(env.DB)).toEqual([]);
  expect((await env.DB.prepare("SELECT * FROM posts").all()).results).toEqual([]);
  expect((await env.DB.prepare("SELECT * FROM post_images").all()).results).toEqual([]);
  expect((await env.BUCKET.list()).objects).toEqual([]);
};

const rejectImageRows = () =>
  env.DB.prepare(
    "CREATE TRIGGER fail_images BEFORE INSERT ON post_images BEGIN SELECT RAISE(ABORT, 'image row failure'); END",
  ).run();

it("rejects empty input before creating a post", async () => {
  await expect(createPost(env, input(0))).rejects.toThrow("No images");
  await assertEmpty();
});

it("does not upload images when the initial post insert fails", async () => {
  await env.DB.prepare(
    "CREATE TRIGGER fail_post BEFORE INSERT ON posts BEGIN SELECT RAISE(ABORT, 'post failure'); END",
  ).run();
  const put = vi.spyOn(env.BUCKET, "put");
  const error = await createPost(env, input()).catch((cause) => cause);
  expect(error).toBeInstanceOf(PostCreationError);
  expect(error.postId).toBeUndefined();
  expect(error.cleanupFailures).toEqual([]);
  expect(put).not.toHaveBeenCalled();
  await assertEmpty();
});

it("cleans earlier uploads if reading a later file fails", async () => {
  const data = input();
  vi.spyOn(data.images[1].file, "arrayBuffer").mockRejectedValue(new Error("read failed"));
  const put = vi.spyOn(env.BUCKET, "put");
  await expect(createPost(env, data)).rejects.toBeInstanceOf(PostCreationError);
  expect(put).toHaveBeenCalledTimes(1);
  await assertEmpty();
});

it("cleans a put that committed then rejected, skips later uploads, and preserves existing data", async () => {
  await env.DB.prepare(
    "INSERT INTO posts (id, title, posted_on) VALUES (10, 'keep', '2026-09-01')",
  ).run();
  await env.DB.prepare(
    "INSERT INTO post_images (post_id, r2_key) VALUES (10, 'posts/10/keep.jpg')",
  ).run();
  await env.BUCKET.put("posts/10/keep.jpg", "keep");
  const realPut = env.BUCKET.put.bind(env.BUCKET);
  let calls = 0;
  const put = vi.spyOn(env.BUCKET, "put").mockImplementation(async (key, value, options) => {
    const object = await realPut(key, value, options);
    if (++calls === 2) throw new Error("upload acknowledgement lost");
    return object;
  });
  const error = await createPost(env, input(3)).catch((cause) => cause);
  expect(error).toBeInstanceOf(PostCreationError);
  expect(error.cleanupFailures).toEqual([]);
  expect(error.attemptedKeys).toHaveLength(2);
  expect(put).toHaveBeenCalledTimes(2);
  expect((await env.DB.prepare("SELECT id FROM posts").all()).results).toEqual([{ id: 10 }]);
  expect((await env.DB.prepare("SELECT post_id FROM post_images").all()).results).toEqual([
    { post_id: 10 },
  ]);
  expect((await env.BUCKET.list()).objects.map((object) => object.key)).toEqual([
    "posts/10/keep.jpg",
  ]);
});

it("rolls back all images and the post if the image-row insert fails", async () => {
  await rejectImageRows();
  const put = vi.spyOn(env.BUCKET, "put");
  const error = await createPost(env, input()).catch((cause) => cause);
  expect(error).toBeInstanceOf(PostCreationError);
  expect(error.cleanupFailures).toEqual([]);
  expect(put).toHaveBeenCalledTimes(2);
  await assertEmpty();
});

it("preserves R2 objects and reports the post ID when database rollback fails", async () => {
  await rejectImageRows();
  await env.DB.prepare(
    "CREATE TRIGGER fail_delete BEFORE DELETE ON posts BEGIN SELECT RAISE(ABORT, 'rollback failure'); END",
  ).run();
  const remove = vi.spyOn(env.BUCKET, "delete");
  const error = await createPost(env, input()).catch((cause) => cause);
  expect(error).toBeInstanceOf(PostCreationError);
  expect(error.cleanupFailures.map((failure: { step: string }) => failure.step)).toEqual([
    "database",
  ]);
  expect(remove).not.toHaveBeenCalled();
  expect((await env.DB.prepare("SELECT id FROM posts").all()).results).toEqual([
    { id: error.postId },
  ]);
  expect((await env.BUCKET.list()).objects.map((object) => object.key).sort()).toEqual(
    [...error.attemptedKeys].sort(),
  );
});

it("persists failed upload cleanup and retries it through the admin after R2 recovers", async () => {
  await rejectImageRows();
  vi.spyOn(env.BUCKET, "delete").mockRejectedValueOnce(new Error("R2 unavailable"));
  const error = await createPost(env, input()).catch((cause) => cause);
  expect(error).toBeInstanceOf(PostCreationError);
  expect(error.cleanupFailures.map((failure: { step: string }) => failure.step)).toEqual([
    "images",
  ]);
  expect((await env.DB.prepare("SELECT * FROM posts").all()).results).toEqual([]);
  expect((await env.DB.prepare("SELECT * FROM post_images").all()).results).toEqual([]);
  expect((await env.BUCKET.list()).objects.map((object) => object.key).sort()).toEqual(
    [...error.attemptedKeys].sort(),
  );
  expect(JSON.parse((await getPostDeletion(env.DB, error.postId))?.image_keys ?? "null")).toEqual(
    error.attemptedKeys,
  );
  const admin = await app.request("/admin", {}, env);
  expect(await admin.text()).toContain(`action="/admin/posts/${error.postId}/delete"`);
  const retry = await app.request(`/admin/posts/${error.postId}/delete`, { method: "POST" }, env);
  expect(retry.status).toBe(302);
  await assertEmpty();
});

it("retains the post and objects if saving the cleanup record fails", async () => {
  await rejectImageRows();
  await env.DB.prepare(
    "CREATE TRIGGER fail_cleanup_record BEFORE INSERT ON post_deletions BEGIN SELECT RAISE(ABORT, 'record unavailable'); END",
  ).run();
  const remove = vi.spyOn(env.BUCKET, "delete");
  const error = await createPost(env, input()).catch((cause) => cause);
  expect(error).toBeInstanceOf(PostCreationError);
  expect(error.cleanupFailures.map((failure: { step: string }) => failure.step)).toEqual([
    "database",
  ]);
  expect(remove).not.toHaveBeenCalled();
  expect(await getPendingPostDeletions(env.DB)).toEqual([]);
  expect(
    await env.DB.prepare("SELECT id FROM posts WHERE id = ?").bind(error.postId).first(),
  ).not.toBeNull();
  expect((await env.BUCKET.list()).objects).toHaveLength(2);
});

it("retries cleanup if its database commit succeeds but the response fails", async () => {
  await rejectImageRows();
  const batch = env.DB.batch.bind(env.DB);
  vi.spyOn(env.DB, "batch").mockImplementationOnce(async (statements) => {
    await batch(statements);
    throw new Error("cleanup commit response lost");
  });
  const error = await createPost(env, input()).catch((cause) => cause);
  expect(error.cleanupFailures.map((failure: { step: string }) => failure.step)).toEqual([
    "database",
  ]);
  expect(await getPendingPostDeletions(env.DB)).toEqual([error.postId]);
  expect((await env.DB.prepare("SELECT * FROM posts").all()).results).toEqual([]);
  expect(await deletePost(env, error.postId)).toBe(true);
  await assertEmpty();
});

it("retains completed image cleanup for retry if deleting the record fails", async () => {
  await rejectImageRows();
  await env.DB.prepare(
    "CREATE TRIGGER fail_finalize BEFORE DELETE ON post_deletions BEGIN SELECT RAISE(ABORT, 'finalize unavailable'); END",
  ).run();
  const error = await createPost(env, input()).catch((cause) => cause);
  expect(error.cleanupFailures.map((failure: { step: string }) => failure.step)).toEqual([
    "finalize",
  ]);
  expect((await env.BUCKET.list()).objects).toEqual([]);
  expect(await getPendingPostDeletions(env.DB)).toEqual([error.postId]);
  await env.DB.prepare("DROP TRIGGER fail_finalize").run();
  expect(await deletePost(env, error.postId)).toBe(true);
  await assertEmpty();
});

it.each([false, true])(
  "handles a committed image insert with a lost response (rollback fails: %s)",
  async (rollbackFails) => {
    if (rollbackFails) {
      await env.DB.prepare(
        "CREATE TRIGGER fail_delete BEFORE DELETE ON posts BEGIN SELECT RAISE(ABORT, 'rollback failure'); END",
      ).run();
    }
    const prepare = env.DB.prepare.bind(env.DB);
    vi.spyOn(env.DB, "prepare").mockImplementation((query) => {
      const statement = prepare(query);
      if (query.startsWith('insert into "post_images"')) {
        const bind = statement.bind.bind(statement);
        vi.spyOn(statement, "bind").mockImplementation((...values) => {
          const bound = bind(...values);
          const run = bound.run.bind(bound);
          vi.spyOn(bound, "run").mockImplementation(async () => {
            await run();
            throw new Error("image insert acknowledgement lost");
          });
          return bound;
        });
      }
      return statement;
    });
    const error = await createPost(env, input()).catch((cause) => cause);
    expect(error).toBeInstanceOf(PostCreationError);
    if (!rollbackFails) {
      expect(error.cleanupFailures).toEqual([]);
      await assertEmpty();
      return;
    }
    expect(error.cleanupFailures.map((failure: { step: string }) => failure.step)).toEqual([
      "database",
    ]);
    // A failed transactional rollback leaves image rows intact; their objects
    // must also survive rather than turning this into a broken published post.
    const rows = (
      await env.DB.prepare("SELECT r2_key FROM post_images ORDER BY sort_order").all<{
        r2_key: string;
      }>()
    ).results;
    expect(rows.map((row) => row.r2_key)).toEqual(error.attemptedKeys);
    for (const row of rows) expect(await env.BUCKET.head(row.r2_key)).not.toBeNull();
  },
);

it("returns a generic 500 response and logs cleanup context without exposing form contents", async () => {
  await rejectImageRows();
  const log = vi.spyOn(console, "error").mockImplementation(() => {});
  const data = input(1);
  const form = new FormData();
  form.append("title", data.title);
  form.append("caption", data.caption);
  form.append("images", data.images[0].file);
  const response = await app.request("/admin/posts", { method: "POST", body: form }, env);
  expect(response.status).toBe(500);
  expect(await response.json()).toEqual({ error: "Failed to save post" });
  expect(log).toHaveBeenCalledWith("Post creation failed", {
    uploadToken: expect.any(String),
    postId: expect.any(Number),
    attemptedKeys: [expect.any(String)],
    cleanupFailures: [],
  });
  expect(JSON.stringify(log.mock.calls)).not.toContain(data.caption);
  await assertEmpty();
});
