import { ZIGZAG_TAPE_EDGES } from "./constants";

interface DescriptionNoteProps {
  description: string;
  rotation: number;
  tapeColor: string;
  stickyColor: string;
}

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
        className="px-3 py-2.5 max-w-56"
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
