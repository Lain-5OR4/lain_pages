"use client";

import { BookDrawer } from "@/components/reading/BookDrawer";
import { BookList } from "@/components/reading/BookList";
import { Shelf } from "@/components/reading/Shelf";
import { SANS, SERIF, chipStyle, viewBtnStyle } from "@/components/reading/theme";
import type { Book, BookStatus } from "@/data/books";
import Link from "next/link";
import { Component, Suspense, use, useMemo, useState } from "react";

const READING_API_BASE = process.env.NEXT_PUBLIC_DIARY_API ?? "https://api.mizora.dev";

// Always hits the live worker, even in dev — unlike diary's mock-data
// pattern, the reading log is actively curated and the point of running
// this locally is to see the real shelf, not a 3-book placeholder.
async function fetchBooks(): Promise<Book[]> {
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
          <p style={{ color: "#a05a44", font: `400 13px/1 ${SANS}` }}>
            接続エラー: {this.state.error.message}
          </p>
          <button
            type="button"
            onClick={() => {
              this.setState({ error: null });
              this.props.onRetry();
            }}
            className="mt-2 underline"
            style={{ color: "#8a5a3b", font: `400 13px/1 ${SANS}` }}
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
      <p
        className="animate-pulse"
        style={{ color: "#9a7d63", font: `400 13px/1 ${SANS}`, letterSpacing: ".5em" }}
      >
        loading...
      </p>
    </div>
  );
}

// --- Body (unwraps the promise via use()) ---

function ReadingBody({ promise }: { promise: Promise<Book[]> }) {
  const books = use(promise);
  const [view, setView] = useState<"shelf" | "list">("shelf");
  const [filter, setFilter] = useState<"all" | BookStatus>("all");
  const [query, setQuery] = useState("");
  const [selId, setSelId] = useState<number | null>(null);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return books.filter(
      (b) =>
        (filter === "all" || b.status === filter) &&
        (!q || `${b.title}${b.author ?? ""}`.toLowerCase().includes(q)),
    );
  }, [books, filter, query]);

  const readCount = books.filter((b) => b.status === "done");
  const rated = readCount.filter((b) => (b.rating ?? 0) > 0);
  const thisYear = new Date().getFullYear().toString();
  const statTotal = books.length;
  const statYear = readCount.filter((b) => (b.finishedOn ?? "").startsWith(thisYear)).length;
  const statAvg = rated.length
    ? (rated.reduce((a, b) => a + (b.rating ?? 0), 0) / rated.length).toFixed(1)
    : "–";

  const selected = books.find((b) => b.id === selId) ?? null;
  const filters: Array<["all" | BookStatus, string]> = [
    ["all", "すべて"],
    ["done", "読了"],
    ["reading", "読書中"],
    ["to_read", "積読"],
  ];

  return (
    <>
      <header
        className="flex items-end justify-between gap-6 flex-wrap"
        style={{ borderBottom: "1px solid rgba(61,38,24,.18)", paddingBottom: 18 }}
      >
        <div className="flex flex-col gap-1.5">
          <div
            className="uppercase"
            style={{ font: `500 11px/1 ${SANS}`, letterSpacing: ".34em", color: "#9a7d63" }}
          >
            my reading shelf
          </div>
          <h1
            style={{
              margin: 0,
              font: `900 40px/1.05 ${SERIF}`,
              color: "#2f2118",
              letterSpacing: ".06em",
            }}
          >
            読書記録
          </h1>
        </div>
        <div
          className="flex gap-4.5"
          style={{
            padding: "8px 20px",
            background: "rgba(255,255,255,.5)",
            border: "1px solid rgba(61,38,24,.14)",
            borderRadius: 2,
          }}
        >
          {[
            ["TOTAL", statTotal],
            [thisYear, statYear],
            ["AVG", statAvg],
          ].map(([label, value], i) => (
            <div key={label} className="flex items-center gap-4.5">
              {i > 0 && (
                <div style={{ width: 1, alignSelf: "stretch", background: "rgba(61,38,24,.14)" }} />
              )}
              <div className="flex flex-col gap-0.5 items-center">
                <span style={{ font: `700 20px/1 ${SERIF}`, color: "#2f2118" }}>{value}</span>
                <span
                  style={{ font: `500 9.5px/1 ${SANS}`, letterSpacing: ".16em", color: "#9a7d63" }}
                >
                  {label}
                </span>
              </div>
            </div>
          ))}
        </div>
      </header>

      <div className="flex items-center justify-between gap-4 flex-wrap mt-6.5">
        <div className="flex gap-2 flex-wrap">
          {filters.map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setFilter(id)}
              style={chipStyle(filter === id)}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="flex gap-2.5 items-center">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="タイトル・著者で検索"
            className="outline-none"
            style={{
              width: 220,
              padding: "10px 12px",
              background: "rgba(255,255,255,.6)",
              border: "1px solid rgba(61,38,24,.2)",
              borderRadius: 2,
              font: `400 13px/1 ${SANS}`,
              color: "#2f2118",
            }}
          />
          <div
            className="flex overflow-hidden"
            style={{ border: "1px solid rgba(61,38,24,.2)", borderRadius: 2 }}
          >
            <button
              type="button"
              onClick={() => setView("shelf")}
              style={viewBtnStyle(view === "shelf")}
            >
              棚
            </button>
            <button
              type="button"
              onClick={() => setView("list")}
              style={viewBtnStyle(view === "list")}
            >
              一覧
            </button>
          </div>
        </div>
      </div>

      <div className="mt-6.5">
        {visible.length === 0 ? (
          <p
            className="text-center"
            style={{ margin: 0, padding: "48px 0", font: `400 13px/1.8 ${SANS}`, color: "#9a7d63" }}
          >
            該当する本がありません。
          </p>
        ) : view === "shelf" ? (
          <Shelf books={visible} onOpen={setSelId} />
        ) : (
          <BookList books={visible} onOpen={setSelId} />
        )}
      </div>

      {selected && <BookDrawer key={selected.id} book={selected} onClose={() => setSelId(null)} />}
    </>
  );
}

// --- Page ---

export default function ReadingPage() {
  const [promise, setPromise] = useState(fetchBooks);

  return (
    <div
      className="min-h-screen"
      style={{
        background: [
          "radial-gradient(120% 80% at 50% 0%, rgba(255,255,255,.5), rgba(255,255,255,0) 60%)",
          "repeating-linear-gradient(90deg, rgba(0,0,0,.012) 0 2px, rgba(0,0,0,0) 2px 6px)",
          "#e8ded0",
        ].join(","),
        paddingBottom: 80,
      }}
    >
      <div
        className="max-w-[2040px] mx-auto flex flex-col gap-6"
        style={{ padding: "34px 32px 0" }}
      >
        <Link
          href="/"
          className="self-start"
          style={{ font: `500 11px/1 ${SANS}`, letterSpacing: ".2em", color: "#9a7d63" }}
        >
          ← RETURN
        </Link>

        <ReadingErrorBoundary onRetry={() => setPromise(fetchBooks())}>
          <Suspense fallback={<ReadingLoading />}>
            <ReadingBody promise={promise} />
          </Suspense>
        </ReadingErrorBoundary>
      </div>
    </div>
  );
}
