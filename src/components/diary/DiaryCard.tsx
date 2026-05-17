"use client";

import { Card, CardContent } from "@/components/ui/card";
import type { DiaryEntry } from "@/data/diary";

interface DiaryCardProps {
  entry: DiaryEntry;
  onPhotoClick: (entryId: string, photoIndex: number) => void;
}

export default function DiaryCard({ entry, onPhotoClick }: DiaryCardProps) {
  const firstPhoto = entry.photos[0];
  const extraCount = entry.photos.length - 1;
  const dateFormatted = entry.date.replace(/-/g, ".");

  return (
    <Card className="bg-black border-green-500 border-2 text-green-500 shadow-[0_0_10px_rgba(0,255,0,0.3)] font-mono hover:shadow-[0_0_20px_rgba(0,255,0,0.5)] transition-all duration-300 overflow-hidden">
      <button
        type="button"
        className="relative cursor-pointer group overflow-hidden w-full"
        onClick={() => onPhotoClick(entry.id, 0)}
      >
        <img
          src={firstPhoto.src}
          alt={firstPhoto.alt}
          loading="lazy"
          className="w-full h-48 object-cover transition-all duration-300 group-hover:scale-105 group-hover:brightness-110"
        />
        <div className="absolute inset-0 pointer-events-none bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(0,0,0,0.1)_2px,rgba(0,0,0,0.1)_4px)]" />
        <div className="absolute inset-0 pointer-events-none border-b-2 border-green-500/50" />
        {firstPhoto.stamp && (
          <span className="absolute bottom-2 right-2 pointer-events-none text-orange-400/90 text-xs font-mono tracking-wider drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
            {firstPhoto.stamp}
          </span>
        )}
        {extraCount > 0 && (
          <span className="absolute top-2 right-2 bg-black/80 border border-green-500 text-green-400 text-xs px-2 py-0.5 font-mono">
            +{extraCount}
          </span>
        )}
      </button>
      <CardContent className="p-4">
        <p className="text-xs text-green-600 mb-1">
          {">"} {dateFormatted}
        </p>
        <h3 className="text-sm font-bold text-green-400 mb-2">{entry.title}</h3>
        <p className="text-xs text-green-400/70 leading-relaxed">{entry.description}</p>
      </CardContent>
    </Card>
  );
}
