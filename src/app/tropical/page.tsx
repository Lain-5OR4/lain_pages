import type { Metadata } from "next";
import Tropical from "./Tropical";

export const metadata: Metadata = {
  title: "Sunday Club — Tropical day off",
  description: "海辺の休日をテーマにした、Sunday Clubのデザインデモ。",
};

export default function Page() {
  return <Tropical />;
}
