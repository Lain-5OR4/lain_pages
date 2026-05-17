"use client";

import DiaryCard from "@/components/diary/DiaryCard";
import PhotoLightbox from "@/components/diary/PhotoLightbox";
import Footer from "@/components/footer/Footer";
import { Button } from "@/components/ui/button";
import type { DiaryEntry } from "@/data/diary";
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
    <div className="min-h-screen bg-[#ede1c8] text-stone-800 flex flex-col selection:bg-stone-700/30">
      <div className="fixed top-6 left-6 z-20">
        <Link href="/">
          <Button
            variant="outline"
            className="border-stone-700/60 text-stone-700 hover:bg-stone-700 hover:text-[#ede1c8] tracking-widest bg-[#ede1c8]/70 backdrop-blur-sm"
          >
            ← RETURN
          </Button>
        </Link>
      </div>

      <main className="flex-1 max-w-3xl w-full mx-auto px-6 pt-24 pb-12">
        <header className="mb-10 pb-6 border-b-2 border-stone-700/30">
          <p className="text-[0.65rem] sm:text-xs tracking-[0.35em] text-stone-600 uppercase">
            PHOTO · DIARY · BY DATE · {year}
          </p>
          <p className="text-sm text-stone-600 mt-3 font-[var(--font-caveat)] text-lg">
            {loading ? "loading…" : `${entries.length} days · ${totalPhotos} photos`}
          </p>
        </header>

        {error && (
          <div className="text-center my-8">
            <p className="text-red-800/80 text-sm">! connection error: {error}</p>
            <button
              type="button"
              onClick={fetchEntries}
              className="mt-2 text-stone-700 underline underline-offset-2 text-sm"
            >
              retry
            </button>
          </div>
        )}

        {!loading && entries.length === 0 && !error && (
          <p
            className="text-center text-stone-500 mt-20 text-3xl"
            style={{ fontFamily: "var(--font-caveat), cursive" }}
          >
            no entries yet.
          </p>
        )}

        <div>
          {entries.map((entry, i) => (
            <div key={entry.id}>
              {i === 1 && entries.length > 2 && (
                <div className="text-center text-[0.7rem] tracking-[0.5em] text-stone-500 my-10">
                  ― EARLIER ―
                </div>
              )}
              <DiaryCard entry={entry} onPhotoClick={handlePhotoClick} />
            </div>
          ))}
        </div>

        {entries.length > 0 && (
          <footer className="mt-16 pt-6 border-t-2 border-stone-700/30 text-center">
            <p className="text-[0.7rem] tracking-[0.5em] text-stone-600">
              VOL · {String(entries.length).padStart(2, "0")}
            </p>
          </footer>
        )}
      </main>

      <Footer />

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
