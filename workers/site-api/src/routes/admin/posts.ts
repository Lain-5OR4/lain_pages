import { Hono } from "hono";
import { getPendingPostDeletions } from "../../data/post-deletions";
import { getPendingUploads, getRecentPosts } from "../../data/posts";
import { PostCreationError, createPost } from "../../services/create-post";
import { PostDeletionError, deletePost } from "../../services/delete-post";
import { renderAdminPosts, renderDeleteFailure, renderNewPost } from "../../views/admin-posts";

const admin = new Hono<{ Bindings: Env }>();

admin.get("/", async (c) => {
  const posts = await getRecentPosts(c.env.DB);
  const pendingDeletions = await getPendingPostDeletions(c.env.DB);
  const pendingUploads = await getPendingUploads(c.env.DB);
  c.header("Cache-Control", "no-store");
  return c.html(renderAdminPosts(posts, pendingDeletions, pendingUploads));
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

  try {
    const postId = await createPost(c.env, {
      title,
      caption,
      posted_on,
      images: files.map((file, i) => ({ file, takenAt: takenAts[i] || null })),
    });
    return c.json({ ok: true, id: postId, url: `/post/${postId}` });
  } catch (error) {
    console.error(
      "Post creation failed",
      error instanceof PostCreationError
        ? {
            postId: error.postId,
            uploadToken: error.uploadToken,
            attemptedKeys: error.attemptedKeys,
            cleanupFailures: error.cleanupFailures.map((failure) => failure.step),
          }
        : { unexpected: true },
    );
    return c.json({ error: "Failed to save post" }, 500);
  }
});

admin.delete("/posts/:id{[0-9]+}", async (c) => {
  const id = Number(c.req.param("id"));
  try {
    const ok = await deletePost(c.env, id);
    if (!ok) return c.json({ error: "not found" }, 404);
    return c.json({ ok: true });
  } catch (error) {
    logDeletionFailure(id, error);
    return c.json({ error: "Failed to delete post. Please retry." }, 500);
  }
});

// HTML-form-friendly variant (browsers can't POST DELETE from <form>)
admin.post("/posts/:id{[0-9]+}/delete", async (c) => {
  const id = Number(c.req.param("id"));
  try {
    const ok = await deletePost(c.env, id);
    if (!ok) return c.notFound();
    return c.redirect("/admin");
  } catch (error) {
    logDeletionFailure(id, error);
    c.header("Cache-Control", "no-store");
    return c.html(renderDeleteFailure(id), 500);
  }
});

function logDeletionFailure(postId: number, error: unknown) {
  console.error("Post deletion failed", {
    postId,
    step: error instanceof PostDeletionError ? error.step : "unknown",
  });
}

export default admin;
