import { STICKY_COLORS, TAPE_COLORS, ZIGZAG_TAPE_EDGES } from "./constants";

/**
 * ポラロイド写真コンポーネントのプロパティ。
 */
interface PolaroidPhotoProps {
  /** 表示する写真データ。 */
  photo: {
    /** 画像 URL。 */
    src: string;
    /** スクリーンリーダー向けの代替テキスト。 */
    alt: string;
    /** ポラロイド下部に印字するスタンプ文字列（例: 撮影日時）。省略可。 */
    stamp?: string;
  };
  /** 親カードのゼロ始まりインデックス。テープ色の循環選択に使う。 */
  cardIndex: number;
  /** カード内での写真のゼロ始まりインデックス。テープ色の循環選択に使う。 */
  photoIndex: number;
  /** 写真の傾き角度（度）。 */
  rotation: number;
  /** 表示上限（3枚）を超えた写真の枚数。オーバーフロータグのラベルに使う。 */
  extra: number;
  /** `true` のとき、3枚目の写真の右上にオーバーフロー枚数タグを表示する。 */
  showOverflowTag: boolean;
  /** 写真クリック時のコールバック。ライトボックスを開くために使う。 */
  onClick: () => void;
}

/**
 * ポラロイド写真 1 枚を表示するコンポーネント。
 *
 * ポラロイド本体（白い枠 + 画像 + スタンプ）と上部のマスキングテープで構成される。
 * `showOverflowTag` が `true` のとき、表示されていない写真の枚数を示す
 * 付箋スタイルのオーバーフロータグを右上に重ねて表示する。
 * クリックするとライトボックスが開く。
 *
 * @param props - {@link PolaroidPhotoProps} を参照。
 * @returns ポラロイド写真のボタン要素。
 */
export default function PolaroidPhoto({
  photo,
  cardIndex,
  photoIndex,
  rotation,
  extra,
  showOverflowTag,
  onClick,
}: PolaroidPhotoProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="relative shrink-0 group cursor-zoom-in focus:outline-none transition-transform duration-200 hover:scale-[1.05] hover:z-30"
    >
      <div className="bg-[#faf3e0] p-2.5 pb-9 shadow-[4px_10px_24px_rgba(0,0,0,0.55),0_0_0_1px_rgba(255,255,255,0.06)]">
        <img
          src={photo.src}
          alt={photo.alt}
          loading="lazy"
          className="block w-40 h-40 object-cover bg-stone-700/60"
        />
        {photo.stamp && (
          <span className="absolute bottom-2 right-3 text-[0.6rem] text-[#5a4023] font-mono tracking-wide">
            {photo.stamp}
          </span>
        )}
      </div>
      {/* マスキングテープ */}
      <span
        aria-hidden
        className="absolute -top-2 left-1/2 w-16 h-5 -translate-x-1/2 shadow-[0_1px_2px_rgba(0,0,0,0.3)]"
        style={{
          background: TAPE_COLORS[(cardIndex + photoIndex) % TAPE_COLORS.length],
          transform: `translateX(-50%) rotate(${rotation > 0 ? "-" : ""}4deg)`,
          clipPath: ZIGZAG_TAPE_EDGES,
        }}
      />
      {/* 3枚目右上に表示するオーバーフロー枚数タグ */}
      {showOverflowTag && (
        <div
          className="absolute z-40 pointer-events-none"
          style={{
            top: "32px",
            right: "14px",
            transform: "rotate(8deg)",
            transformOrigin: "top right",
            filter: "drop-shadow(2px 4px 6px rgba(0,0,0,0.5))",
          }}
        >
          <span
            aria-hidden
            className="absolute -top-1.5 left-1/2 w-9 h-2.5 -translate-x-1/2 shadow-[0_1px_2px_rgba(0,0,0,0.25)]"
            style={{
              background: TAPE_COLORS[(cardIndex + 3) % TAPE_COLORS.length],
              clipPath: ZIGZAG_TAPE_EDGES,
            }}
          />
          <div
            className="px-3 py-1.5"
            style={{
              background: STICKY_COLORS[(cardIndex + 1) % STICKY_COLORS.length],
              backgroundImage:
                "linear-gradient(170deg, rgba(255,255,255,0.25), transparent 40%), linear-gradient(to bottom, transparent 80%, rgba(0,0,0,0.06))",
            }}
          >
            <p
              className="text-xl leading-tight text-stone-800 whitespace-nowrap"
              style={{ fontFamily: "var(--font-dot-gothic), sans-serif" }}
            >
              +{extra} {extra === 1 ? "photo" : "photos"}
            </p>
          </div>
        </div>
      )}
    </button>
  );
}
