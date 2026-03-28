"use client";

import DiaryCard from "@/components/diary/DiaryCard";
import PhotoLightbox from "@/components/diary/PhotoLightbox";
import Footer from "@/components/footer/Footer";
import { Button } from "@/components/ui/button";
import { DIARY_API_URL, fallbackEntries, parseDriveEntries } from "@/data/diary";
import type { DiaryEntry, GasDriveEntry } from "@/data/diary";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import "../styles/glitch.css";

export default function DiaryPage() {
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lightbox, setLightbox] = useState<{
    entry: DiaryEntry;
    photoIndex: number;
  } | null>(null);

  const fetchEntries = useCallback(async () => {
    if (!DIARY_API_URL) {
      setEntries(fallbackEntries);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await fetch(DIARY_API_URL);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: GasDriveEntry[] = await res.json();
      setEntries(parseDriveEntries(data));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
      setEntries(fallbackEntries);
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

  return (
    <div className="relative min-h-screen bg-black text-green-500 font-mono flex flex-col">
      <div className="absolute top-6 left-6 z-20">
        <Link href="/">
          <Button
            variant="outline"
            className="border-green-500 text-green-500 hover:bg-green-500 hover:text-black font-mono tracking-widest bg-black/50 backdrop-blur-sm"
          >
            {"<"} RETURN
          </Button>
        </Link>
      </div>

      <main className="relative z-10 flex-1 container mx-auto px-6 pt-24 pb-12">
        <header className="mb-10">
          <h1 className="text-3xl font-bold glitch" data-text="> PHOTO_DIARY">
            {">"} PHOTO_DIARY
          </h1>
          <p className="text-green-400/60 text-sm mt-2">
            {"// "}
            {loading ? "Fetching memory fragments..." : "Retrieval complete."}
          </p>
        </header>

        {loading && (
          <div className="text-center text-green-600 mt-20">
            <p className="animate-pulse">{">"} Loading data from remote storage...</p>
          </div>
        )}

        {error && (
          <div className="text-center text-green-600 mt-4 mb-6">
            <p className="text-red-500/70 text-sm">
              {"!"} Connection error: {error}
            </p>
            <button
              type="button"
              onClick={fetchEntries}
              className="mt-2 text-green-500 hover:text-green-300 underline text-sm font-mono"
            >
              {">"} Retry connection
            </button>
          </div>
        )}

        {!loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {entries.map((entry) => (
              <DiaryCard key={entry.id} entry={entry} onPhotoClick={handlePhotoClick} />
            ))}
          </div>
        )}

        {!loading && entries.length === 0 && (
          <div className="text-center text-green-600 mt-20">
            <p>{">"} No entries found.</p>
            <p className="text-sm mt-2 text-green-700">Upload images to your Google Drive folder</p>
          </div>
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
