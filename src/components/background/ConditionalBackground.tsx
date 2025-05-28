"use client";
import { usePathname } from "next/navigation";
import Background from "./Background";

export const ConditionalBackground = () => {
  const pathname = usePathname();

  // TextDeltaページでは雨のエフェクトを無効化
  // basePathを考慮して判定
  if (pathname === "/text-delta" || pathname === "/text-delta/") {
    return null;
  }

  return <Background />;
};
