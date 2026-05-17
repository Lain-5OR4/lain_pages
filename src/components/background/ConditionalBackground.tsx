"use client";
import { usePathname } from "next/navigation";
import Background from "./Background";

export const ConditionalBackground = () => {
  const pathname = usePathname();

  // 雨のエフェクトを無効化するパス
  const NO_RAIN = new Set([
    "/text-delta",
    "/text-delta/",
    "/diary",
    "/diary/",
  ]);
  if (NO_RAIN.has(pathname)) {
    return null;
  }

  return <Background />;
};
