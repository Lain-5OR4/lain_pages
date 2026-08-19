"use client";

import type { Book } from "@/data/books";
import { useCallback, useEffect, useRef, useState } from "react";

import { type DecoratedBook, SANS, SERIF, decorate } from "./theme";

// Pack decorated books into shelf rows, wrapping once a row's total slot
// width would exceed BUDGET (matches the reference design's row-packing).
const BUDGET = 1280;

function packRows(books: DecoratedBook[]): DecoratedBook[][] {
  const rows: DecoratedBook[][] = [];
  let cur: DecoratedBook[] = [];
  let curW = 0;
  for (const b of books) {
    if (curW + b.slotW > BUDGET && cur.length) {
      rows.push(cur);
      cur = [];
      curW = 0;
    }
    cur.push(b);
    curW += b.slotW;
  }
  if (cur.length || !rows.length) rows.push(cur);
  return rows;
}

function SpineButton({ b, onOpen }: { b: DecoratedBook; onOpen: (id: number) => void }) {
  const faded = b.status !== "done";
  const tSize = b.dim.w >= 42 ? 15 : b.dim.w >= 34 ? 13 : 11;
  return (
    <button
      type="button"
      onClick={() => onOpen(b.id)}
      className="shrink-0 border-none cursor-pointer overflow-hidden flex flex-col items-center justify-between transition-transform duration-[180ms] ease-[cubic-bezier(.2,.8,.2,1)] hover:-translate-y-3.5"
      style={{
        width: b.dim.w,
        height: b.dim.h,
        padding: "12px 2px",
        borderRadius: "1px 3px 3px 1px",
        color: b.dim.fg,
        textShadow: "0 1px 0 rgba(0,0,0,.35)",
        opacity: faded ? 0.72 : 1,
        boxShadow:
          "3px 0 8px -1px rgba(0,0,0,.5), 0 6px 10px -6px rgba(0,0,0,.9), inset 0 0 0 1px rgba(0,0,0,.22)",
        background: [
          "linear-gradient(180deg,rgba(255,255,255,.16) 0 2px,rgba(0,0,0,.34) 2px 4px,rgba(0,0,0,0) 4px 18px)",
          "linear-gradient(0deg,rgba(255,255,255,.14) 0 2px,rgba(0,0,0,.34) 2px 4px,rgba(0,0,0,0) 4px 20px)",
          "repeating-linear-gradient(90deg,rgba(255,255,255,.05) 0 1px,rgba(0,0,0,.06) 1px 2px)",
          "linear-gradient(90deg,rgba(0,0,0,.5),rgba(255,255,255,.2) 16%,rgba(255,255,255,.04) 52%,rgba(0,0,0,.28) 82%,rgba(0,0,0,.55))",
          b.dim.bg,
        ].join(","),
      }}
    >
      <span
        className="whitespace-nowrap overflow-hidden"
        style={{
          writingMode: "vertical-rl",
          textOrientation: "upright",
          font: `700 ${tSize}px/1 ${SERIF}`,
          letterSpacing: ".02em",
          maxHeight: 172,
        }}
      >
        {b.titleText}
      </span>
      <span
        className="whitespace-nowrap overflow-hidden opacity-72"
        style={{
          writingMode: "vertical-rl",
          textOrientation: "upright",
          font: `400 8.5px/1 ${SANS}`,
          maxHeight: 58,
        }}
      >
        {b.authorText}
      </span>
      <span
        className="w-1.5 h-1.5 rounded-full opacity-70"
        style={{ background: b.status === "done" ? b.dim.fg : "transparent" }}
      />
    </button>
  );
}

function FaceButton({
  b,
  onOpen,
  onMeasure,
}: {
  b: DecoratedBook;
  onOpen: (id: number) => void;
  onMeasure: (id: number, aspect: number) => void;
}) {
  const faded = b.status !== "done";
  const imgRef = useRef<HTMLImageElement>(null);
  // Cached images are already `complete` by the time this effect's onLoad
  // listener attaches, so the "load" event never fires for them — check
  // completeness on mount as a fallback for that case.
  useEffect(() => {
    const img = imgRef.current;
    if (img?.complete && img.naturalWidth && img.naturalHeight) {
      onMeasure(b.id, img.naturalWidth / img.naturalHeight);
    }
  }, [b.id, onMeasure]);
  return (
    <button
      type="button"
      onClick={() => onOpen(b.id)}
      className="shrink-0 relative p-0 border-none cursor-pointer overflow-hidden flex items-center justify-center transition-transform duration-[180ms] ease-[cubic-bezier(.2,.8,.2,1)] hover:-translate-y-2.5 hover:-rotate-1"
      style={{
        width: b.faceW,
        height: b.dim.h,
        borderRadius: "1px 4px 4px 1px",
        opacity: faded ? 0.72 : 1,
        background: `linear-gradient(120deg,${b.dim.bg},${b.dim.bg})`,
        boxShadow:
          "10px 8px 20px -6px rgba(0,0,0,.6), 0 8px 12px -8px rgba(0,0,0,.9), inset 0 0 0 1px rgba(255,255,255,.14)",
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        ref={imgRef}
        src={b.coverUrl ?? undefined}
        alt=""
        className="block w-full h-full object-cover"
        style={{ position: "absolute", inset: 0 }}
        onLoad={(e) => {
          const { naturalWidth, naturalHeight } = e.currentTarget;
          if (naturalWidth && naturalHeight) onMeasure(b.id, naturalWidth / naturalHeight);
        }}
      />
      <span
        className="absolute inset-0 pointer-events-none"
        style={{
          borderRadius: "1px 4px 4px 1px",
          background:
            "linear-gradient(96deg,rgba(0,0,0,.42) 0 5px,rgba(255,255,255,.24) 6px 8px,rgba(255,255,255,.06) 22%,rgba(0,0,0,.08) 70%,rgba(0,0,0,.28))",
        }}
      />
    </button>
  );
}

export function Shelf({ books, onOpen }: { books: Book[]; onOpen: (id: number) => void }) {
  // Real cover aspect ratios, measured on image load and keyed by book id.
  // Until an image loads, decorate() falls back to DEFAULT_COVER_ASPECT so
  // face-out boxes still render at a reasonable width immediately.
  const [aspects, setAspects] = useState<Record<number, number>>({});
  const handleMeasure = useCallback((id: number, aspect: number) => {
    setAspects((prev) => (prev[id] === aspect ? prev : { ...prev, [id]: aspect }));
  }, []);

  const decorated = books.map((b, i) => decorate(b, i, aspects));
  const rows = packRows(decorated);
  const sizerW = Math.max(
    600,
    Math.min(2000, Math.max(0, ...rows.map((r) => r.reduce((a, b) => a + b.slotW, 0))) + 130),
  );

  return (
    <div style={{ width: sizerW, margin: "0 auto", maxWidth: "100%" }}>
      <div
        className="rounded-[5px] flex flex-col"
        style={{
          padding: "0 20px",
          background: [
            "repeating-linear-gradient(90deg, rgba(255,255,255,.05) 0 1px, rgba(0,0,0,.14) 1px 3px, rgba(0,0,0,0) 3px 9px)",
            "linear-gradient(180deg,#6b4a2e,#4a3220 55%,#3a2618)",
          ].join(","),
          boxShadow: "0 40px 70px -34px rgba(35,22,14,.72), inset 0 2px 0 rgba(255,255,255,.14)",
        }}
      >
        {/* crown */}
        <div
          style={{
            height: 26,
            margin: "0 -20px",
            borderRadius: "5px 5px 0 0",
            background: [
              "repeating-linear-gradient(90deg, rgba(255,255,255,.06) 0 1px, rgba(0,0,0,.16) 1px 2px, rgba(0,0,0,0) 2px 11px)",
              "linear-gradient(180deg,#8f6540,#5c3f27 60%,#432c1b)",
            ].join(","),
            boxShadow: "inset 0 1px 0 rgba(255,255,255,.24), 0 4px 10px -4px rgba(0,0,0,.6)",
          }}
        />

        {rows.map((row, ri) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: rows are re-packed on every render, no stable identity
          <div key={ri} className="flex flex-col relative">
            <div
              className="flex items-end relative"
              style={{
                minHeight: 252,
                gap: 4,
                padding: "0 12px",
                background: [
                  "linear-gradient(180deg, rgba(0,0,0,.55) 0 14px, rgba(0,0,0,.16) 46px, rgba(0,0,0,0) 120px)",
                  "repeating-linear-gradient(90deg, rgba(255,255,255,.035) 0 2px, rgba(0,0,0,.22) 2px 4px, rgba(0,0,0,0) 4px 26px)",
                  "linear-gradient(100deg,#31211a,#3d2a20 40%,#241811)",
                ].join(","),
                boxShadow:
                  "inset 22px 0 40px -26px rgba(0,0,0,.85), inset -22px 0 40px -26px rgba(0,0,0,.85)",
              }}
            >
              {row.map((b) =>
                b.faceOut ? (
                  <FaceButton key={b.id} b={b} onOpen={onOpen} onMeasure={handleMeasure} />
                ) : (
                  <SpineButton key={b.id} b={b} onOpen={onOpen} />
                ),
              )}
              <span
                className="absolute pointer-events-none"
                style={{
                  left: 12,
                  right: 12,
                  bottom: 0,
                  height: 34,
                  background: "linear-gradient(180deg,rgba(0,0,0,0),rgba(0,0,0,.4))",
                }}
              />
            </div>
            {/* shelf plank top */}
            <div
              style={{
                height: 9,
                margin: "0 -20px",
                background: [
                  "repeating-linear-gradient(90deg, rgba(255,255,255,.08) 0 1px, rgba(0,0,0,.12) 1px 2px, rgba(0,0,0,0) 2px 13px)",
                  "linear-gradient(180deg,#c39a6b,#a2764a 45%,#87603a)",
                ].join(","),
                boxShadow: "inset 0 1px 0 rgba(255,255,255,.4)",
              }}
            />
            {/* shelf plank front edge */}
            <div
              style={{
                height: 15,
                margin: "0 -20px 16px",
                background: [
                  "repeating-linear-gradient(90deg, rgba(255,255,255,.05) 0 1px, rgba(0,0,0,.16) 1px 2px, rgba(0,0,0,0) 2px 10px)",
                  "linear-gradient(180deg,#7d5735,#4d3520 68%,#2d1e13)",
                ].join(","),
                boxShadow: "0 12px 20px -10px rgba(0,0,0,.8), inset 0 1px 0 rgba(255,255,255,.16)",
              }}
            />
          </div>
        ))}

        {/* base */}
        <div
          style={{
            height: 34,
            margin: "0 -20px",
            borderRadius: "0 0 5px 5px",
            background: [
              "repeating-linear-gradient(90deg, rgba(255,255,255,.05) 0 1px, rgba(0,0,0,.15) 1px 2px, rgba(0,0,0,0) 2px 12px)",
              "linear-gradient(180deg,#5d4029,#3a2618 70%,#2a1a10)",
            ].join(","),
            boxShadow: "inset 0 2px 6px -2px rgba(0,0,0,.7)",
          }}
        />
      </div>
    </div>
  );
}
