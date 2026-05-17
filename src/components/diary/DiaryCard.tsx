"use client";

import type { DiaryEntry } from "@/data/diary";

interface DiaryCardProps {
  entry: DiaryEntry;
  onPhotoClick: (entryId: string, photoIndex: number) => void;
}

const MONTHS = [
  "JAN",
  "FEB",
  "MAR",
  "APR",
  "MAY",
  "JUN",
  "JUL",
  "AUG",
  "SEP",
  "OCT",
  "NOV",
  "DEC",
];
const WEEKDAYS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

export default function DiaryCard({ entry, onPhotoClick }: DiaryCardProps) {
  const d = new Date(`${entry.date}T00:00:00`);
  const month = MONTHS[d.getMonth()];
  const day = String(d.getDate()).padStart(2, "0");
  const weekday = WEEKDAYS[d.getDay()];

  return (
    <article className="grid grid-cols-[4.5rem_1fr] gap-5 py-8 border-b border-stone-700/15 last:border-b-0">
      <div className="text-stone-700 leading-tight pt-1 select-none">
        <p className="text-[0.65rem] tracking-[0.3em] uppercase text-stone-600">{month}</p>
        <p className="text-4xl font-light leading-none mt-1 text-stone-800">{day}</p>
        <p className="text-[0.65rem] tracking-[0.3em] uppercase text-stone-500 mt-1">
          {weekday}
        </p>
      </div>

      <div className="min-w-0">
        {entry.title && (
          <h2
            className="text-2xl text-stone-800 leading-tight"
            style={{ fontFamily: "var(--font-caveat), cursive" }}
          >
            {entry.title}
          </h2>
        )}
        {entry.description && (
          <p className="text-sm text-stone-700/85 mt-2 leading-relaxed whitespace-pre-wrap">
            {entry.description}
          </p>
        )}
        {entry.photos.length > 0 && (
          <div className="mt-3">
            <p className="text-[0.65rem] tracking-[0.3em] uppercase text-stone-500 mb-2">
              {entry.photos.length} {entry.photos.length === 1 ? "PHOTO" : "PHOTOS"}
            </p>
            <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1 snap-x snap-mandatory">
              {entry.photos.map((photo, i) => (
                <button
                  key={photo.src}
                  type="button"
                  className="relative shrink-0 snap-start group focus:outline-none"
                  onClick={() => onPhotoClick(entry.id, i)}
                >
                  <img
                    src={photo.src}
                    alt={photo.alt}
                    loading="lazy"
                    className="h-40 w-auto max-w-[16rem] object-cover bg-stone-700/10 rounded-sm shadow-[0_1px_3px_rgba(120,90,60,0.3)] group-hover:brightness-110 transition"
                  />
                  {photo.stamp && (
                    <span className="absolute bottom-1 right-1.5 text-[0.6rem] text-orange-50/90 font-mono tracking-wider drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
                      {photo.stamp}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </article>
  );
}
