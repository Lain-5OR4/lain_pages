"use client";

import type { DiaryEntry } from "@/data/diary";

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

const TAPE_COLORS = [
  "rgba(232, 196, 120, 0.78)",
  "rgba(245, 220, 200, 0.78)",
  "rgba(200, 90, 80, 0.65)",
  "rgba(180, 140, 90, 0.78)",
  "rgba(240, 232, 210, 0.78)",
];

const PHOTO_ROTATIONS = [-4, 3, -2, 5, -3, 2, -5, 4];
const STICKER_ROTATIONS = [-4, 3, -3, 5, -2, 4, -5, 2];

const ZIGZAG_BOTTOM =
  "polygon(0 0, 100% 0, 100% 86%, 96% 100%, 92% 86%, 88% 100%, 84% 86%, 80% 100%, 76% 86%, 72% 100%, 68% 86%, 64% 100%, 60% 86%, 56% 100%, 52% 86%, 48% 100%, 44% 86%, 40% 100%, 36% 86%, 32% 100%, 28% 86%, 24% 100%, 20% 86%, 16% 100%, 12% 86%, 8% 100%, 4% 86%, 0 100%)";

const ZIGZAG_TAPE_EDGES =
  "polygon(0 18%, 5% 0, 10% 18%, 15% 0, 20% 18%, 25% 0, 30% 18%, 35% 0, 40% 18%, 45% 0, 50% 18%, 55% 0, 60% 18%, 65% 0, 70% 18%, 75% 0, 80% 18%, 85% 0, 90% 18%, 95% 0, 100% 18%, 100% 82%, 95% 100%, 90% 82%, 85% 100%, 80% 82%, 75% 100%, 70% 82%, 65% 100%, 60% 82%, 55% 100%, 50% 82%, 45% 100%, 40% 82%, 35% 100%, 30% 82%, 25% 100%, 20% 82%, 15% 100%, 10% 82%, 5% 100%, 0 82%)";

interface DiaryCardProps {
  entry: DiaryEntry;
  index: number;
  onPhotoClick: (entryId: string, photoIndex: number) => void;
}

export default function DiaryCard({ entry, index, onPhotoClick }: DiaryCardProps) {
  const d = new Date(`${entry.date}T00:00:00`);
  const month = MONTHS[d.getMonth()];
  const day = String(d.getDate()).padStart(2, "0");
  const weekday = WEEKDAYS[d.getDay()];

  return (
    <article className="relative pt-6 pb-4 px-2">
      {/* dashed alignment guide */}
      <div className="absolute inset-0 border border-dashed border-stone-200/15 pointer-events-none" />

      <div className="relative flex items-start gap-4 mb-6">
        {/* Date sticker — calendar page (tilted) */}
        <div
          className="relative shrink-0 select-none drop-shadow-[2px_4px_6px_rgba(0,0,0,0.5)]"
          style={{
            transform: `rotate(${STICKER_ROTATIONS[index % STICKER_ROTATIONS.length]}deg)`,
            transformOrigin: "top left",
          }}
        >
          <div
            className="bg-[#9c3a36] h-5 w-16 flex items-center justify-center text-[0.55rem] tracking-[0.25em] text-[#f0e6d2] font-medium"
            style={{ clipPath: ZIGZAG_BOTTOM }}
          >
            {month}
          </div>
          <div className="bg-[#ede1c8] text-[#3a2c1c] px-2 py-1 w-16 text-center -mt-0.5">
            <div className="text-3xl font-serif font-light leading-none tracking-tight">
              {day}
            </div>
            <div className="text-[0.5rem] tracking-[0.3em] text-stone-600 mt-1">
              {weekday}
            </div>
          </div>
        </div>

        {/* Title + meta */}
        <div className="min-w-0 flex-1 pt-2">
          {entry.title && (
            <h2 className="text-lg font-medium text-stone-100 leading-snug">
              {entry.title}
            </h2>
          )}
          <p className="mt-1 text-[0.65rem] tracking-[0.2em] uppercase text-[#e6b87a]">
            {entry.photos.length} {entry.photos.length === 1 ? "PHOTO" : "PHOTOS"}
            {entry.description && (
              <span className="ml-2 text-stone-200/80 normal-case tracking-normal">
                · {entry.description}
              </span>
            )}
          </p>
        </div>
      </div>

      {/* Polaroid stack */}
      <div className="relative flex flex-wrap items-start gap-y-4 pl-2 pr-4 min-h-[180px]">
        {entry.photos.map((photo, i) => {
          const rotation = PHOTO_ROTATIONS[(index * 3 + i) % PHOTO_ROTATIONS.length];
          const tapeColor = TAPE_COLORS[(index + i) % TAPE_COLORS.length];
          return (
            <button
              key={photo.src}
              type="button"
              onClick={() => onPhotoClick(entry.id, i)}
              className="relative shrink-0 group cursor-zoom-in focus:outline-none transition-transform duration-200 hover:scale-[1.04] hover:z-30"
              style={{
                transform: `rotate(${rotation}deg)`,
                marginLeft: i === 0 ? 0 : "-1.5rem",
                marginTop: i % 2 === 0 ? 0 : "0.5rem",
                zIndex: 10 + (entry.photos.length - i),
              }}
            >
              <div className="bg-[#f4ecd6] p-2 pb-7 shadow-[3px_6px_14px_rgba(0,0,0,0.45)]">
                <img
                  src={photo.src}
                  alt={photo.alt}
                  loading="lazy"
                  className="block w-28 h-28 object-cover bg-stone-700/60"
                />
                {photo.stamp && (
                  <span className="absolute bottom-1.5 right-3 text-[0.5rem] text-[#5a4023] font-mono tracking-wide">
                    {photo.stamp}
                  </span>
                )}
              </div>
              {/* masking tape */}
              <span
                aria-hidden
                className="absolute -top-1.5 left-1/2 w-14 h-4 -translate-x-1/2 shadow-[0_1px_2px_rgba(0,0,0,0.25)]"
                style={{
                  background: tapeColor,
                  transform: `translateX(-50%) rotate(${rotation > 0 ? "-" : ""}4deg)`,
                  clipPath: ZIGZAG_TAPE_EDGES,
                }}
              />
            </button>
          );
        })}
      </div>
    </article>
  );
}
