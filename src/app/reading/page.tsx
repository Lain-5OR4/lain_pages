"use client";

import type { Book, BookStatus } from "@/data/books";
import { mockBooks } from "@/data/books";
import Link from "next/link";
import { Component, Suspense, use, useState } from "react";

const READING_API_BASE = process.env.NEXT_PUBLIC_DIARY_API ?? "https://api.mizora.dev";

async function fetchBooks(): Promise<Book[]> {
  if (process.env.NODE_ENV === "development") return mockBooks;
  try {
    const res = await fetch(`${READING_API_BASE}/api/books`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return (await res.json()) as Book[];
  } catch (err) {
    // `next build` (static export) runs this in Node with no browser. If the
    // worker route isn't deployed yet or is briefly unreachable, don't fail
    // the whole site build over it — the client re-fetches on hydration
    // regardless, so this only affects the build-time snapshot, never what
    // real visitors see. Genuine in-browser failures still surface normally.
    if (typeof window === "undefined") return [];
    throw err;
  }
}

const STATUS_ORDER: BookStatus[] = ["reading", "to_read", "done"];
const STATUS_LABEL: Record<BookStatus, string> = {
  to_read: "未着手",
  reading: "読書中",
  done: "読了",
};

// --- ErrorBoundary ---

interface ErrorBoundaryProps {
  onRetry: () => void;
  children: React.ReactNode;
}
interface ErrorBoundaryState {
  error: Error | null;
}

class ReadingErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <div className="text-center my-8">
          <p className="text-red-400/80 text-sm">! connection error: {this.state.error.message}</p>
          <button
            type="button"
            onClick={() => {
              this.setState({ error: null });
              this.props.onRetry();
            }}
            className="mt-2 text-green-400 underline text-sm"
          >
            retry
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

function ReadingLoading() {
  return (
    <div className="flex items-center justify-center py-32">
      <p className="text-green-700 text-sm tracking-[0.5em] animate-pulse">loading...</p>
    </div>
  );
}

// --- Book row ---

function Stars({ rating }: { rating: number | null }) {
  if (!rating) return null;
  return (
    <span className="text-amber-400 text-xs tracking-tighter" aria-label={`rating: ${rating}/5`}>
      {"★".repeat(rating)}
      <span className="text-green-900">{"★".repeat(5 - rating)}</span>
    </span>
  );
}

function BookRow({ book }: { book: Book }) {
  return (
    <li className="border border-green-900/50 rounded px-4 py-3">
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <span className="text-green-200">{book.title}</span>
        {book.author && <span className="text-green-700 text-sm">— {book.author}</span>}
        {book.category && (
          <span className="text-[0.65rem] uppercase tracking-widest text-green-600 border border-green-900 rounded px-1.5 py-0.5">
            {book.category}
          </span>
        )}
        <Stars rating={book.rating} />
      </div>
      {book.note && <p className="mt-1 text-sm text-green-500/80 italic">{book.note}</p>}
    </li>
  );
}

// --- Grouped list (unwraps the promise via use()) ---

function BookGroups({ promise }: { promise: Promise<Book[]> }) {
  const books = use(promise);
  const byStatus = new Map<BookStatus, Book[]>();
  for (const status of STATUS_ORDER) byStatus.set(status, []);
  for (const book of books) byStatus.get(book.status)?.push(book);

  return (
    <>
      <header className="flex flex-wrap items-baseline justify-between gap-2 mb-10">
        <p className="text-[0.7rem] tracking-[0.35em] text-green-600 uppercase">
          READING_LOG · BY STATUS
        </p>
        <p className="text-[0.75rem] tracking-[0.15em] text-green-600">{books.length} books</p>
      </header>

      {books.length === 0 ? (
        <p className="text-center text-green-700 mt-20 text-lg tracking-widest">no entries yet.</p>
      ) : (
        <div className="space-y-10">
          {STATUS_ORDER.map((status) => {
            const group = byStatus.get(status) ?? [];
            if (group.length === 0) return null;
            return (
              <section key={status}>
                <h2 className="text-lg font-bold text-green-400 mb-3 border-b border-green-900 pb-2">
                  <span className="mr-2">{">"}</span>
                  {STATUS_LABEL[status]}
                  <span className="ml-2 text-green-700 text-sm font-normal">{group.length}</span>
                </h2>
                <ul className="space-y-2 text-sm">
                  {group.map((book) => (
                    <BookRow key={book.id} book={book} />
                  ))}
                </ul>
              </section>
            );
          })}
        </div>
      )}
    </>
  );
}

// --- Page ---

export default function ReadingPage() {
  const [promise, setPromise] = useState(fetchBooks);

  return (
    <div className="min-h-screen bg-black text-green-500 font-mono p-6 md:p-10">
      <div className="max-w-3xl mx-auto">
        <header className="mb-10">
          <Link href="/" className="text-xs text-green-700 hover:text-green-400 transition-colors">
            ← RETURN
          </Link>
          <h1 className="text-3xl font-bold mt-4 text-green-400">{">"} READING_LOG_</h1>
          <p className="text-green-600 text-sm mt-2">{"// 読書記録という名の積読状況整理"}</p>
        </header>

        <ReadingErrorBoundary onRetry={() => setPromise(fetchBooks())}>
          <Suspense fallback={<ReadingLoading />}>
            <BookGroups promise={promise} />
          </Suspense>
        </ReadingErrorBoundary>
      </div>
    </div>
  );
}
