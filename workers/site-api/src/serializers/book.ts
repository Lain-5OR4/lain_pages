import type { Book as BookRow } from "../data/books";
import type { Book } from "../types";

export const toBook = (b: BookRow): Book => ({
  id: b.id,
  title: b.title,
  author: b.author,
  kind: b.kind as Book["kind"],
  category: b.category,
  status: b.status as Book["status"],
  rating: b.rating,
  isbn: b.isbn,
  coverUrl: b.cover_url,
  amazonUrl: b.amazon_url,
  publisher: b.publisher,
  note: b.note,
  startedOn: b.started_on,
  finishedOn: b.finished_on,
});
