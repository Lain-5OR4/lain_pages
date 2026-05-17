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

  return (
    <dialog
      className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/85 backdrop-blur-sm w-full h-full m-0 max-w-none max-h-none border-none open:flex"
      open
      onClick={onClose}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") onClose();
      }}
    >
      <div
        className="relative max-w-[90vw] max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => e.stopPropagation()}
      >
        <div className="relative inline-block">
          <img
            src={photo.src}
            alt={photo.alt}
            className="max-w-[90vw] max-h-[90vh] object-contain bg-stone-100 ring-1 ring-stone-50/20 shadow-[0_4px_24px_rgba(0,0,0,0.5)]"
          />
          {photo.stamp && (
            <span className="absolute bottom-3 right-3 text-orange-50 text-xl tracking-wider font-mono drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]">
              {photo.stamp}
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={onClose}
          className="absolute -top-10 right-0 text-stone-200 hover:text-white tracking-widest text-sm transition-colors"
        >
          [×] CLOSE
        </button>

        {hasMultiple && (
          <div
            className="absolute -bottom-9 left-1/2 -translate-x-1/2 text-stone-200 text-xl"
            style={{ fontFamily: "var(--font-caveat), cursive" }}
          >
            {photoIndex + 1} / {entry.photos.length}
          </div>
        )}

        {hasMultiple && (
          <>
            <button
              type="button"
              onClick={goPrev}
              className="absolute left-2 top-1/2 -translate-y-1/2 text-stone-200 hover:text-white text-3xl transition-colors bg-stone-900/60 px-3 py-4 rounded-sm"
              aria-label="previous photo"
            >
              ‹
            </button>
            <button
              type="button"
              onClick={goNext}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-stone-200 hover:text-white text-3xl transition-colors bg-stone-900/60 px-3 py-4 rounded-sm"
              aria-label="next photo"
            >
              ›
            </button>
          </>
        )}
      </div>
    </dialog>
  );
}
