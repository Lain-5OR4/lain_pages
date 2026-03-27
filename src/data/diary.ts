export interface DiaryEntry {
  id: string;
  date: string;
  title: string;
  description: string;
  photos: { src: string; alt: string }[];
}

// GAS Web App URL（デプロイ後にここを差し替え）
export const DIARY_API_URL =
  "https://script.google.com/macros/s/AKfycbz6lYlyvLw5OLyuHxy9SGqSlvUrYLI2oQ1t8XDpW9LUzqKn3AwsGs6-jzEWWyvarCLiRQ/exec";

export interface GasDriveFile {
  id: string;
  name: string;
  date: string;
  title: string;
  description: string;
  url: string;
}

/** GASレスポンスを DiaryEntry[] に変換（同じ日付のファイルをグループ化） */
export function parseDriveFiles(files: GasDriveFile[]): DiaryEntry[] {
  const grouped = new Map<
    string,
    { date: string; title: string; description: string; photos: { src: string; alt: string }[] }
  >();

  for (const file of files) {
    const key = `${file.date}_${file.title}`;
    const existing = grouped.get(key);
    if (existing) {
      existing.photos.push({ src: file.url, alt: file.title });
    } else {
      grouped.set(key, {
        date: file.date,
        title: file.title,
        description: file.description,
        photos: [{ src: file.url, alt: file.title }],
      });
    }
  }

  return Array.from(grouped.entries())
    .map(([key, entry]) => ({ id: key, ...entry }))
    .sort((a, b) => b.date.localeCompare(a.date));
}

/** 画像srcを解決（フルURLならそのまま、それ以外はローカルパス） */
export function getPhotoSrc(src: string): string {
  if (src.startsWith("http")) return src;
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";
  return `${basePath}/diary/${src}`;
}

// フォールバック（GAS未設定時のサンプルデータ）
export const fallbackEntries: DiaryEntry[] = [
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
