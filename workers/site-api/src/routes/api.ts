import { Hono } from "hono";
import { corsMiddleware, preflight } from "../cors";
import { getBooks } from "../data/books";
import { getRecentPosts } from "../data/posts";
import { toBook } from "../serializers/book";
import { toDiaryEntry } from "../serializers/diary";

const api = new Hono<{ Bindings: Env }>();

api.use("/*", corsMiddleware);
api.options("/*", preflight);

api.get("/posts", async (c) => {
  const posts = await getRecentPosts(c.env.DB);
  return c.json(posts);
});

api.get("/diary", async (c) => {
  const posts = await getRecentPosts(c.env.DB);
  const origin = new URL(c.req.url).origin;
  const entries = posts.map((post) => toDiaryEntry(post, origin));
  c.header("Cache-Control", "public, max-age=60, s-maxage=300");
  return c.json(entries);
});

api.get("/books", async (c) => {
  const rows = await getBooks(c.env.DB);
  const books = rows.map(toBook);
  c.header("Cache-Control", "public, max-age=60, s-maxage=300");
  return c.json(books);
});

export default api;
