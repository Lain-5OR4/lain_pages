import { JOURNAL } from "@/components/blog/theme";
import Link from "next/link";
import type { ReactNode } from "react";

function PromptLine({ command }: { command: string }) {
  return (
    <>
      <span style={{ color: JOURNAL.accent }}>mizora@journal</span>
      <span className="text-stone-400">:</span>
      <span className="text-stone-700">~/posts</span>
      <span className="text-stone-400">$ </span>
      <span className="text-stone-900">{command}</span>
    </>
  );
}

// Fake shell prompt shown at the top of every journal page. `href` turns the
// prompt line into a link (used on detail pages to go back to the index);
// `children` renders below the divider (front-matter block on detail pages).
export function JournalHeader({
  command,
  href,
  children,
}: {
  command: string;
  href?: string;
  children?: ReactNode;
}) {
  return (
    <header
      className="text-[0.78rem] leading-[1.7] mb-12"
      style={{ fontFamily: JOURNAL.mono, color: JOURNAL.headerInk }}
    >
      <div>
        {href ? (
          <Link href={href} className="no-underline hover:opacity-80 transition-opacity">
            <PromptLine command={command} />
          </Link>
        ) : (
          <PromptLine command={command} />
        )}
      </div>
      <div className="mt-2 border-t border-stone-300" />
      {children}
    </header>
  );
}

export function JournalFooter({ backHref, backLabel }: { backHref: string; backLabel: string }) {
  return (
    <footer className="mt-16 pt-6 border-t border-stone-300 text-[0.6rem] tracking-[0.32em] uppercase text-stone-500 flex justify-between">
      <Link href={backHref} className="hover:text-stone-900 transition-colors">
        ← {backLabel}
      </Link>
      <span>© 2026 mizora.dev</span>
    </footer>
  );
}
