"use client";

import { useEffect, useRef, useState } from "react";
import { type CoverPalette, extractPalette } from "./coverPalette";

// URL-keyed promises deduplicate requests across filtering and shelf remounts.
const paletteCache = new Map<string, Promise<CoverPalette | null>>();
const SAMPLE_SIZE = 32;

function loadPalette(url: string): Promise<CoverPalette | null> {
  const cached = paletteCache.get(url);
  if (cached) return cached;
  const request = new Promise<CoverPalette | null>((resolve) => {
    const image = new Image();
    const finish = (palette: CoverPalette | null) => {
      clearTimeout(timeout);
      image.onload = null;
      image.onerror = null;
      resolve(palette);
    };
    const timeout = setTimeout(() => {
      finish(null);
      image.src = "";
    }, 8000);
    image.crossOrigin = "anonymous";
    image.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = SAMPLE_SIZE;
        canvas.height = SAMPLE_SIZE;
        const context = canvas.getContext("2d", { willReadFrequently: true });
        if (!context) return finish(null);
        context.drawImage(image, 0, 0, SAMPLE_SIZE, SAMPLE_SIZE);
        finish(extractPalette(context.getImageData(0, 0, SAMPLE_SIZE, SAMPLE_SIZE).data));
      } catch {
        // Covers without CORS permission keep the deterministic cloth color.
        finish(null);
      }
    };
    image.onerror = () => finish(null);
    image.src = url;
  });
  if (paletteCache.size >= 256) {
    const oldest = paletteCache.keys().next().value;
    if (oldest) paletteCache.delete(oldest);
  }
  paletteCache.set(url, request);
  return request;
}

export function useCoverPalette(coverUrl: string | null) {
  const ref = useRef<HTMLButtonElement>(null);
  const [sample, setSample] = useState<{ url: string; palette: CoverPalette | null } | null>(null);
  useEffect(() => {
    const element = ref.current;
    if (!coverUrl || !element) return;
    let cancelled = false;
    const load = () => {
      void loadPalette(coverUrl).then((palette) => {
        if (!cancelled) setSample({ url: coverUrl, palette });
      });
    };
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          observer.disconnect();
          load();
        }
      },
      { rootMargin: "200px" },
    );
    observer.observe(element);
    return () => {
      cancelled = true;
      observer.disconnect();
    };
  }, [coverUrl]);
  return { ref, palette: sample?.url === coverUrl ? sample.palette : null };
}
