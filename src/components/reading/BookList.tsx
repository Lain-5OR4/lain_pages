"use client";

import type { Book } from "@/data/books";
import { SANS, SERIF, STATUS_LABEL, decorate, stars } from "./theme";

export function BookList({ books, onOpen }: { books: Book[]; onOpen: (id: number) => void }) {
  const decorated = books.map((b, i) => decorate(b, i));
  return (
    <div
      className="grid gap-3.5"
      style={{ gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))" }}
    >
      {decorated.map((b) => (
        <button
          key={b.id}
          type="button"
          onClick={() => onOpen(b.id)}
          className="flex gap-3.5 text-left p-3.5 border cursor-pointer hover:bg-white transition-colors"
          style={{
            background: "rgba(255,255,255,.62)",
            borderColor: "rgba(61,38,24,.14)",
            borderRadius: 2,
          }}
        >
          <div
            className="shrink-0 overflow-hidden"
            style={{
              width: 56,
              height: 80,
              borderRadius: "1px 2px 2px 1px",
              background: `linear-gradient(160deg,${b.dim.bg},rgba(0,0,0,.5))`,
              boxShadow: "2px 2px 6px rgba(0,0,0,.25)",
            }}
          >
            {b.coverUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={b.coverUrl} alt="" className="w-full h-full object-cover" />
            )}
          </div>
          <div className="flex flex-col gap-1.5 min-w-0 flex-1">
            <span style={{ font: `700 14px/1.35 ${SERIF}`, color: "#2f2118" }}>{b.title}</span>
            <span style={{ font: `400 11.5px/1 ${SANS}`, color: "#8b7259" }}>{b.author}</span>
            <span
              style={{ font: `400 11.5px/1 ${SERIF}`, color: "#c08a3e", letterSpacing: ".14em" }}
            >
              {stars(b.rating)}
            </span>
            <span
              className="mt-auto"
              style={{ font: `400 10.5px/1 ${SANS}`, color: "#a08a72", letterSpacing: ".08em" }}
            >
              {b.finishedOn
                ? `${b.finishedOn} ・ ${STATUS_LABEL[b.status]}`
                : STATUS_LABEL[b.status]}
            </span>
          </div>
        </button>
      ))}
    </div>
  );
}
