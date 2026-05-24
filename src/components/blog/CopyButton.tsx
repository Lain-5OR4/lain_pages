"use client";

import { useState } from "react";

export function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const onClick = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    } catch {
      // Clipboard API may fail in non-secure contexts; silent.
    }
  };

  return (
    <button
      onClick={onClick}
      type="button"
      aria-label={copied ? "Copied" : "Copy code"}
      className="absolute top-2 right-2 z-10 inline-flex items-center gap-1 px-2 py-1 text-[0.62rem] tracking-[0.18em] uppercase rounded font-mono text-stone-300 bg-white/[0.06] border border-white/10 hover:bg-white/[0.14] hover:text-white opacity-70 group-hover:opacity-100 focus-visible:opacity-100 transition-opacity transition-colors"
    >
      {copied ? (
        <>
          <svg
            width="11"
            height="11"
            viewBox="0 0 20 20"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <polyline points="4 11 8 15 16 5" />
          </svg>
          <span>Copied</span>
        </>
      ) : (
        <>
          <svg
            width="11"
            height="11"
            viewBox="0 0 20 20"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <rect x="6" y="6" width="10" height="11" rx="1.5" />
            <path d="M4 13V5a1.5 1.5 0 0 1 1.5-1.5H13" />
          </svg>
          <span>Copy</span>
        </>
      )}
    </button>
  );
}
