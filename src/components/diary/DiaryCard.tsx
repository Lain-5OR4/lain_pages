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
const NOTE_ROTATIONS = [2, -3, 1, -2, 3, -1, 2, -2];
const NOTE_COLORS = ["#d4c290", "#cebd8a", "#d8c694", "#ccbd92", "#d2c088"];

// CSS mask: two radial-gradient holes punched on the left/right edges → ticket notches.
// `mask-composite: intersect` keeps only pixels covered by BOTH masks, so the two
// "everywhere except a small circle" layers combine into "everywhere except both circles".
const TICKET_MASK =
  "radial-gradient(circle 10px at 0 50%, transparent 9px, black 10px), radial-gradient(circle 10px at 100% 50%, transparent 9px, black 10px)";

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

        {/* Title ticket (with side notches) + photo-count tag */}
        <div className="min-w-0 flex-1 pt-1">
          {(entry.title || entry.description) && (
            <div
              className="relative inline-block max-w-full"
              style={{
                transform: `rotate(${NOTE_ROTATIONS[index % NOTE_ROTATIONS.length]}deg)`,
                transformOrigin: "top left",
                filter: "drop-shadow(2px 5px 8px rgba(0,0,0,0.45))",
              }}
            >
              <div
                className="pl-6 pr-7 py-3 flex items-stretch gap-3"
                style={{
                  backgroundColor: NOTE_COLORS[index % NOTE_COLORS.length],
                  backgroundImage: `
                    radial-gradient(ellipse 70px 24px at 18% 22%, rgba(70, 45, 15, 0.22), transparent 70%),
                    radial-gradient(ellipse 50px 18px at 78% 72%, rgba(80, 50, 18, 0.18), transparent 70%),
                    radial-gradient(ellipse 28px 10px at 55% 88%, rgba(65, 40, 12, 0.16), transparent 70%),
                    radial-gradient(ellipse 18px 8px at 35% 60%, rgba(90, 60, 25, 0.12), transparent 70%),
                    radial-gradient(ellipse at center, transparent 45%, rgba(45, 28, 8, 0.30) 100%),
                    linear-gradient(to bottom, transparent calc(50% - 1.5px), rgba(70, 45, 15, 0.14) calc(50% - 0.5px), rgba(70, 45, 15, 0.14) calc(50% + 0.5px), transparent calc(50% + 1.5px)),
                    url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='220' height='110'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='1.4' numOctaves='2' seed='3'/><feColorMatrix values='0 0 0 0 0.28 0 0 0 0 0.18 0 0 0 0 0.08 0 0 0 0.22 0'/></filter><rect width='220' height='110' filter='url(%23n)'/></svg>")
                  `,
                  backgroundSize: "auto, auto, auto, auto, auto, auto, 220px 110px",
                  backgroundRepeat:
                    "no-repeat, no-repeat, no-repeat, no-repeat, no-repeat, no-repeat, repeat",
                  WebkitMaskImage: TICKET_MASK,
                  maskImage: TICKET_MASK,
                  WebkitMaskComposite: "source-in",
                  maskComposite: "intersect",
                }}
              >
                <div className="flex flex-col items-center justify-center pr-3 border-r border-dashed border-stone-800/55 text-[0.55rem] tracking-[0.25em] uppercase text-stone-800/85 font-mono leading-tight">
                  <span>No.</span>
                  <span className="text-base tracking-normal font-medium mt-0.5">{String(index + 1).padStart(2, "0")}</span>
                </div>
                <div className="min-w-0">
                  {entry.title && (
                    <h2
                      className="text-3xl leading-tight text-stone-800"
                      style={{ fontFamily: "var(--font-caveat), cursive" }}
                    >
                      {entry.title}
                    </h2>
                  )}
                  {entry.description && (
                    <p
                      className="mt-0.5 text-xl leading-snug text-stone-700"
                      style={{ fontFamily: "var(--font-caveat), cursive" }}
                    >
                      {entry.description}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
          <p className="mt-4 inline-flex items-center text-[0.55rem] tracking-[0.35em] uppercase text-[#e6b87a] font-mono">
            <span className="border border-[#e6b87a]/50 px-2 py-1">
              {String(entry.photos.length).padStart(2, "0")} {entry.photos.length === 1 ? "PHOTO" : "PHOTOS"}
            </span>
          </p>
        </div>
      </div>

      {/* Polaroid stack (single row, photos overlap into a stack) */}
      <div className="relative flex flex-nowrap items-start pl-2 pr-4 min-h-[240px]">
        {entry.photos.map((photo, i) => {
          const rotation = PHOTO_ROTATIONS[(index * 3 + i) % PHOTO_ROTATIONS.length];
          const tapeColor = TAPE_COLORS[(index + i) % TAPE_COLORS.length];
          return (
            <button
              key={photo.src}
              type="button"
              onClick={() => onPhotoClick(entry.id, i)}
              className="relative shrink-0 group cursor-zoom-in focus:outline-none transition-transform duration-200 hover:scale-[1.05] hover:z-30"
              style={{
                transform: `rotate(${rotation}deg)`,
                marginLeft: i === 0 ? 0 : "-1.75rem",
                marginTop: i % 2 === 0 ? 0 : "0.75rem",
                zIndex: 10 + (entry.photos.length - i),
              }}
            >
              <div className="bg-[#faf3e0] p-2.5 pb-9 shadow-[4px_10px_24px_rgba(0,0,0,0.55),0_0_0_1px_rgba(255,255,255,0.06)]">
                <img
                  src={photo.src}
                  alt={photo.alt}
                  loading="lazy"
                  className="block w-40 h-40 object-cover bg-stone-700/60"
                />
                {photo.stamp && (
                  <span className="absolute bottom-2 right-3 text-[0.6rem] text-[#5a4023] font-mono tracking-wide">
                    {photo.stamp}
                  </span>
                )}
              </div>
              {/* masking tape */}
              <span
                aria-hidden
                className="absolute -top-2 left-1/2 w-16 h-5 -translate-x-1/2 shadow-[0_1px_2px_rgba(0,0,0,0.3)]"
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
