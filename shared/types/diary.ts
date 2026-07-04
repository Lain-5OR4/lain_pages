// Single source of truth for the diary API contract between
// workers/photo-diary (`GET /api/diary`, producer) and the Next.js
// frontend (`src/app/diary`, consumer). Both sides re-export from here.
export interface DiaryEntry {
  id: string;
  date: string;
  title: string;
  description: string;
  photos: { src: string; alt: string; stamp?: string }[];
}
