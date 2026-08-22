import { Hono } from "hono";
import { html, raw } from "hono/html";
import {
	createBook,
	createDb,
	deleteBook,
	deletePost,
	getBook,
	getBooks,
	getRecentPosts,
	type NewBook,
	updateBook,
} from "../db";
import { posts, postImages } from "../schema";
import { mimeForExt, safeExt } from "../utils";
import { UPLOAD_SCRIPT, layout, renderBookForm } from "../views";

const KINDS = new Set(["book", "article"]);
const STATUSES = new Set(["to_read", "reading", "done"]);

// Every editable field lives on this one form (see renderBookForm) so status,
// rating, dates, and cover/amazon links can all be set without Notion.
const parseBookForm = (formData: FormData): Partial<NewBook> => {
	const str = (key: string) => {
		const v = String(formData.get(key) ?? "").trim();
		return v || null;
	};
	const kind = String(formData.get("kind") ?? "");
	const status = String(formData.get("status") ?? "");
	const ratingRaw = Number(formData.get("rating"));
	return {
		title: String(formData.get("title") ?? "").trim(),
		author: str("author"),
		kind: KINDS.has(kind) ? (kind as NewBook["kind"]) : "book",
		status: STATUSES.has(status) ? (status as NewBook["status"]) : "to_read",
		rating: ratingRaw >= 1 && ratingRaw <= 5 ? ratingRaw : null,
		category: str("category"),
		isbn: str("isbn"),
		cover_url: str("cover_url"),
		amazon_url: str("amazon_url"),
		publisher: str("publisher"),
		note: str("note"),
		started_on: str("started_on"),
		finished_on: str("finished_on"),
	};
};

const admin = new Hono<{ Bindings: Env }>();

admin.get("/", async (c) => {
	const posts = await getRecentPosts(c.env.DB);
	c.header("Cache-Control", "no-store");
	const total = posts.length;
	return c.html(
		layout({
			title: "admin — photo-diary",
			noStore: true,
			section: "Editorial Desk",
			issue: `${total} ${total === 1 ? "Entry" : "Entries"}`,
			body: html`
				<a class="new-entry-cta" href="/admin/new">+ New Entry</a>
				${posts.length === 0
					? html`<p class="empty">No entries yet — start with a new one.</p>`
					: html`<ul class="entries">
							${posts.map(
								(p, i) =>
									html`<li>
										<span class="num"
											>${String(total - i).padStart(2, "0")}</span
										>
										<span class="date">${p.posted_on}</span>
										<span class="title"
											><a href="/post/${p.id}"
												>${p.title || p.caption || "(untitled)"}</a
											></span
										>
										<span class="count"
											>${p.images.length}
											${p.images.length === 1 ? "photo" : "photos"}</span
										>
										<span class="del">
											<form
												method="POST"
												action="/admin/posts/${p.id}/delete"
												onsubmit="return confirm('Delete #${p.id}?')"
											>
												<button type="submit">Delete</button>
											</form>
										</span>
									</li>`,
							)}
						</ul>`}
			`,
		}),
	);
});

admin.get("/new", (c) => {
	const today = new Date().toISOString().slice(0, 10);
	c.header("Cache-Control", "no-store");
	return c.html(
		layout({
			title: "new entry — photo-diary",
			noStore: true,
			section: "New Entry",
			issue: "Draft",
			body: html`
				<p class="back"><a href="/admin">← Editorial Desk</a></p>
				<form
					id="new-post-form"
					action="/admin/posts"
					method="POST"
					enctype="multipart/form-data"
				>
					<div class="field">
						<span class="field-num">01</span>
						<div class="field-body">
							<label>Title</label>
							<input type="text" name="title" autocomplete="off" />
						</div>
					</div>

					<div class="field">
						<span class="field-num">02</span>
						<div class="field-body">
							<label
								>Images
								<span style="color:var(--ink); margin-left:0.5em"
									>(<span id="count">0</span>)</span
								></label
							>
							<div id="thumbs" class="thumbs" style="display:none"></div>
							<div id="dropzone" class="dropzone" tabindex="0">
								drop files here / click to select
							</div>
							<input
								id="file-input"
								type="file"
								name="images"
								accept="image/*"
								multiple
								style="display:none"
							/>
						</div>
					</div>

					<div class="field">
						<span class="field-num">03</span>
						<div class="field-body">
							<label>Date Posted</label>
							<input type="date" name="posted_on" value="${today}" required />
						</div>
					</div>

					<div class="field">
						<span class="field-num">04</span>
						<div class="field-body">
							<label>Caption</label>
							<textarea name="caption" placeholder="(optional)"></textarea>
						</div>
					</div>

					<div class="submit-row">
						<div class="progress"><span id="progress-bar"></span></div>
						<button type="submit">Publish</button>
					</div>
					<div id="upload-status"></div>
				</form>
				<script type="module">
					${raw(UPLOAD_SCRIPT)};
				</script>
			`,
		}),
	);
});

admin.post("/posts", async (c) => {
	const formData = await c.req.formData();
	const title = String(formData.get("title") ?? "").trim();
	const caption = String(formData.get("caption") ?? "").trim();
	const today = new Date().toISOString().slice(0, 10);
	const posted_on = String(formData.get("posted_on") ?? today) || today;
	const files = formData
		.getAll("images")
		.filter((v): v is File => v instanceof File && v.size > 0);
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

// --- books (reading log) ---

const STATUS_LABEL: Record<string, string> = {
	to_read: "積読",
	reading: "読書中",
	done: "読了",
};

admin.get("/books", async (c) => {
	const books = await getBooks(c.env.DB);
	c.header("Cache-Control", "no-store");
	return c.html(
		layout({
			title: "books admin — photo-diary",
			noStore: true,
			section: "Reading Log",
			issue: `${books.length} Books`,
			body: html`
				<p class="back"><a href="/admin">← Photo Admin</a></p>
				<a class="new-entry-cta" href="/admin/books/new">+ New Book</a>
				${books.length === 0
					? html`<p class="empty">No books yet — start with a new one.</p>`
					: html`<ul class="books">
							${books.map(
								(b) =>
									html`<li>
										<span class="status">${STATUS_LABEL[b.status] ?? b.status}</span>
										<span class="title"
											>${b.title}${b.author
												? html`<span class="author">${b.author}</span>`
												: ""}</span
										>
										<span class="rating">${b.rating ? "★".repeat(b.rating) : ""}</span>
										<span class="edit"><a href="/admin/books/${b.id}/edit">Edit</a></span>
										<span class="del">
											<form
												method="POST"
												action="/admin/books/${b.id}/delete"
												onsubmit="return confirm('Delete “${b.title}”?')"
											>
												<button type="submit">Delete</button>
											</form>
										</span>
									</li>`,
							)}
						</ul>`}
			`,
		}),
	);
});

admin.get("/books/new", (c) => {
	c.header("Cache-Control", "no-store");
	return c.html(
		layout({
			title: "new book — photo-diary",
			noStore: true,
			section: "New Book",
			issue: "Draft",
			body: html`
				<p class="back"><a href="/admin/books">← Reading Log</a></p>
				${renderBookForm({ action: "/admin/books", submitLabel: "Add Book" })}
			`,
		}),
	);
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
	return c.html(
		layout({
			title: `edit — ${book.title}`,
			noStore: true,
			section: "Edit Book",
			issue: `#${book.id}`,
			body: html`
				<p class="back"><a href="/admin/books">← Reading Log</a></p>
				${renderBookForm({ action: `/admin/books/${id}`, submitLabel: "Save", book })}
			`,
		}),
	);
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

admin.post("/books/:id{[0-9]+}/delete", async (c) => {
	const id = Number(c.req.param("id"));
	const ok = await deleteBook(c.env.DB, id);
	if (!ok) return c.notFound();
	return c.redirect("/admin/books");
});

export default admin;
