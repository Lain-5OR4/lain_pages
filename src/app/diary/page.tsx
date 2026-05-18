"use client";

import DiaryCard from "@/components/diary/DiaryCard";
import PhotoLightbox from "@/components/diary/PhotoLightbox";
import { Button } from "@/components/ui/button";
import { mockEntries, type DiaryEntry } from "@/data/diary";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

const DIARY_API_BASE = process.env.NEXT_PUBLIC_DIARY_API ?? "https://api.mizora.dev";

export default function DiaryPage() {
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lightbox, setLightbox] = useState<{
    entry: DiaryEntry;
    photoIndex: number;
  } | null>(null);

  const fetchEntries = useCallback(async () => {
    // Dev: use mock data to preview the layout with multiple entries.
    if (process.env.NODE_ENV === "development") {
      setEntries(mockEntries);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${DIARY_API_BASE}/api/diary`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setEntries((await res.json()) as DiaryEntry[]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
      setEntries([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  const handlePhotoClick = (entryId: string, photoIndex: number) => {
    const entry = entries.find((e) => e.id === entryId);
    if (entry) setLightbox({ entry, photoIndex });
  };

  const totalPhotos = entries.reduce((sum, e) => sum + e.photos.length, 0);
  const year = entries[0]?.date
    ? entries[0].date.slice(0, 4)
    : new Date().getFullYear().toString();

  return (
    <div
      className="relative min-h-screen p-2 sm:p-3 md:p-4 overflow-x-hidden"
      style={{
        backgroundColor: "#3a2418",
        backgroundImage: `
          url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='320' height='80'><filter id='w'><feTurbulence type='fractalNoise' baseFrequency='0.04 0.8' numOctaves='3' seed='5'/><feColorMatrix values='0 0 0 0 0.20  0 0 0 0 0.10  0 0 0 0 0.04  0 0 0 0.7 0'/></filter><rect width='320' height='80' filter='url(%23w)'/></svg>")
        `,
        backgroundSize: "320px 80px",
        backgroundRepeat: "repeat",
      }}
    >
      <div className="fixed top-8 left-8 z-30">
        <Link href="/">
          <Button
            variant="outline"
            className="border-stone-800/50 text-stone-800 hover:bg-stone-800 hover:text-amber-50 tracking-widest bg-amber-50/60 backdrop-blur-sm"
          >
            ← RETURN
          </Button>
        </Link>
      </div>

      <div
        className="relative min-h-[calc(100vh-1rem)] sm:min-h-[calc(100vh-1.5rem)] md:min-h-[calc(100vh-2rem)] text-stone-100 overflow-hidden"
        style={{
          backgroundColor: "#4a3320",
          backgroundImage: `url("/diary/cork.jpg")`,
          backgroundSize: "1024px 492px",
          backgroundRepeat: "repeat",
          boxShadow:
            "inset 0 0 0 1px rgba(0,0,0,0.55), inset 0 0 30px rgba(0,0,0,0.55), inset 0 10px 20px rgba(0,0,0,0.4), 0 4px 16px rgba(0,0,0,0.55)",
        }}
      >
        {/* Fairy lights draped along the top of the corkboard.
            Wire is an SVG that stretches with the container; bulbs are
            HTML wrappers with fixed-size inner SVGs so they stay circular
            regardless of viewport width. */}
        <div
          className="absolute left-0 right-0 top-6 w-full h-32 pointer-events-none z-[1]"
          aria-hidden
        >
          <svg
            className="absolute inset-0 w-full h-full"
            viewBox="0 0 1000 128"
            preserveAspectRatio="none"
          >
            {/* wire shadow */}
            <path
              d="M 0 20 Q 500 100 1000 26"
              fill="none"
              stroke="rgba(0,0,0,0.55)"
              strokeWidth="2.4"
              transform="translate(1.5, 2.5)"
            />
            {/* wire */}
            <path
              d="M 0 20 Q 500 100 1000 26"
              fill="none"
              stroke="#1a0e05"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
          </svg>
          {[
            { xPct: 5, y: 28, dim: false },
            { xPct: 15, y: 41, dim: true },
            { xPct: 25, y: 51, dim: false },
            { xPct: 35, y: 57, dim: false },
            { xPct: 45, y: 61, dim: false },
            { xPct: 55, y: 61, dim: true },
            { xPct: 65, y: 59, dim: false },
            { xPct: 75, y: 53, dim: false },
            { xPct: 85, y: 44, dim: true },
            { xPct: 95, y: 32, dim: false },
          ].map((b, i) => (
            <div
              key={i}
              className="absolute"
              style={{
                left: `${b.xPct}%`,
                top: `${b.y}px`,
                transform: "translate(-50%, 0)",
              }}
            >
              <svg width="36" height="40" viewBox="0 0 36 40" style={{ overflow: "visible" }}>
                <line x1="18" y1="0" x2="18" y2="6" stroke="#1a0e05" strokeWidth="1.2" />
                <circle
                  cx="18"
                  cy="20"
                  r="15"
                  fill="#ffd06b"
                  opacity={b.dim ? 0.18 : 0.38}
                  style={{ filter: "blur(5px)" }}
                />
                <circle
                  cx="18"
                  cy="20"
                  r="7"
                  fill="#ffe49b"
                  opacity={b.dim ? 0.4 : 0.7}
                  style={{ filter: "blur(1.8px)" }}
                />
                <ellipse
                  cx="18"
                  cy="20"
                  rx="3.5"
                  ry="4.8"
                  fill={b.dim ? "#e8c280" : "#fff2b8"}
                  stroke="#b8691f"
                  strokeWidth="0.4"
                  opacity={b.dim ? 0.75 : 1}
                />
                <ellipse
                  cx="17"
                  cy="18.4"
                  rx="1.1"
                  ry="1.8"
                  fill="#fffce0"
                  opacity={b.dim ? 0.75 : 1}
                />
              </svg>
            </div>
          ))}
          {/* anchor nails at the wire ends */}
          <div
            className="absolute w-2 h-2 rounded-full bg-stone-950"
            style={{
              left: "0.4%",
              top: "18px",
              boxShadow: "inset 0.5px 0.5px 0 rgba(255,230,180,0.45)",
            }}
          />
          <div
            className="absolute w-2 h-2 rounded-full bg-stone-950"
            style={{
              right: "0.4%",
              top: "24px",
              boxShadow: "inset 0.5px 0.5px 0 rgba(255,230,180,0.45)",
            }}
          />
        </div>

        <main className="relative max-w-[110rem] mx-auto px-6 sm:px-10 md:px-14 pt-20 pb-32 z-[2]">
        <header className="flex items-baseline justify-between mb-12">
          <p className="text-[0.7rem] tracking-[0.35em] text-stone-100/85 uppercase">
            PHOTO DIARY · BY DATE · {year}
          </p>
          <p className="text-[0.75rem] tracking-[0.15em] text-stone-100/85">
            {loading ? "loading..." : `${entries.length} days · ${totalPhotos} photos`}
          </p>
        </header>

        {error && (
          <div className="text-center my-8">
            <p className="text-red-300/80 text-sm">! connection error: {error}</p>
            <button
              type="button"
              onClick={fetchEntries}
              className="mt-2 text-stone-200 underline text-sm"
            >
              retry
            </button>
          </div>
        )}

        {!loading && entries.length === 0 && !error && (
          <p className="text-center text-stone-300 mt-20 text-2xl tracking-widest">
            no entries yet.
          </p>
        )}

        {entries.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-20">
            {entries.map((entry, i) => (
              <DiaryCard
                key={entry.id}
                entry={entry}
                index={i}
                onPhotoClick={handlePhotoClick}
              />
            ))}
          </div>
        )}

        {entries.length > 0 && (
          <div className="absolute bottom-10 right-10 text-stone-100/55 pointer-events-none select-none">
            <span className="text-[0.7rem] tracking-[0.5em]">
              VOL · {String(entries.length).padStart(2, "0")}
            </span>
          </div>
        )}
        </main>
      </div>

      {lightbox && (
        <PhotoLightbox
          entry={lightbox.entry}
          initialPhotoIndex={lightbox.photoIndex}
          onClose={() => setLightbox(null)}
        />
      )}
    </div>
  );
}
