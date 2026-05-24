// Markdown → typed block array.
//
// We don't dangerouslySetInnerHTML the whole article — instead we lex
// markdown into a typed block array and let each block render with its own
// React component (drop cap on first paragraph, our styled blockquote, our
// figure+CopyButton wrapper for code, etc).
//
// Code blocks are pre-highlighted with shiki at build time. Zenn-flavored
// info strings (```lang:filename) are recognised.

import { type Tokens, marked } from "marked";
import { EDITORIAL_THEME, highlight } from "./shiki";

export type MarkdownBlock =
  | { kind: "paragraph"; html: string }
  | { kind: "heading"; depth: number; text: string }
  | {
      kind: "code";
      lang: string;
      filename?: string;
      text: string;
      html: string; // shiki-rendered HTML; falls back to "" when lang missing
    }
  | { kind: "list"; ordered: boolean; itemsHtml: string[] }
  | { kind: "blockquote"; html: string }
  | { kind: "hr" }
  | { kind: "raw"; html: string };

function inline(src: string): string {
  // marked.parseInline is sync by default.
  return marked.parseInline(src) as string;
}

export async function parseMarkdownToBlocks(md: string): Promise<MarkdownBlock[]> {
  const tokens = marked.lexer(md);
  const blocks: MarkdownBlock[] = [];

  for (const t of tokens) {
    switch (t.type) {
      case "paragraph": {
        const para = t as Tokens.Paragraph;
        blocks.push({ kind: "paragraph", html: inline(para.text) });
        break;
      }
      case "heading": {
        const h = t as Tokens.Heading;
        blocks.push({ kind: "heading", depth: h.depth, text: h.text });
        break;
      }
      case "code": {
        const c = t as Tokens.Code;
        const langMeta = c.lang ?? "";
        const [lang, filename] = langMeta.split(":");
        const text = c.text;
        const html = lang && lang.length > 0 ? await highlight(text, lang, EDITORIAL_THEME) : "";
        blocks.push({
          kind: "code",
          lang: lang || "text",
          filename: filename || undefined,
          text,
          html,
        });
        break;
      }
      case "list": {
        const l = t as Tokens.List;
        const itemsHtml = l.items.map((it) => inline(it.text));
        blocks.push({
          kind: "list",
          ordered: Boolean(l.ordered),
          itemsHtml,
        });
        break;
      }
      case "blockquote": {
        const bq = t as Tokens.Blockquote;
        // bq.text already strips the leading "> " markers.
        blocks.push({ kind: "blockquote", html: inline(bq.text) });
        break;
      }
      case "hr":
        blocks.push({ kind: "hr" });
        break;
      case "space":
        break;
      default: {
        // Tables and other less-common constructs fall through here.
        // marked.parser accepts a token array; wrap the unknown token and
        // emit its HTML verbatim.
        const html = marked.parser([t as Tokens.Generic]);
        if (html.trim()) blocks.push({ kind: "raw", html });
      }
    }
  }

  return blocks;
}

export function estimateReadingMinutes(md: string): number {
  // Mixed Japanese/English; ~600 visible chars/min is a reasonable rough rate.
  const chars = md.replace(/\s+/g, "").length;
  return Math.max(1, Math.round(chars / 600));
}
