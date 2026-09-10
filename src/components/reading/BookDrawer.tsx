"use client";

import type { Book } from "@/data/books";
import { useEffect, useRef, useState } from "react";
import { SANS, SERIF, STATUS_LABEL, stars } from "./theme";

const COVER_HEIGHT = 212;
const DEFAULT_COVER_ASPECT = 0.66;

// Read-only: this is the public page, so no editing controls here. Writing
// (rating/status/memo/cover edits, add, delete) belongs to the future
// Cloudflare Access-protected admin view, which will reuse this same shell.
export function BookDrawer({ book, onClose }: { book: Book; onClose: () => void }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = dialogRef.current;
    const previousFocus = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    dialog?.showModal();
    document.body.style.overflow = "hidden";
    return () => {
      dialog?.close();
      document.body.style.overflow = previousOverflow;
      if (previousFocus instanceof HTMLElement && previousFocus.isConnected) {
        previousFocus.focus();
      }
    };
  }, []);
  const [aspect, setAspect] = useState(DEFAULT_COVER_ASPECT);
  const imgRef = useRef<HTMLImageElement>(null);
  // Cached images are already `complete` by the time the onLoad listener
  // attaches, so the "load" event never fires for them — check on mount too.
  useEffect(() => {
    const img = imgRef.current;
    if (img?.complete && img.naturalWidth && img.naturalHeight) {
      setAspect(img.naturalWidth / img.naturalHeight);
    }
  }, []);
  const coverWidth = Math.min(220, Math.round(COVER_HEIGHT * aspect));

  return (
    // biome-ignore lint/a11y/useKeyWithClickEvents: native dialog handles Escape through onCancel; click only dismisses the backdrop.
    <dialog
      ref={dialogRef}
      aria-labelledby="reading-book-title"
      onCancel={onClose}
      onClick={(event) => {
        if (event.target !== event.currentTarget) return;
        const rect = event.currentTarget.getBoundingClientRect();
        if (
          event.clientX < rect.left ||
          event.clientX > rect.right ||
          event.clientY < rect.top ||
          event.clientY > rect.bottom
        )
          onClose();
      }}
      className="reading-dialog overflow-y-auto animate-[popin_.2s_cubic-bezier(.2,.8,.2,1)]"
      style={{
        width: 800,
        maxWidth: "calc(100vw - 24px)",
        maxHeight: "92dvh",
        background: "#f6efe4",
        borderRadius: 4,
        boxShadow: "0 40px 80px -20px rgba(47,33,24,.55)",
        padding: "clamp(20px, 4vw, 44px)",
      }}
    >
      <div className="flex flex-col gap-5">
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
              width: 40,
              height: 40,
              border: "1px solid rgba(61,38,24,.2)",
              background: "transparent",
              color: "#2f2118",
            }}
          >
            ✕
          </button>
        </div>

        <div className="reading-dialog-heading flex gap-6 items-start">
          <div
            className="shrink-0 overflow-hidden"
            style={{
              width: coverWidth,
              height: COVER_HEIGHT,
              borderRadius: "1px 3px 3px 1px",
              background: "linear-gradient(160deg,#6a4a2a,#3a271b)",
              boxShadow: "8px 8px 20px -6px rgba(47,33,24,.5)",
            }}
          >
            {book.coverUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                ref={imgRef}
                src={book.coverUrl}
                alt=""
                className="w-full h-full object-cover"
                onLoad={(e) => {
                  const { naturalWidth, naturalHeight } = e.currentTarget;
                  if (naturalWidth && naturalHeight) setAspect(naturalWidth / naturalHeight);
                }}
              />
            )}
          </div>
          <div className="flex flex-col gap-2.5 min-w-0">
            <h2
              id="reading-book-title"
              style={{ margin: 0, font: `700 26px/1.4 ${SERIF}`, color: "#2f2118" }}
            >
              {book.title}
            </h2>
            {book.author && (
              <span style={{ font: `400 14px/1 ${SANS}`, color: "#8b7259" }}>{book.author}</span>
            )}
            <span style={{ font: `400 18px/1 ${SERIF}`, color: "#c08a3e", letterSpacing: ".16em" }}>
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
      </div>
    </dialog>
  );
}
