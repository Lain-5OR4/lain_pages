import { type Context, Hono } from "hono";
import {
  createBook,
  deleteBook,
  getBook,
  getBooks,
  type NewBook,
  updateBook,
} from "../../data/books";
import { parseBookForm, STATUSES } from "../../inputs/book-form";
import { renderAdminBooks, renderEditBook, renderNewBook } from "../../views/admin-books";

const admin = new Hono<{ Bindings: Env }>();

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
  try {
    const book = await createBook(c.env.DB, input as NewBook);
    return c.redirect(`/admin/books/${book.id}/edit`);
  } catch (error) {
    console.error("Book creation failed", error);
    return c.json({ error: "Failed to save book" }, 500);
  }
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
  try {
    const book = await updateBook(c.env.DB, id, input);
    if (!book) return c.notFound();
    return c.redirect("/admin/books");
  } catch (error) {
    console.error("Book update failed", { id, error });
    return c.json({ error: "Failed to save book" }, 500);
  }
});

const updateBookStatusOnly = async (c: Context<{ Bindings: Env }>) => {
  const id = Number(c.req.param("id"));
  const formData = await c.req.formData();
  const status = String(formData.get("status") ?? "");
  if (!STATUSES.has(status)) return c.json({ error: "invalid status" }, 400);
  try {
    const book = await updateBook(c.env.DB, id, { status: status as NewBook["status"] });
    if (!book) return c.notFound();
    return c.redirect("/admin/books");
  } catch (error) {
    console.error("Book status update failed", { id, error });
    return c.json({ error: "Failed to update status" }, 500);
  }
};
admin.post("/books/:id{[0-9]+}/status", updateBookStatusOnly);

admin.post("/books/:id{[0-9]+}/delete", async (c) => {
  const id = Number(c.req.param("id"));
  try {
    const ok = await deleteBook(c.env.DB, id);
    if (!ok) return c.notFound();
    return c.redirect("/admin/books");
  } catch (error) {
    console.error("Book deletion failed", { id, error });
    return c.json({ error: "Failed to delete book" }, 500);
  }
});

export default admin;
