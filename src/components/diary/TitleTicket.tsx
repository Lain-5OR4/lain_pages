import { NOTE_COLORS, NOTE_ROTATIONS, TICKET_MASK } from "./constants";

/**
 * タイトルチケットコンポーネントのプロパティ。
 */
interface TitleTicketProps {
  /** エントリーのタイトル文字列。空文字・undefined の場合はコンポーネント自体を非表示にする。 */
  title: string;
  /** カードのゼロ始まりインデックス。色・回転角の循環選択に使う。 */
  index: number;
}

/**
 * 映画半券風のタイトルチケットを表示するコンポーネント。
 *
 * 左右両端に半円ノッチを持つチケット形状で、左側に連番（No.XX）、右側にタイトルを表示する。
 * 背景は古びた紙を模した複数の radial-gradient とノイズ SVG で構成されており、
 * ノッチは CSS `mask-composite: intersect` で実現している。
 *
 * @param props - {@link TitleTicketProps} を参照。
 * @returns タイトルチケット要素。`title` が空の場合は `null`。
 */
export default function TitleTicket({ title, index }: TitleTicketProps) {
  return (
    <div className="min-w-0 flex-1 pt-1">
      {title && (
        <div
          className="relative inline-block max-w-[20rem]"
          style={{
            transform: `rotate(${NOTE_ROTATIONS[index % NOTE_ROTATIONS.length]}deg)`,
            transformOrigin: "top left",
            filter: "drop-shadow(2px 5px 8px rgba(0,0,0,0.45))",
          }}
        >
          <div
            className="pl-6 pr-7 py-3 flex items-stretch gap-3"
            style={{
              backgroundColor: NOTE_COLORS[index % NOTE_COLORS.length],
              backgroundImage: `
                radial-gradient(ellipse 70px 24px at 18% 22%, rgba(70, 45, 15, 0.22), transparent 70%),
                radial-gradient(ellipse 50px 18px at 78% 72%, rgba(80, 50, 18, 0.18), transparent 70%),
                radial-gradient(ellipse 28px 10px at 55% 88%, rgba(65, 40, 12, 0.16), transparent 70%),
                radial-gradient(ellipse 18px 8px at 35% 60%, rgba(90, 60, 25, 0.12), transparent 70%),
                radial-gradient(ellipse at center, transparent 45%, rgba(45, 28, 8, 0.30) 100%),
                linear-gradient(to bottom, transparent calc(50% - 1.5px), rgba(70, 45, 15, 0.14) calc(50% - 0.5px), rgba(70, 45, 15, 0.14) calc(50% + 0.5px), transparent calc(50% + 1.5px)),
                url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='220' height='110'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='1.4' numOctaves='2' seed='3'/><feColorMatrix values='0 0 0 0 0.28 0 0 0 0 0.18 0 0 0 0 0.08 0 0 0 0.22 0'/></filter><rect width='220' height='110' filter='url(%23n)'/></svg>")
              `,
              backgroundSize: "auto, auto, auto, auto, auto, auto, 220px 110px",
              backgroundRepeat:
                "no-repeat, no-repeat, no-repeat, no-repeat, no-repeat, no-repeat, repeat",
              WebkitMaskImage: TICKET_MASK,
              maskImage: TICKET_MASK,
              WebkitMaskComposite: "source-in",
              maskComposite: "intersect",
            }}
          >
            <div className="flex flex-col items-center justify-center pr-3 border-r border-dashed border-stone-800/55 text-[0.55rem] tracking-[0.25em] uppercase text-stone-800/85 font-mono leading-tight">
              <span>No.</span>
              <span className="text-base tracking-normal font-medium mt-0.5">
                {String(index + 1).padStart(2, "0")}
              </span>
            </div>
            <div className="min-w-0 overflow-hidden">
              <h2
                className="text-3xl leading-tight text-stone-800 truncate"
                style={{ fontFamily: "var(--font-dot-gothic), sans-serif" }}
                title={title}
              >
                {title}
              </h2>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
