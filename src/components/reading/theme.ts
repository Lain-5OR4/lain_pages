import type { Book, BookStatus } from "@/data/books";
import type { CSSProperties } from "react";

// Fonts: Zen Old Mincho (headings/spines), Zen Kaku Gothic New (UI). Loaded
// via next/font/google in layout.tsx and exposed as CSS variables.
export const SERIF = "var(--font-zen-old-mincho), serif";
export const SANS = "var(--font-zen-kaku), sans-serif";

export const STATUS_ORDER: BookStatus[] = ["reading", "to_read", "done"];
export const STATUS_LABEL: Record<BookStatus, string> = {
  to_read: "積読",
  reading: "読書中",
  done: "読了",
};

// Book jacket color pairs (cloth / foil-stamp text), matched deterministically
// per book below so the same book always renders the same color.
const CLOTHS: [string, string][] = [
  ["#7d2f2a", "#f0dcc0"],
  ["#2f4a5c", "#e8dcc4"],
  ["#3f5340", "#eee2c8"],
  ["#6a4a2a", "#f2e4cc"],
  ["#4a3a5c", "#e6dcc8"],
  ["#8a5a2a", "#fbeed6"],
  ["#2f2f36", "#ddd0bc"],
  ["#9a6b3a", "#3a2a1c"],
  ["#5c2f42", "#f0d8c8"],
  ["#38534f", "#e8ddc6"],
];

export function stars(n: number | null): string {
  const r = n ?? 0;
  return "★★★★★".slice(0, r) + "☆☆☆☆☆".slice(0, 5 - r);
}

export function starBtnStyle(active: boolean, size: number): CSSProperties {
  return {
    width: size,
    height: size,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    border: "none",
    background: "transparent",
    fontSize: Math.round(size * 0.85),
    lineHeight: 1,
    color: active ? "#c08a3e" : "rgba(61,38,24,.22)",
  };
}

// Deterministic pseudo-random dimensions/color for a book's spine, derived
// from title length + book id so the same book always looks the same
// (no `pages` field in our schema, unlike the original design reference —
// title length stands in for it).
export interface BookDeco {
  bg: string;
  fg: string;
  w: number;
  h: number;
}

export function deco(title: string, i: number): BookDeco {
  const [bg, fg] = CLOTHS[(title.length + i * 3) % CLOTHS.length];
  const w = 40 + ((title.length * 2 + i * 5) % 18);
  const h = 196 + ((title.length * 7 + i * 13) % 46);
  return { bg, fg, w, h };
}

export interface DecoratedBook extends Book {
  dim: BookDeco;
  faceOut: boolean;
  faceW: number;
  slotW: number;
}

// Fallback cover aspect ratio (width/height) used until the real image has
// loaded and its natural size is known — see FaceButton in Shelf.tsx.
const DEFAULT_COVER_ASPECT = 0.66;

export function decorate(b: Book, aspects: Record<number, number> = {}): DecoratedBook {
  const d = deco(b.title, b.id);
  // No curated "featured" flag in the schema, so face a deterministic ~1-in-5
  // covered books outward — same spirit as occasionally turning a book face-out
  // on a real shelf, without needing real curation data.
  const faceOut = !!(b.coverUrl && b.id % 5 === 0);
  const faceW = Math.min(200, Math.round(d.h * (aspects[b.id] ?? DEFAULT_COVER_ASPECT)));
  return {
    ...b,
    dim: d,
    faceOut,
    faceW,
    slotW: (faceOut ? faceW : d.w) + 4,
  };
}
