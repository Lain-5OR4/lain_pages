import { JOURNAL } from "@/components/blog/theme";
import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import type { ReactNode } from "react";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  weight: ["400", "500"],
  style: ["normal", "italic"],
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: {
    default: "mizora journal",
    template: "%s | mizora journal",
  },
  description: "Notes on what I'm building and breaking.",
};

export default function BlogLayout({ children }: { children: ReactNode }) {
  return (
    <div
      className={`${playfair.variable} ${inter.variable} min-h-screen`}
      style={{ background: JOURNAL.bg, color: JOURNAL.ink, fontFamily: JOURNAL.sans }}
    >
      {children}
    </div>
  );
}
