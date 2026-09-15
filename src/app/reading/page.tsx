"use client";

import { ArrowLeft, BookOpen } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { BookDrawer } from "@/components/reading/BookDrawer";
import { BookList } from "@/components/reading/BookList";
import {
  filterBooks,
  type ReadingFilter,
  type ReadingView,
  summarizeBooks,
} from "@/components/reading/model";
import {
  ReadingHeader,
  ReadingShelfCaption,
  ReadingToolbar,
} from "@/components/reading/ReadingChrome";
import { Shelf } from "@/components/reading/Shelf";
import { useBooks } from "@/components/reading/useBooks";
import type { Book } from "@/data/books";

function ReadingBody({ books }: { books: Book[] }) {
  const [view, setView] = useState<ReadingView>("shelf");
  const [filter, setFilter] = useState<ReadingFilter>("all");
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const year = new Date().getFullYear();
  const summary = useMemo(() => summarizeBooks(books, year), [books, year]);
  const visible = useMemo(() => filterBooks(books, filter, query), [books, filter, query]);
  const selected = books.find((book) => book.id === selectedId);
  const isFiltered = filter !== "all" || query.trim() !== "";

  return (
    <>
      <ReadingHeader summary={summary} year={year} />
      <ReadingToolbar
        filter={filter}
        onFilter={setFilter}
        query={query}
        onQuery={setQuery}
        view={view}
        onView={setView}
        counts={summary.counts}
      />
      <section aria-label="本のコレクション" className="reading-collection">
        <ReadingShelfCaption
          count={visible.length}
          onRandom={() => {
            const book = visible[Math.floor(Math.random() * visible.length)];
            if (book) setSelectedId(book.id);
          }}
        />
        {visible.length === 0 ? (
          <div className="reading-empty">
            <BookOpen size={36} strokeWidth={1} aria-hidden="true" />
            <h2>{isFiltered ? "該当する本がありません" : "登録された本がありません"}</h2>
            {isFiltered && <p>検索語や絞り込み条件を変更してください。</p>}
            {isFiltered && (
              <button
                type="button"
                className="reading-random"
                onClick={() => {
                  setFilter("all");
                  setQuery("");
                }}
              >
                すべての本に戻る
              </button>
            )}
          </div>
        ) : view === "shelf" ? (
          <Shelf books={visible} onOpen={setSelectedId} />
        ) : (
          <BookList books={visible} onOpen={setSelectedId} />
        )}
        <p className="reading-colophon">本を選ぶと詳細を表示します</p>
      </section>
      {selected && (
        <BookDrawer key={selected.id} book={selected} onClose={() => setSelectedId(null)} />
      )}
    </>
  );
}

export default function ReadingPage() {
  const { state, retry } = useBooks();
  return (
    <main className="reading-page">
      <div className="reading-container">
        <nav className="reading-navigation" aria-label="ページナビゲーション">
          <Link href="/">
            <ArrowLeft size={14} aria-hidden="true" /> RETURN
          </Link>
          <span>THE READING ROOM / 読書室</span>
        </nav>
        {state.status === "loading" ? (
          <output className="reading-empty">
            <BookOpen size={36} strokeWidth={1} aria-hidden="true" />
            <p>本棚をひらいています…</p>
          </output>
        ) : state.status === "error" ? (
          <div className="reading-empty" role="alert">
            <h1>本棚につながりませんでした</h1>
            <p>{state.message}</p>
            <button type="button" className="reading-random" onClick={retry}>
              もう一度ひらく
            </button>
          </div>
        ) : (
          <ReadingBody books={state.books} />
        )}
      </div>
    </main>
  );
}
