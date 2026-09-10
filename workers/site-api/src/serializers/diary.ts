import type { PostWithImages } from "../data/posts";
import type { DiaryEntry } from "../types";
import { formatStamp } from "../utils";

export const toDiaryEntry = (p: PostWithImages, origin: string): DiaryEntry => {
  // D1's CURRENT_TIMESTAMP is UTC but written as "YYYY-MM-DD HH:MM:SS" with no
  // marker; tag it so formatStamp treats it as UTC and shifts to JST.
  const createdUtc = /[Z]|[+-]\d{2}:?\d{2}$/.test(p.created_at)
    ? p.created_at
    : `${p.created_at.replace(" ", "T")}Z`;
  return {
    id: String(p.id),
    date: p.posted_on,
    title: p.title,
    description: p.caption,
    photos: p.images.map((img) => ({
      src: `${origin}/images/${img.key}`,
      alt: p.title || p.caption || `#${p.id}`,
      stamp: formatStamp(img.taken_at ?? createdUtc),
    })),
  };
};
