import { html } from "hono/html";
import type { Book } from "../data/books";
import { STATUS_OPTIONS, renderBookForm } from "./books";
import { layout } from "./layout";

export const renderAdminBooks = (books: Book[]) => {
  return layout({
    title: "books admin — photo-diary",
    noStore: true,
    section: "Reading Log",
    issue: `${books.length} Books`,
    body: html`
				<p class="back"><a href="/admin">← Photo Admin</a></p>
				<a class="new-entry-cta" href="/admin/books/new">+ New Book</a>
				${
          books.length === 0
            ? html`<p class="empty">No books yet — start with a new one.</p>`
            : html`<ul class="books">
							${books.map(
                (b) =>
                  html`<li>
										<span class="cover">
											${b.cover_url ? html`<img src="${b.cover_url}" alt="" loading="lazy" />` : ""}
										</span>
										<form class="status-form" method="POST" action="/admin/books/${b.id}/status">
											<select name="status" onchange="this.form.requestSubmit()">
												${STATUS_OPTIONS.map(
                          ([v, label]) =>
                            html`<option value="${v}" ${b.status === v ? "selected" : ""}>
															${label}
														</option>`,
                        )}
											</select>
										</form>
										<span class="title"
											>${b.title}${
                        b.author ? html`<span class="author">${b.author}</span>` : ""
                      }</span
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
						</ul>`
        }
			`,
  });
};

export const renderNewBook = () => {
  return layout({
    title: "new book — photo-diary",
    noStore: true,
    section: "New Book",
    issue: "Draft",
    body: html`
				<p class="back"><a href="/admin/books">← Reading Log</a></p>
				${renderBookForm({ action: "/admin/books", submitLabel: "Add Book" })}
			`,
  });
};

export const renderEditBook = (book: Book) => {
  const id = book.id;
  return layout({
    title: `edit — ${book.title}`,
    noStore: true,
    section: "Edit Book",
    issue: `#${book.id}`,
    body: html`
				<p class="back"><a href="/admin/books">← Reading Log</a></p>
				${renderBookForm({ action: `/admin/books/${id}`, submitLabel: "Save", book })}
			`,
  });
};
