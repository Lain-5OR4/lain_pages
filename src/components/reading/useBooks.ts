"use client";

import { useEffect, useState } from "react";
import type { Book } from "@/data/books";

const API_BASE = process.env.NEXT_PUBLIC_DIARY_API ?? "https://api.mizora.dev";
type BooksState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; books: Book[] };

export function useBooks() {
  const [state, setState] = useState<BooksState>({ status: "loading" });
  const [attempt, setAttempt] = useState(0);
  // biome-ignore lint/correctness/useExhaustiveDependencies: attempt explicitly triggers a fresh request on retry.
  useEffect(() => {
    const controller = new AbortController();
    setState({ status: "loading" });
    async function load() {
      try {
        const response = await fetch(`${API_BASE}/api/books`, { signal: controller.signal });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const books: Book[] = await response.json();
        if (!Array.isArray(books)) throw new Error("本のデータを読み込めませんでした");
        if (!controller.signal.aborted) setState({ status: "ready", books });
      } catch (error) {
        if (!controller.signal.aborted) {
          setState({
            status: "error",
            message: error instanceof Error ? error.message : "接続エラー",
          });
        }
      }
    }
    void load();
    return () => controller.abort();
  }, [attempt]);
  return { state, retry: () => setAttempt((value) => value + 1) };
}
