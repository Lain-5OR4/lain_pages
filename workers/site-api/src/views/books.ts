import { html } from "hono/html";
import type { Book } from "../data/books";

const KIND_OPTIONS: Array<[Book["kind"], string]> = [
  ["book", "書籍"],
  ["article", "記事"],
];
export const STATUS_OPTIONS: Array<[Book["status"], string]> = [
  ["to_read", "積読"],
  ["reading", "読書中"],
  ["done", "読了"],
];

// Shared form for both /admin/books/new (empty book) and /admin/books/:id/edit
// (prefilled) — every editable field lives here so status changes, ratings,
// dates, and cover/amazon links can all be set without touching Notion.
export const renderBookForm = (opts: {
  action: string;
  submitLabel: string;
  book?: Partial<Book>;
}) => {
  const b = opts.book ?? {};
  return html`
		<form method="POST" action="${opts.action}">
			<div class="field">
				<span class="field-num">01</span>
				<div class="field-body">
					<label>Title</label>
					<input type="text" name="title" autocomplete="off" value="${b.title ?? ""}" required />
				</div>
			</div>
			<div class="field">
				<span class="field-num">02</span>
				<div class="field-body">
					<label>Author</label>
					<input type="text" name="author" autocomplete="off" value="${b.author ?? ""}" />
				</div>
			</div>
			<div class="field">
				<span class="field-num">03</span>
				<div class="field-body">
					<label>Kind</label>
					<select name="kind">
						${KIND_OPTIONS.map(
              ([v, label]) =>
                html`<option value="${v}" ${b.kind === v ? "selected" : ""}>
									${label}
								</option>`,
            )}
					</select>
				</div>
			</div>
			<div class="field">
				<span class="field-num">04</span>
				<div class="field-body">
					<label>Status</label>
					<select name="status">
						${STATUS_OPTIONS.map(
              ([v, label]) =>
                html`<option value="${v}" ${b.status === v ? "selected" : ""}>
									${label}
								</option>`,
            )}
					</select>
				</div>
			</div>
			<div class="field">
				<span class="field-num">05</span>
				<div class="field-body">
					<label>Rating</label>
					<select name="rating">
						<option value="">—</option>
						${[1, 2, 3, 4, 5].map(
              (n) =>
                html`<option value="${n}" ${b.rating === n ? "selected" : ""}>
									${"★".repeat(n)}
								</option>`,
            )}
					</select>
				</div>
			</div>
			<div class="field">
				<span class="field-num">06</span>
				<div class="field-body">
					<label>Category</label>
					<input type="text" name="category" autocomplete="off" value="${b.category ?? ""}" />
				</div>
			</div>
			<div class="field">
				<span class="field-num">07</span>
				<div class="field-body">
					<label>ISBN</label>
					<input type="text" name="isbn" autocomplete="off" value="${b.isbn ?? ""}" />
				</div>
			</div>
			<div class="field">
				<span class="field-num">08</span>
				<div class="field-body">
					<label>Cover URL</label>
					<input type="text" name="cover_url" autocomplete="off" value="${b.cover_url ?? ""}" />
				</div>
			</div>
			<div class="field">
				<span class="field-num">09</span>
				<div class="field-body">
					<label>Amazon URL</label>
					<input type="text" name="amazon_url" autocomplete="off" value="${b.amazon_url ?? ""}" />
				</div>
			</div>
			<div class="field">
				<span class="field-num">10</span>
				<div class="field-body">
					<label>Publisher</label>
					<input type="text" name="publisher" autocomplete="off" value="${b.publisher ?? ""}" />
				</div>
			</div>
			<div class="field">
				<span class="field-num">11</span>
				<div class="field-body">
					<label>Started On</label>
					<input type="date" name="started_on" value="${b.started_on ?? ""}" />
				</div>
			</div>
			<div class="field">
				<span class="field-num">12</span>
				<div class="field-body">
					<label>Finished On</label>
					<input type="date" name="finished_on" value="${b.finished_on ?? ""}" />
				</div>
			</div>
			<div class="field">
				<span class="field-num">13</span>
				<div class="field-body">
					<label>Note</label>
					<textarea name="note" placeholder="(optional)">${b.note ?? ""}</textarea>
				</div>
			</div>
			<div class="submit-row">
				<button type="submit">${opts.submitLabel}</button>
			</div>
		</form>
	`;
};
