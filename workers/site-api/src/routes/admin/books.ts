import { Hono } from "hono";
import {
  type NewBook,
  createBook,
  deleteBook,
  getBook,
  getBooks,
  updateBook,
} from "../../data/books";
import { STATUSES, parseBookForm } from "../../inputs/book-form";
import { renderAdminBooks, renderEditBook, renderNewBook } from "../../views/admin-books";

const admin = new Hono<{ Bindings: Env }>();

// --- books (reading log) ---

admin.get("/books", async (c) => {
  const books = await getBooks(c.env.DB);
  c.header("Cache-Control", "no-store");
  return c.html(renderAdminBooks(books));
});

admin.get("/books/new", (c) => {
  c.header("Cache-Control", "no-store");
  return c.html(renderNewBook());
});

admin.post("/books", async (c) => {
  const formData = await c.req.formData();
  const input = parseBookForm(formData);
  if (!input.title) return c.json({ error: "title is required" }, 400);
  const book = await createBook(c.env.DB, input as NewBook);
  return c.redirect(`/admin/books/${book.id}/edit`);
});

admin.get("/books/:id{[0-9]+}/edit", async (c) => {
  const id = Number(c.req.param("id"));
  const book = await getBook(c.env.DB, id);
  if (!book) return c.notFound();
  c.header("Cache-Control", "no-store");
  return c.html(renderEditBook(book));
});

admin.post("/books/:id{[0-9]+}", async (c) => {
  const id = Number(c.req.param("id"));
  const formData = await c.req.formData();
  const input = parseBookForm(formData);
  if (!input.title) return c.json({ error: "title is required" }, 400);
  const book = await updateBook(c.env.DB, id, input);
  if (!book) return c.notFound();
  return c.redirect("/admin/books");
});

// Quick status change from the list row — deliberately narrow (only touches
// `status`) instead of routing through parseBookForm/the full edit POST,
// which would null out every other field not present in a status-only form.
admin.post("/books/:id{[0-9]+}/status", async (c) => {
  const id = Number(c.req.param("id"));
  const formData = await c.req.formData();
  const status = String(formData.get("status") ?? "");
  if (!STATUSES.has(status)) return c.json({ error: "invalid status" }, 400);
  const book = await updateBook(c.env.DB, id, { status: status as NewBook["status"] });
  if (!book) return c.notFound();
  return c.redirect("/admin/books");
});

admin.post("/books/:id{[0-9]+}/delete", async (c) => {
  const id = Number(c.req.param("id"));
  const ok = await deleteBook(c.env.DB, id);
  if (!ok) return c.notFound();
  return c.redirect("/admin/books");
});

export default admin;
