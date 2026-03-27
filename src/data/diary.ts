export interface DiaryEntry {
  id: string;
  date: string;
  title: string;
  description: string;
  photos: { src: string; alt: string }[];
}

export const diaryEntries: DiaryEntry[] = [
  {
    id: "2026-03-27-late-night",
    date: "2026-03-27",
    title: "深夜のコーディング",
    description:
      "午前3時、コーヒーとコードだけが友達。新しい機能を実装中。睡眠は明日の自分に任せよう。",
    photos: [
      { src: "coffee.svg", alt: "深夜のデスク" },
      { src: "terminal.svg", alt: "ターミナル画面" },
    ],
  },
  {
    id: "2026-03-20-night-walk",
    date: "2026-03-20",
    title: "雨の夜散歩",
    description:
      "雨の中を歩いた。ネオンが濡れた路面に反射して、まるでサイバーパンクの世界みたいだった。",
    photos: [{ src: "rain_street.svg", alt: "雨の夜道" }],
  },
  {
    id: "2026-03-10-city",
    date: "2026-03-10",
    title: "夜の街並み",
    description: "ビルの窓明かりが星みたいに見える。この街のスカイラインが好きだ。",
    photos: [{ src: "city_night.svg", alt: "夜の街" }],
  },
];
