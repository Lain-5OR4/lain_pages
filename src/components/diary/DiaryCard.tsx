"use client";

import type { DiaryEntry } from "@/data/diary";
import DateSticker from "./DateSticker";
import DescriptionNote from "./DescriptionNote";
import PolaroidPhoto from "./PolaroidPhoto";
import TitleTicket from "./TitleTicket";
import {
  MONTHS,
  PHOTO_ROTATIONS,
  STICKER_ROTATIONS,
  STICKY_COLORS,
  STICKY_ROTATIONS,
  TAPE_COLORS,
  WEEKDAYS,
} from "./constants";

/**
 * ダイアリーカードコンポーネントのプロパティ。
 */
interface DiaryCardProps {
  /** 表示するダイアリーエントリーのデータ。 */
  entry: DiaryEntry;
  /** グリッド内でのゼロ始まりインデックス。各子コンポーネントの色・回転角の循環選択に使う。 */
  index: number;
  /** 写真クリック時のコールバック。ライトボックスを開くために使う。 */
  onPhotoClick: (entry: DiaryEntry, photoIndex: number) => void;
}

/**
 * 1 件分のダイアリーエントリーをコルクボードに貼り付けたカードとして表示するコンポーネント。
 *
 * {@link DateSticker}・{@link TitleTicket}・{@link PolaroidPhoto}・{@link DescriptionNote} を
 * 組み合わせるオーケストレーター。各子コンポーネントへ渡す色・回転角の計算と
 * 写真の表示上限（最大 3 枚）処理をここで担う。
 *
 * @param props - {@link DiaryCardProps} を参照。
 * @returns ダイアリーカードの `<article>` 要素。
 */
export default function DiaryCard({ entry, index, onPhotoClick }: DiaryCardProps) {
  const d = new Date(`${entry.date}T00:00:00`);
  const month = MONTHS[d.getMonth()];
  const day = String(d.getDate()).padStart(2, "0");
  const weekday = WEEKDAYS[d.getDay()];

  const visibleCount = Math.min(3, entry.photos.length);
  const extra = entry.photos.length - 3;

  return (
    <article className="relative pt-6 pb-4 px-2">
      {/* dashed alignment guide */}
      <div className="absolute inset-0 border border-dashed border-stone-200/15 pointer-events-none" />

      <div className="relative flex items-start gap-4 mb-6">
        <DateSticker
          month={month}
          day={day}
          weekday={weekday}
          rotation={STICKER_ROTATIONS[index % STICKER_ROTATIONS.length]}
        />
        <TitleTicket title={entry.title ?? ""} index={index} />
      </div>

      {/* Polaroid stack (single row, photos overlap into a stack).
          Show at most 3 polaroids; if there are extras, label the 3rd
          with a "+N photos" sticky note so the rest live behind the lightbox. */}
      <div className="relative flex flex-nowrap items-start pl-2 pr-4 min-h-60">
        {entry.photos.slice(0, 3).map((photo, i) => {
          const rotation = PHOTO_ROTATIONS[(index * 3 + i) % PHOTO_ROTATIONS.length];
          const showOverflowTag = i === 2 && extra > 0;
          return (
            <div
              key={photo.src}
              style={{
                transform: `rotate(${rotation}deg)`,
                marginLeft: i === 0 ? 0 : "-1.75rem",
                marginTop: i % 2 === 0 ? 0 : "0.75rem",
                zIndex: 10 + (visibleCount - i),
                position: "relative",
              }}
            >
              <PolaroidPhoto
                photo={photo}
                cardIndex={index}
                photoIndex={i}
                rotation={rotation}
                extra={extra}
                showOverflowTag={showOverflowTag}
                onClick={() => onPhotoClick(entry, i)}
              />
            </div>
          );
        })}

        {/* Description sticky note — stuck onto the photo area */}
        {entry.description && (
          <DescriptionNote
            description={entry.description}
            rotation={STICKY_ROTATIONS[index % STICKY_ROTATIONS.length]}
            tapeColor={TAPE_COLORS[(index + 2) % TAPE_COLORS.length]}
            stickyColor={STICKY_COLORS[index % STICKY_COLORS.length]}
          />
        )}
      </div>
    </article>
  );
}
