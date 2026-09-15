import type { NewBook } from "../data/books";

const KINDS = new Set(["book", "article"]);
export const STATUSES = new Set(["to_read", "reading", "done"]);

export const parseBookForm = (formData: FormData): Partial<NewBook> => {
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
