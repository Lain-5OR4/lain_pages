import { env } from "cloudflare:test";
import { afterEach, expect, it, vi } from "vitest";
import { getPost, getRecentPosts } from "../src/data/posts";
import app from "../src/index";
import { PostCreationError, createPost } from "../src/services/create-post";
import { deletePost } from "../src/services/delete-post";

afterEach(() => vi.restoreAllMocks());
const input = () => ({
  title: "pending upload",
  caption: "caption",
  posted_on: "2026-09-14",
  images: [0, 1].map((i) => ({ file: new File([new Uint8Array([i])], `${i}.jpg`), takenAt: null })),
});

it("records every key before uploading and exposes only a fully published post", async () => {
  let release!: () => void;
  let entered!: () => void;
  const gate = new Promise<void>((resolve) => {
    release = resolve;
  });
  const ready = new Promise<void>((resolve) => {
    entered = resolve;
  });
  const put = env.BUCKET.put.bind(env.BUCKET);
  vi.spyOn(env.BUCKET, "put").mockImplementationOnce(async (...args) => {
    const object = await put(...args);
    entered();
    await gate;
    return object;
  });
  const creation = createPost(env, input());
  await ready;
  try {
    const row = await env.DB.prepare("SELECT * FROM posts").first<{
      id: number;
      publication_state: string;
      upload_keys: string;
      upload_token: string;
    }>();
    if (!row) throw new Error("Expected pending post");
    expect(row.publication_state).toBe("pending");
    expect(row?.upload_token).toEqual(expect.any(String));
    const keys = JSON.parse(row.upload_keys) as string[];
    expect(keys).toHaveLength(2);
    expect(await env.BUCKET.head(keys[0])).not.toBeNull();
    expect(await getRecentPosts(env.DB)).toEqual([]);
    for (const url of ["/api/posts", "/api/diary"]) {
      expect(await (await app.request(url, {}, env)).json()).toEqual([]);
    }
    expect(await getPost(env.DB, row.id)).toBeNull();
    expect((await app.request(`/post/${row.id}`, {}, env)).status).toBe(404);
    expect((await app.request(`/images/${keys[0]}`, {}, env)).status).toBe(404);
    const admin = await app.request("/admin", {}, env);
    expect(await admin.text()).toContain("pending upload");
  } finally {
    release();
    await creation;
  }
  const id = await creation;
  const post = await getPost(env.DB, id);
  if (!post) throw new Error("Expected published post");
  expect(post?.images).toHaveLength(2);
  expect(await (await app.request("/api/posts", {}, env)).json()).toEqual([post]);
  expect(Object.keys(post).sort()).toEqual(
    ["id", "title", "caption", "posted_on", "created_at", "images"].sort(),
  );
  expect(
    await env.DB.prepare("SELECT publication_state, upload_keys, upload_token FROM posts").first(),
  ).toEqual({ publication_state: "published", upload_keys: "[]", upload_token: null });
  const imageResponse = await app.request(`/images/${post.images[0].key}`, {}, env);
  expect(imageResponse.status).toBe(200);
  expect(new Uint8Array(await imageResponse.arrayBuffer())).toEqual(new Uint8Array([0]));
});

it("removes interrupted uploads using the manifest even without image rows", async () => {
  const keys = ["posts/1/first.jpg", "posts/1/second.jpg"];
  await env.DB.prepare(
    "INSERT INTO posts (id, title, posted_on, publication_state, upload_token, upload_keys) VALUES (1, 'interrupted', '2026-09-14', 'pending', 'token', ?)",
  )
    .bind(JSON.stringify(keys))
    .run();
  await env.DB.prepare(
    "INSERT INTO posts (id, title, posted_on) VALUES (2, 'existing', '2026-09-13')",
  ).run();
  await env.BUCKET.put(keys[0], "stored before interruption");
  expect(await deletePost(env, 1)).toBe(true);
  expect(await env.BUCKET.head(keys[0])).toBeNull();
  expect(await env.DB.prepare("SELECT id FROM posts ORDER BY id").all()).toMatchObject({
    results: [{ id: 2 }],
  });
});

// Simulate a D1 commit whose RETURNING response never reaches the caller.
function loseReturningResponse(prefix: string) {
  const prepare = env.DB.prepare.bind(env.DB);
  let failed = false;
  vi.spyOn(env.DB, "prepare").mockImplementation((query) => {
    const statement = prepare(query);
    if (query.startsWith(prefix)) {
      const bind = statement.bind.bind(statement);
      vi.spyOn(statement, "bind").mockImplementation((...values) => {
        const bound = bind(...values);
        const raw = bound.raw.bind(bound);
        vi.spyOn(bound, "raw").mockImplementation(async () => {
          const result = await raw();
          if (!failed) {
            failed = true;
            throw new Error("acknowledgement lost");
          }
          return result;
        });
        return bound;
      });
    }
    return statement;
  });
}

it("recovers the initial insert ID after a lost response and cleans the pending row", async () => {
  loseReturningResponse('insert into "posts"');
  const error = await createPost(env, input()).catch((cause) => cause);
  expect(error).toBeInstanceOf(PostCreationError);
  expect(error.postId).toEqual(expect.any(Number));
  expect(error.cleanupFailures).toEqual([]);
  expect((await env.DB.prepare("SELECT * FROM posts").all()).results).toEqual([]);
  expect((await env.BUCKET.list()).objects).toEqual([]);
});

it("keeps a successfully published post when the publication response is lost", async () => {
  loseReturningResponse('update "posts" set "publication_state"');
  const id = await createPost(env, input());
  const post = await getPost(env.DB, id);
  if (!post) throw new Error("Expected published post");
  expect(post?.images).toHaveLength(2);
  for (const image of post.images) expect(await env.BUCKET.head(image.key)).not.toBeNull();
});

it("cleans up when publication fails before committing", async () => {
  await env.DB.prepare(
    "CREATE TRIGGER fail_publish BEFORE UPDATE OF publication_state ON posts WHEN NEW.publication_state = 'published' BEGIN SELECT RAISE(ABORT, 'publication failed'); END",
  ).run();
  await expect(createPost(env, input())).rejects.toBeInstanceOf(PostCreationError);
  expect(await getRecentPosts(env.DB)).toEqual([]);
  expect((await env.DB.prepare("SELECT * FROM posts").all()).results).toEqual([]);
  expect((await env.BUCKET.list()).objects).toEqual([]);
});

it("does not serve bucket objects unassociated with a published image row", async () => {
  await env.BUCKET.put("posts/orphan.jpg", "orphan");
  expect((await app.request("/images/posts/orphan.jpg", {}, env)).status).toBe(404);
});
