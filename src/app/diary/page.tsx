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
        className="relative min-h-[calc(100vh-1rem)] sm:min-h-[calc(100vh-1.5rem)] md:min-h-[calc(100vh-2rem)] text-stone-100"
        style={{
          backgroundColor: "#7a5630",
          backgroundImage: `
            url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='220' height='220'><filter id='c'><feTurbulence type='fractalNoise' baseFrequency='0.72' numOctaves='4' seed='2'/><feComponentTransfer><feFuncA type='discrete' tableValues='0 0 0.3 0.7 0.95 1'/></feComponentTransfer><feColorMatrix values='0 0 0 0 0.16  0 0 0 0 0.09  0 0 0 0 0.03  0 0 0 1 0'/></filter><rect width='220' height='220' filter='url(%23c)'/></svg>"),
            url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='90' height='90'><filter id='f'><feTurbulence type='fractalNoise' baseFrequency='2.3' numOctaves='2' seed='9'/><feColorMatrix values='0 0 0 0 0.30  0 0 0 0 0.18  0 0 0 0 0.07  0 0 0 0.5 0'/></filter><rect width='90' height='90' filter='url(%23f)'/></svg>"),
            radial-gradient(ellipse at 50% 40%, rgba(150, 110, 65, 0.25), transparent 70%)
          `,
          backgroundSize: "220px 220px, 90px 90px, 100% 100%",
          backgroundRepeat: "repeat, repeat, no-repeat",
          boxShadow:
            "inset 0 0 0 1px rgba(0,0,0,0.55), inset 0 0 30px rgba(0,0,0,0.6), inset 0 10px 20px rgba(0,0,0,0.45), 0 4px 16px rgba(0,0,0,0.55)",
        }}
      >
        <main className="relative max-w-7xl mx-auto px-10 pt-20 pb-32">
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
