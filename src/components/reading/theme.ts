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

export function chipStyle(active: boolean): CSSProperties {
  return {
    padding: "8px 16px",
    borderRadius: 2,
    cursor: "pointer",
    font: `500 12px/1 ${SANS}`,
    letterSpacing: ".06em",
    border: `1px solid ${active ? "#2f2118" : "rgba(61,38,24,.2)"}`,
    background: active ? "#2f2118" : "rgba(255,255,255,.45)",
    color: active ? "#f4ece0" : "#6b5442",
  };
}

export function viewBtnStyle(active: boolean): CSSProperties {
  return {
    padding: "10px 18px",
    border: "none",
    cursor: "pointer",
    font: `500 12px/1 ${SANS}`,
    background: active ? "#2f2118" : "rgba(255,255,255,.55)",
    color: active ? "#f4ece0" : "#6b5442",
  };
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
// from title length + row index so the same book always looks the same
// (no `pages` field in our schema, unlike the original design reference —
// title length stands in for it).
export interface BookDeco {
  bg: string;
  fg: string;
  w: number;
  h: number;
  lean: number;
}

export function deco(title: string, i: number): BookDeco {
  const [bg, fg] = CLOTHS[(title.length + i * 3) % CLOTHS.length];
  const w = Math.max(26, Math.min(52, 28 + ((title.length * 2 + i * 5) % 26)));
  const h = 196 + ((title.length * 7 + i * 13) % 46);
  const leanSeed = (title.length * 5 + i * 7) % 17;
  const lean = leanSeed === 3 ? -2.2 : leanSeed === 11 ? 1.6 : 0;
  return { bg, fg, w, h, lean };
}

export interface DecoratedBook extends Book {
  dim: BookDeco;
  faceOut: boolean;
  slotW: number;
  titleText: string;
  authorText: string;
}

export function decorate(b: Book, i: number): DecoratedBook {
  const d = deco(b.title, i);
  // No curated "featured" flag in the schema, so face a deterministic ~1-in-5
  // covered books outward — same spirit as occasionally turning a book face-out
  // on a real shelf, without needing real curation data.
  const faceOut = !!(b.coverUrl && i % 5 === 0);
  const shortTitle = b.title.length > 13 ? `${b.title.slice(0, 12)}…` : b.title;
  const author = b.author ?? "";
  const shortAuthor = author.length > 8 ? `${author.slice(0, 7)}…` : author;
  return {
    ...b,
    dim: d,
    faceOut,
    slotW: (faceOut ? Math.round(d.h * 0.66) : d.w) + 4,
    titleText: shortTitle,
    authorText: shortAuthor,
  };
}
