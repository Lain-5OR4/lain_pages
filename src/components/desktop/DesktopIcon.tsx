type DesktopIconProps = { kind: "profile" | "reading" | "diary" };

export function DesktopIcon({ kind }: DesktopIconProps) {
  return (
    <span className={`lx-app-icon lx-app-icon--${kind}`} aria-hidden="true">
      <svg
        aria-hidden="true"
        viewBox="0 0 32 32"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {kind === "profile" && (
          <>
            <rect x="4" y="6" width="24" height="20" rx="5" />
            <path d="m10 12 4 4-4 4m8 0h5" />
          </>
        )}
        {kind === "reading" && (
          <>
            <path d="M16 9c-3-2-7-3-12-2v18c5-1 9 0 12 2 3-2 7-3 12-2V7c-5-1-9 0-12 2Z" />
            <path d="M16 9v18M8 12l4 1m-4 4 4 1m8-5 4-1m-4 6 4-1" />
          </>
        )}
        {kind === "diary" && (
          <>
            <rect x="5" y="4" width="22" height="24" rx="5" />
            <circle cx="12" cy="11" r="2" />
            <path d="m6 22 6-6 4 4 4-7 7 9M11 25h10" />
          </>
        )}
      </svg>
    </span>
  );
}
