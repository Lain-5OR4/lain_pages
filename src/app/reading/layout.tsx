import type { Metadata } from "next";
import { Zen_Kaku_Gothic_New, Zen_Old_Mincho } from "next/font/google";
import type { ReactNode } from "react";
import "./reading.css";

const zenOldMincho = Zen_Old_Mincho({
  subsets: ["latin"],
  variable: "--font-zen-old-mincho",
  weight: ["400", "500", "700", "900"],
});

const zenKaku = Zen_Kaku_Gothic_New({
  subsets: ["latin"],
  variable: "--font-zen-kaku",
  weight: ["400", "500", "700"],
});

export const metadata: Metadata = {
  title: "読書記録",
  description: "本棚に並んだ読書記録。",
};

export default function ReadingLayout({ children }: { children: ReactNode }) {
  return <div className={`${zenOldMincho.variable} ${zenKaku.variable}`}>{children}</div>;
}
