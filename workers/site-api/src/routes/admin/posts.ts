import { Hono } from "hono";
import { deletePost, getRecentPosts } from "../../data/posts";
import { createDb } from "../../db";
import { postImages, posts } from "../../schema";
import { mimeForExt, safeExt } from "../../utils";
import { renderAdminPosts, renderNewPost } from "../../views/admin-posts";

const admin = new Hono<{ Bindings: Env }>();

admin.get("/", async (c) => {
  const posts = await getRecentPosts(c.env.DB);
  c.header("Cache-Control", "no-store");
  return c.html(renderAdminPosts(posts));
});

admin.get("/new", (c) => {
  const today = new Date().toISOString().slice(0, 10);
  c.header("Cache-Control", "no-store");
  return c.html(renderNewPost(today));
});

admin.post("/posts", async (c) => {
  const formData = await c.req.formData();
  const title = String(formData.get("title") ?? "").trim();
  const caption = String(formData.get("caption") ?? "").trim();
  const today = new Date().toISOString().slice(0, 10);
  const posted_on = String(formData.get("posted_on") ?? today) || today;
  const files = formData.getAll("images").filter((v): v is File => v instanceof File && v.size > 0);
  const takenAts = formData.getAll("taken_at").map((v) => String(v ?? ""));
  if (files.length === 0) return c.json({ error: "no images" }, 400);

  const db = createDb(c.env.DB);
  const [{ postId }] = await db
    .insert(posts)
    .values({ title, caption, posted_on })
    .returning({ postId: posts.id });

  const imageRows = await Promise.all(
    files.map(async (file, i) => {
      const ext = safeExt(file.name);
      const shortHash = crypto.randomUUID().slice(0, 8);
      const key = `posts/${postId}/${i}-${shortHash}.${ext}`;
      await c.env.BUCKET.put(key, await file.arrayBuffer(), {
        httpMetadata: { contentType: mimeForExt(ext) },
      });
      return {
        post_id: postId,
        r2_key: key,
        sort_order: i,
        taken_at: takenAts[i] || null,
      };
    }),
  );
  await db.insert(postImages).values(imageRows);

  return c.json({ ok: true, id: postId, url: `/post/${postId}` });
});

admin.delete("/posts/:id{[0-9]+}", async (c) => {
  const id = Number(c.req.param("id"));
  const ok = await deletePost(c.env, id);
  if (!ok) return c.json({ error: "not found" }, 404);
  return c.json({ ok: true });
});

// HTML-form-friendly variant (browsers can't POST DELETE from <form>)
admin.post("/posts/:id{[0-9]+}/delete", async (c) => {
  const id = Number(c.req.param("id"));
  const ok = await deletePost(c.env, id);
  if (!ok) return c.notFound();
  return c.redirect("/admin");
});

export default admin;
