import { type Highlighter, createHighlighter } from "shiki";

export const EDITORIAL_THEME = "github-dark-dimmed";
export const TERMINAL_THEME = "github-dark";

// Cache on globalThis so dev HMR doesn't spawn a new highlighter per reload.
const cache = globalThis as unknown as {
  __shikiHighlighter?: Promise<Highlighter>;
};

export function getHighlighter(): Promise<Highlighter> {
  if (!cache.__shikiHighlighter) {
    cache.__shikiHighlighter = createHighlighter({
      themes: [EDITORIAL_THEME],
      langs: ["ts", "tsx", "js", "json", "bash", "md"],
    });
  }
  return cache.__shikiHighlighter;
}

export async function highlight(code: string, lang: string, theme: string): Promise<string> {
  const hl = await getHighlighter();
  const safeLang = hl.getLoadedLanguages().includes(lang as never) ? lang : "ts";
  return hl.codeToHtml(code, { lang: safeLang, theme });
}
