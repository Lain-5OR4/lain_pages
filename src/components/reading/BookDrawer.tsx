"use client";

import type { Book } from "@/data/books";
import { SANS, SERIF, STATUS_LABEL, stars } from "./theme";

// Read-only: this is the public page, so no editing controls here. Writing
// (rating/status/memo/cover edits, add, delete) belongs to the future
// Cloudflare Access-protected admin view, which will reuse this same shell.
export function BookDrawer({ book, onClose }: { book: Book; onClose: () => void }) {
  return (
    <>
      <div
        onClick={onClose}
        onKeyDown={(e) => e.key === "Escape" && onClose()}
        role="presentation"
        className="fixed inset-0 z-20 animate-[fadein_.18s_ease]"
        style={{ background: "rgba(47,33,24,.42)" }}
      />
      <aside
        className="fixed top-0 right-0 bottom-0 z-21 overflow-y-auto flex flex-col gap-5 animate-[slidein_.22s_cubic-bezier(.2,.8,.2,1)]"
        style={{
          width: 400,
          maxWidth: "92vw",
          background: "#f6efe4",
          boxShadow: "-30px 0 60px -30px rgba(47,33,24,.6)",
          padding: "28px 30px 40px",
        }}
      >
        <div className="flex justify-between items-center">
          <span style={{ font: `500 10px/1 ${SANS}`, letterSpacing: ".3em", color: "#9a7d63" }}>
            RECORD
          </span>
          <button
            type="button"
            onClick={onClose}
            aria-label="閉じる"
            className="rounded-full flex items-center justify-center cursor-pointer"
            style={{
              width: 30,
              height: 30,
              border: "1px solid rgba(61,38,24,.2)",
              background: "transparent",
              color: "#2f2118",
            }}
          >
            ✕
          </button>
        </div>

        <div className="flex gap-4.5 items-start">
          <div
            className="shrink-0 overflow-hidden"
            style={{
              width: 112,
              height: 160,
              borderRadius: "1px 3px 3px 1px",
              background: "linear-gradient(160deg,#6a4a2a,#3a271b)",
              boxShadow: "8px 8px 20px -6px rgba(47,33,24,.5)",
            }}
          >
            {book.coverUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={book.coverUrl} alt="" className="w-full h-full object-cover" />
            )}
          </div>
          <div className="flex flex-col gap-2 min-w-0">
            <h2 style={{ margin: 0, font: `700 20px/1.4 ${SERIF}`, color: "#2f2118" }}>
              {book.title}
            </h2>
            {book.author && (
              <span style={{ font: `400 12px/1 ${SANS}`, color: "#8b7259" }}>{book.author}</span>
            )}
            <span style={{ font: `400 15px/1 ${SERIF}`, color: "#c08a3e", letterSpacing: ".16em" }}>
              {stars(book.rating)}
            </span>
          </div>
        </div>

        <span
          className="self-start px-3 py-1.5"
          style={{
            font: `500 12px/1 ${SANS}`,
            letterSpacing: ".06em",
            border: "1px solid #2f2118",
            background: "#2f2118",
            color: "#f4ece0",
            borderRadius: 2,
          }}
        >
          {STATUS_LABEL[book.status]}
        </span>

        {book.category && (
          <div className="flex flex-col gap-1.5">
            <span style={{ font: `500 10px/1 ${SANS}`, letterSpacing: ".24em", color: "#9a7d63" }}>
              CATEGORY
            </span>
            <span style={{ font: `400 13px/1 ${SANS}`, color: "#2f2118" }}>{book.category}</span>
          </div>
        )}

        {book.note && (
          <div className="flex flex-col gap-1.5">
            <span style={{ font: `500 10px/1 ${SANS}`, letterSpacing: ".24em", color: "#9a7d63" }}>
              MEMO
            </span>
            <p
              style={{
                margin: 0,
                padding: 12,
                background: "rgba(255,255,255,.75)",
                border: "1px solid rgba(61,38,24,.18)",
                borderRadius: 2,
                font: `400 13px/1.85 ${SANS}`,
                color: "#2f2118",
              }}
            >
              {book.note}
            </p>
          </div>
        )}

        {book.finishedOn && (
          <div className="flex flex-col gap-1.5">
            <span style={{ font: `500 10px/1 ${SANS}`, letterSpacing: ".24em", color: "#9a7d63" }}>
              読了日
            </span>
            <span style={{ font: `400 13px/1 ${SANS}`, color: "#2f2118" }}>{book.finishedOn}</span>
          </div>
        )}

        {book.amazonUrl && (
          <a
            href={book.amazonUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-1 text-center"
            style={{
              padding: 12,
              background: "#2f2118",
              color: "#f4ece0",
              borderRadius: 2,
              font: `700 12px/1 ${SANS}`,
              letterSpacing: ".1em",
              textDecoration: "none",
            }}
          >
            Amazonで見る
          </a>
        )}
      </aside>
    </>
  );
}
