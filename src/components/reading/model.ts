import type { Book, BookStatus } from "@/data/books";

export type ReadingFilter = "all" | BookStatus;
export type ReadingView = "shelf" | "list";
export const READING_FILTERS: ReadingFilter[] = ["all", "done", "reading", "to_read"];

export function filterBooks(books: Book[], filter: ReadingFilter, query: string) {
  const normalized = query.trim().toLocaleLowerCase();
  return books.filter(
    (book) =>
      (filter === "all" || book.status === filter) &&
      (!normalized ||
        `${book.title} ${book.author ?? ""}`.toLocaleLowerCase().includes(normalized)),
  );
}

export function summarizeBooks(books: Book[], year: number) {
  const counts = { all: books.length, done: 0, reading: 0, to_read: 0 };
  let finishedThisYear = 0;
  let ratingTotal = 0;
  let ratedCount = 0;
  for (const book of books) {
    counts[book.status]++;
    if (book.status !== "done") continue;
    if (book.finishedOn?.startsWith(`${year}-`)) finishedThisYear++;
    if (book.rating && book.rating > 0) {
      ratingTotal += book.rating;
      ratedCount++;
    }
  }
  return {
    counts,
    finishedThisYear,
    average: ratedCount ? (ratingTotal / ratedCount).toFixed(1) : "–",
  };
}
