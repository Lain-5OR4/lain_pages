import type { DiaryEntry } from "../../shared/types/diary";

export type { DiaryEntry };

// Dev-only mock data. Used in development when NODE_ENV === "development".
// picsum.photos seed URLs are deterministic so the layout stays stable across reloads.
export const mockEntries: DiaryEntry[] = [
  {
    id: "mock-6",
    date: "2026-04-27",
    title: "週末のカフェ巡り",
    description: "新しいお気に入りを見つけた",
    photos: [
      { src: "https://picsum.photos/seed/cafe-a/600/600", alt: "cafe", stamp: "'26 04 27 10:48" },
      { src: "https://picsum.photos/seed/cafe-b/600/600", alt: "cafe", stamp: "'26 04 27 11:32" },
      { src: "https://picsum.photos/seed/cafe-c/600/600", alt: "cafe", stamp: "'26 04 27 13:18" },
      { src: "https://picsum.photos/seed/cafe-d/600/600", alt: "cafe", stamp: "'26 04 27 14:05" },
      { src: "https://picsum.photos/seed/cafe-e/600/600", alt: "cafe", stamp: "'26 04 27 16:04" },
      { src: "https://picsum.photos/seed/cafe-f/600/600", alt: "cafe", stamp: "'26 04 27 17:22" },
    ],
  },
  {
    id: "mock-5",
    date: "2026-04-22",
    title: "雨と本と、ひとりぼっちの図書館",
    description: "雨の音と紙の匂い。",
    photos: [
      { src: "https://picsum.photos/seed/rain-a/600/600", alt: "rain", stamp: "'26 04 22 14:11" },
      { src: "https://picsum.photos/seed/book-b/600/600", alt: "book", stamp: "'26 04 22 15:40" },
    ],
  },
  {
    id: "mock-4",
    date: "2026-04-12",
    title: "雨の午後",
    description: "♪ piano",
    photos: [
      { src: "https://picsum.photos/seed/piano-a/600/600", alt: "piano", stamp: "'26 04 12 13:22" },
      { src: "https://picsum.photos/seed/piano-b/600/600", alt: "piano", stamp: "'26 04 12 14:07" },
    ],
  },
  {
    id: "mock-3",
    date: "2026-04-09",
    title: "焙煎所",
    description: "ねむい朝",
    photos: [
      {
        src: "https://picsum.photos/seed/roastery-a/600/600",
        alt: "roastery",
        stamp: "'26 04 09 07:51",
      },
      {
        src: "https://picsum.photos/seed/roastery-b/600/600",
        alt: "roastery",
        stamp: "'26 04 09 08:23",
      },
    ],
  },
  {
    id: "mock-2",
    date: "2026-04-02",
    title: "看板猫の日",
    description: "◯◯ 大満足",
    photos: [
      { src: "https://picsum.photos/seed/cat-a/600/600", alt: "cat", stamp: "'26 04 02 12:14" },
      { src: "https://picsum.photos/seed/cat-b/600/600", alt: "cat", stamp: "'26 04 02 12:30" },
    ],
  },
  {
    id: "mock-1",
    date: "2026-03-22",
    title: "春の終わり",
    description: "葉桜",
    photos: [
      {
        src: "https://picsum.photos/seed/spring-a/600/600",
        alt: "spring",
        stamp: "'26 03 22 14:05",
      },
      {
        src: "https://picsum.photos/seed/spring-b/600/600",
        alt: "spring",
        stamp: "'26 03 22 14:33",
      },
      {
        src: "https://picsum.photos/seed/spring-c/600/600",
        alt: "spring",
        stamp: "'26 03 22 15:01",
      },
      {
        src: "https://picsum.photos/seed/spring-d/600/600",
        alt: "spring",
        stamp: "'26 03 22 15:48",
      },
    ],
  },
];
