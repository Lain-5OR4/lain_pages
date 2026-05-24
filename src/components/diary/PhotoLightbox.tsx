"use client";

import type { DiaryEntry } from "@/data/diary";
import { useCallback, useEffect, useState } from "react";

interface PhotoLightboxProps {
  entry: DiaryEntry;
  initialPhotoIndex: number;
  onClose: () => void;
}

export default function PhotoLightbox({ entry, initialPhotoIndex, onClose }: PhotoLightboxProps) {
  const [photoIndex, setPhotoIndex] = useState(initialPhotoIndex);
  const photo = entry.photos[photoIndex];
  const hasMultiple = entry.photos.length > 1;

  const goNext = useCallback(() => {
    setPhotoIndex((i) => (i + 1) % entry.photos.length);
  }, [entry.photos.length]);

  const goPrev = useCallback(() => {
    setPhotoIndex((i) => (i - 1 + entry.photos.length) % entry.photos.length);
  }, [entry.photos.length]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (hasMultiple && e.key === "ArrowRight") goNext();
      if (hasMultiple && e.key === "ArrowLeft") goPrev();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose, hasMultiple, goNext, goPrev]);

  const stop = (e: React.SyntheticEvent) => e.stopPropagation();

  return (
    <dialog
      className="fixed inset-0 z-50 bg-stone-900/85 backdrop-blur-sm w-full h-full m-0 max-w-none max-h-none border-none p-0 flex flex-col items-center justify-center px-6 pt-16 pb-12 gap-3 open:flex"
      open
      onClick={onClose}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") onClose();
      }}
    >
      {(entry.title || entry.date) && (
        <div className="text-stone-200 text-center max-w-[80vw]" onClick={stop} onKeyDown={stop}>
          {entry.title && (
            <h2
              className="text-2xl md:text-3xl leading-tight"
              style={{ fontFamily: "var(--font-dot-gothic), sans-serif" }}
            >
              {entry.title}
            </h2>
          )}
          <p className="text-[0.65rem] tracking-[0.3em] uppercase text-stone-400 mt-1 font-mono">
            {entry.date}
          </p>
        </div>
      )}

      <div className="relative min-h-0" onClick={stop} onKeyDown={stop}>
        <img
          src={photo.src}
          alt={photo.alt}
          className="max-w-[88vw] max-h-[65vh] object-contain bg-stone-100 ring-1 ring-stone-50/20 shadow-[0_4px_24px_rgba(0,0,0,0.5)]"
        />
        {photo.stamp && (
          <span
            className="absolute bottom-3 right-4 text-xl md:text-2xl tracking-[0.15em] font-mono pointer-events-none"
            style={{
              color: "#ff7a18",
              textShadow:
                "0 0 3px rgba(255, 122, 24, 0.85), 0 0 8px rgba(255, 100, 10, 0.55), 0 1px 2px rgba(0, 0, 0, 0.8)",
            }}
          >
            {photo.stamp}
          </span>
        )}
        <button
          type="button"
          onClick={(e) => {
            stop(e);
            onClose();
          }}
          className="absolute -top-9 right-0 text-stone-200 hover:text-white tracking-widest text-sm transition-colors"
        >
          [×] CLOSE
        </button>

        {hasMultiple && (
          <>
            <button
              type="button"
              onClick={(e) => {
                stop(e);
                goPrev();
              }}
              className="absolute left-2 top-1/2 -translate-y-1/2 z-60 text-stone-200 hover:text-white transition-colors bg-stone-900/60 p-3 rounded-sm"
              aria-label="previous photo"
            >
              <svg
                aria-hidden="true"
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="13 4 6 10 13 16" />
              </svg>
            </button>
            <button
              type="button"
              onClick={(e) => {
                stop(e);
                goNext();
              }}
              className="absolute right-2 top-1/2 -translate-y-1/2 z-60 text-stone-200 hover:text-white transition-colors bg-stone-900/60 p-3 rounded-sm"
              aria-label="next photo"
            >
              <svg
                aria-hidden="true"
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="7 4 14 10 7 16" />
              </svg>
            </button>
          </>
        )}
      </div>

      {entry.description && (
        <p
          className="max-w-[80vw] text-stone-200 text-lg md:text-xl leading-snug text-center"
          style={{ fontFamily: "var(--font-dot-gothic), sans-serif" }}
          onClick={stop}
          onKeyDown={stop}
        >
          {entry.description}
        </p>
      )}

      {hasMultiple && (
        <div
          className="text-stone-200 text-xl"
          style={{ fontFamily: "var(--font-dot-gothic), sans-serif" }}
          onClick={stop}
          onKeyDown={stop}
        >
          {photoIndex + 1} / {entry.photos.length}
        </div>
      )}
    </dialog>
  );
}
