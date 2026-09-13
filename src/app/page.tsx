import { LinuxDesktop } from "@/components/desktop/LinuxDesktop";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "mizora — Wired Desktop",
  description: "mizoraの個人サイト。プロフィール、読書記録、写真日記。",
};

export default function HomePage() {
  return <LinuxDesktop />;
}
