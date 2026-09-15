"use client";

import type { CSSProperties } from "react";
import { type DecoratedBook, STATUS_LABEL } from "./theme";
import { useCoverPalette } from "./useCoverPalette";

export function SpineButton({
  book,
  onOpen,
}: {
  book: DecoratedBook;
  onOpen: (id: number) => void;
}) {
  const { ref, palette } = useCoverPalette(book.coverUrl);
  return (
    <button
      ref={ref}
      type="button"
      onClick={() => onOpen(book.id)}
      aria-label={`${book.title}${book.author ? ` — ${book.author}` : ""} / ${STATUS_LABEL[book.status]}`}
      title={`${book.title}${book.author ? ` — ${book.author}` : ""}${book.category ? ` / ${book.category}` : ""}`}
      className="reading-shelf-book reading-spine"
      style={
        {
          width: book.dim.w,
          height: book.dim.h,
          "--spine-background": palette?.background ?? book.dim.bg,
          "--spine-foreground": palette?.foreground ?? book.dim.fg,
        } as CSSProperties
      }
    >
      <span className="reading-spine-text">
        <span className="reading-spine-title">{book.title}</span>
        {book.author && <span className="reading-spine-author">{book.author}</span>}
      </span>
      <span className="reading-spine-label">
        <span className="reading-spine-status" data-status={book.status} aria-hidden="true" />
        <span>{book.category || "未分類"}</span>
      </span>
    </button>
  );
}
