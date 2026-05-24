import { ZIGZAG_TAPE_EDGES } from "./constants";

/**
 * 説明文付箋コンポーネントのプロパティ。
 */
interface DescriptionNoteProps {
  /** 付箋に表示するエントリーの説明文。 */
  description: string;
  /** 付箋の傾き角度（度）。正で時計回り、負で反時計回り。 */
  rotation: number;
  /** 上部マスキングテープの色。`TAPE_COLORS` から選択した CSS カラー文字列。 */
  tapeColor: string;
  /** 付箋本体の背景色。`STICKY_COLORS` から選択した CSS カラー文字列。 */
  stickyColor: string;
}

/**
 * エントリーの説明文を表示する付箋コンポーネント。
 *
 * 写真エリアの右下に絶対配置され、上部にマスキングテープが貼られた付箋を模している。
 * テープの傾きは付箋の回転方向と逆向きにすることで、貼り付けた自然さを演出する。
 * `pointer-events-none` を付与しているため、写真クリックの妨げにならない。
 *
 * @param props - {@link DescriptionNoteProps} を参照。
 * @returns 付箋スタイルの説明文要素。
 */
export default function DescriptionNote({
  description,
  rotation,
  tapeColor,
  stickyColor,
}: DescriptionNoteProps) {
  return (
    <div
      className="absolute z-40 pointer-events-none"
      style={{
        right: "0.5rem",
        bottom: "0.25rem",
        transform: `rotate(${rotation}deg)`,
        transformOrigin: "bottom right",
        filter: "drop-shadow(2px 4px 7px rgba(0,0,0,0.45))",
      }}
    >
      <span
        aria-hidden
        className="absolute -top-2 left-1/2 w-10 h-3 -translate-x-1/2 shadow-[0_1px_2px_rgba(0,0,0,0.25)]"
        style={{
          background: tapeColor,
          clipPath: ZIGZAG_TAPE_EDGES,
          transform: `translateX(-50%) rotate(${rotation < 0 ? "-3" : "3"}deg)`,
        }}
      />
      <div
        className="px-3 py-2.5 max-w-44"
        style={{
          background: stickyColor,
          backgroundImage:
            "linear-gradient(170deg, rgba(255,255,255,0.25), transparent 40%), linear-gradient(to bottom, transparent 80%, rgba(0,0,0,0.06))",
        }}
      >
        <p
          className="text-lg leading-snug text-stone-800 wrap-break-words"
          style={{ fontFamily: "var(--font-dot-gothic), sans-serif" }}
        >
          {description}
        </p>
      </div>
    </div>
  );
}
