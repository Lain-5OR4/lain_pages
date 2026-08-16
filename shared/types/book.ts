// Single source of truth for the reading-log API contract between
// workers/photo-diary (`GET /api/books`, producer) and the Next.js
// frontend (`src/app/reading`, consumer). Both sides re-export from here.
export type BookKind = "book" | "article";
export type BookStatus = "to_read" | "reading" | "done";

export interface Book {
  id: number;
  title: string;
  author: string | null;
  kind: BookKind;
  category: string | null;
  status: BookStatus;
  rating: number | null;
  isbn: string | null;
  coverUrl: string | null;
  amazonUrl: string | null;
  publisher: string | null;
  note: string | null;
  startedOn: string | null;
  finishedOn: string | null;
}
