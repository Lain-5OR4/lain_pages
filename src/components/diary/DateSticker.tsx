import { ZIGZAG_BOTTOM } from "./constants";

/**
 * カレンダーページ風の日付シールコンポーネントのプロパティ。
 */
interface DateStickerProps {
  /** 月名の略称（例: "JAN"）。 */
  month: string;
  /** 2 桁ゼロ埋めの日付文字列（例: "07"）。 */
  day: string;
  /** 曜日名の略称（例: "MON"）。 */
  weekday: string;
  /** 傾き角度（度）。正で時計回り、負で反時計回り。 */
  rotation: number;
}

/**
 * カレンダーページを模した日付シールを表示するコンポーネント。
 *
 * 上部の赤いバー（月名）と下部のベージュのボディ（日・曜日）で構成される。
 * 上端はジグザグクリップパスでミシン目のような切り取り線を表現している。
 *
 * @param props - {@link DateStickerProps} を参照。
 * @returns カレンダーページ風の日付シール要素。
 */
export default function DateSticker({ month, day, weekday, rotation }: DateStickerProps) {
  return (
    <div
      className="relative shrink-0 select-none drop-shadow-[2px_4px_6px_rgba(0,0,0,0.5)]"
      style={{
        transform: `rotate(${rotation}deg)`,
        transformOrigin: "top left",
      }}
    >
      <div
        className="bg-[#9c3a36] h-5 w-16 flex items-center justify-center text-[0.55rem] tracking-[0.25em] text-[#f0e6d2] font-medium"
        style={{ clipPath: ZIGZAG_BOTTOM }}
      >
        {month}
      </div>
      <div className="bg-[#ede1c8] text-[#3a2c1c] px-2 py-1 w-16 text-center -mt-0.5">
        <div className="text-3xl font-serif font-light leading-none tracking-tight">{day}</div>
        <div className="text-[0.5rem] tracking-[0.3em] text-stone-600 mt-1">{weekday}</div>
      </div>
    </div>
  );
}
