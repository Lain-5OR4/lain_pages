import { SELF, env } from "cloudflare:test";
import { afterEach, beforeAll, expect, it, vi } from "vitest";
import { getRecentPosts } from "../src/data/posts";
import { setupPostSchema } from "./fixtures/posts";

beforeAll(setupPostSchema);
afterEach(() => vi.restoreAllMocks());

it("returns the latest 50 posts and reads only their images", async () => {
  await env.DB.batch(
    Array.from({ length: 55 }, (_, i) =>
      env.DB.prepare("INSERT INTO posts (id, title, posted_on) VALUES (?, ?, '2026-05-12')").bind(
        i + 1,
        `post ${i + 1}`,
      ),
    ),
  );
  await env.DB.batch(
    Array.from({ length: 55 }, (_, i) =>
      env.DB.prepare("INSERT INTO post_images (post_id, r2_key) VALUES (?, ?)").bind(
        i + 1,
        `posts/${i + 1}/a.jpg`,
      ),
    ),
  );

  // Observe real D1 reads, so returning 50 posts after loading every image
  // does not accidentally pass this regression check.
  const imageReads: Array<() => Array<{ value: unknown }>> = [];
  const prepare = env.DB.prepare.bind(env.DB);
  vi.spyOn(env.DB, "prepare").mockImplementation((query) => {
    const statement = prepare(query);
    if (query.includes('"post_images"')) {
      const bind = statement.bind.bind(statement);
      vi.spyOn(statement, "bind").mockImplementation((...values) => {
        const bound = bind(...values);
        const read = vi.spyOn(bound, "raw");
        imageReads.push(() => read.mock.results);
        return bound;
      });
    }
    return statement;
  });

  const posts = await getRecentPosts(env.DB);
  expect(posts.map((p) => p.id)).toEqual(Array.from({ length: 50 }, (_, i) => 55 - i));
  expect(posts.every((p) => p.images[0]?.key === `posts/${p.id}/a.jpg`)).toBe(true);
  expect(imageReads).toHaveLength(1);
  const reads = imageReads[0]();
  expect(reads).toHaveLength(1);
  expect(await reads[0].value).toHaveLength(50);
});

it("skips the image query when no posts exist and returns an empty public diary", async () => {
  const prepare = vi.spyOn(env.DB, "prepare");
  expect(await getRecentPosts(env.DB)).toEqual([]);
  expect(prepare.mock.calls).toHaveLength(1);
  const response = await SELF.fetch("https://example.com/api/diary");
  expect(response.status).toBe(200);
  expect(await response.json()).toEqual([]);
  expect(response.headers.get("cache-control")).toBe("public, max-age=60, s-maxage=300");
});

it("preserves date priority, image order, and posts without images with a custom limit", async () => {
  await env.DB.batch([
    env.DB.prepare(
      "INSERT INTO posts (id, posted_on) VALUES (1, '2026-05-13'), (2, '2026-05-12'), (3, '2026-05-12')",
    ),
    env.DB.prepare(
      "INSERT INTO post_images (post_id, r2_key, sort_order) VALUES (1, 'second.jpg', 1), (1, 'first.jpg', 0), (2, 'excluded.jpg', 0)",
    ),
  ]);
  const posts = await getRecentPosts(env.DB, 2);
  expect(posts.map((p) => p.id)).toEqual([1, 3]);
  expect(posts[0].images).toEqual([
    { key: "first.jpg", taken_at: null },
    { key: "second.jpg", taken_at: null },
  ]);
  expect(posts[1].images).toEqual([]);
});

it("returns no posts for a zero limit", async () => {
  await env.DB.prepare("INSERT INTO posts (posted_on) VALUES ('2026-05-12')").run();
  const prepare = vi.spyOn(env.DB, "prepare");
  expect(await getRecentPosts(env.DB, 0)).toEqual([]);
  expect(prepare.mock.calls).toHaveLength(1);
});
