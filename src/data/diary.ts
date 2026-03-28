export interface DiaryEntry {
  id: string;
  date: string;
  title: string;
  description: string;
  photos: { src: string; alt: string; stamp?: string }[];
}

// GAS Web App URL（デプロイ後にここを差し替え）
export const DIARY_API_URL =
  "https://script.google.com/macros/s/AKfycbxj7W9ZVSMxWYVaj1u37WqYfp0blc08JrYZe8xMGFXefC4ctDPpxNY8i8_wsV78ljayGA/exec";

export interface GasDriveEntry {
  id: string;
  title: string;
  description: string;
  date: string;
  photos: { id: string; name: string; url: string }[];
}

/** Pixel ファイル名 "PXL_YYYYMMDD_HHMMSS*.jpg" から JST 日時スタンプを抽出 */
function parsePixelTimestamp(filename: string): { date: string; time: string } | null {
  const match = filename.match(/^PXL_(\d{4})(\d{2})(\d{2})_(\d{2})(\d{2})(\d{2})/);
  if (!match) return null;
  const utc = new Date(
    Date.UTC(+match[1], +match[2] - 1, +match[3], +match[4], +match[5], +match[6]),
  );
  const jst = new Date(utc.getTime() + 9 * 60 * 60 * 1000);
  const y = String(jst.getUTCFullYear()).slice(2);
  const mo = String(jst.getUTCMonth() + 1).padStart(2, "0");
  const d = String(jst.getUTCDate()).padStart(2, "0");
  const h = String(jst.getUTCHours()).padStart(2, "0");
  const m = String(jst.getUTCMinutes()).padStart(2, "0");
  return { date: `'${y} ${mo} ${d}`, time: `${h}:${m}` };
}

/** GASレスポンス（サブフォルダ単位）を DiaryEntry[] に変換 */
export function parseDriveEntries(entries: GasDriveEntry[]): DiaryEntry[] {
  return entries.map((entry) => ({
    id: entry.id,
    date: entry.date,
    title: entry.title,
    description: entry.description,
    photos: entry.photos.map((p) => {
      const ts = parsePixelTimestamp(p.name);
      return {
        src: p.url,
        alt: p.name,
        stamp: ts ? `${ts.date} ${ts.time}` : "",
      };
    }),
  }));
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
