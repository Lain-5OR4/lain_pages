"use client";

import DiaryCard from "@/components/diary/DiaryCard";
import PhotoLightbox from "@/components/diary/PhotoLightbox";
import Footer from "@/components/footer/Footer";
import { Button } from "@/components/ui/button";
import { diaryEntries } from "@/data/diary";
import type { DiaryEntry } from "@/data/diary";
import Link from "next/link";
import { useState } from "react";
import "../styles/glitch.css";

export default function DiaryPage() {
  const [lightbox, setLightbox] = useState<{
    entry: DiaryEntry;
    photoIndex: number;
  } | null>(null);

  const handlePhotoClick = (entryId: string, photoIndex: number) => {
    const entry = diaryEntries.find((e) => e.id === entryId);
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
          <p className="text-green-400/60 text-sm mt-2">{"// "}Retrieving memory fragments...</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {diaryEntries.map((entry) => (
            <DiaryCard key={entry.id} entry={entry} onPhotoClick={handlePhotoClick} />
          ))}
        </div>

        {diaryEntries.length === 0 && (
          <div className="text-center text-green-600 mt-20">
            <p>{">"} No entries found.</p>
            <p className="text-sm mt-2 text-green-700">Add entries to src/data/diary.ts</p>
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
