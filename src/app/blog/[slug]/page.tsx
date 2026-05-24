import { CopyButton } from "@/components/blog/CopyButton";
import { getAllPosts, getPostBySlug } from "@/data/blog-posts";
import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import Link from "next/link";
import { notFound } from "next/navigation";

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

const BYLINE = "mizora";

export async function generateStaticParams() {
  const posts = await getAllPosts();
  return posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return {};
  return {
    title: `${post.title} | mizora journal`,
    description: post.subtitle,
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) notFound();

  const firstParagraphIndex = post.blocks.findIndex((b) => b.kind === "paragraph");

  return (
    <div
      className={`${playfair.variable} ${inter.variable} min-h-screen`}
      style={{
        background: "#f7f3ec",
        color: "#1a1714",
        fontFamily: "var(--font-inter), Inter, system-ui, sans-serif",
      }}
    >
      <article className="max-w-[64rem] mx-auto px-6 sm:px-10 py-16 md:py-24">
        {/* prompt + front-matter (cat-ing a .md file) */}
        <header
          className="text-[0.78rem] leading-[1.7] mb-12"
          style={{
            fontFamily: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
            color: "#6b5f4f",
          }}
        >
          <div>
            <Link href="/blog" className="no-underline hover:opacity-80 transition-opacity">
              <span style={{ color: "#8b1f1a" }}>mizora@journal</span>
              <span className="text-stone-400">:</span>
              <span className="text-stone-700">~/posts</span>
              <span className="text-stone-400">$ </span>
              <span className="text-stone-900">cat {post.slug}.md</span>
            </Link>
          </div>
          <div className="mt-2 border-t border-stone-300" />
          <div className="mt-3 space-y-[0.1rem]">
            <div className="text-stone-400">---</div>
            <div>
              <span className="text-stone-500">title:&nbsp;&nbsp;&nbsp;</span>
              <span className="text-stone-900">{post.title}</span>
            </div>
            <div>
              <span className="text-stone-500">author:&nbsp;&nbsp;</span>
              <span className="text-stone-800">{BYLINE}@5OR4.dev</span>
            </div>
            <div>
              <span className="text-stone-500">date:&nbsp;&nbsp;&nbsp;&nbsp;</span>
              <span className="text-stone-800">{post.date}</span>
            </div>
            <div>
              <span className="text-stone-500">tags:&nbsp;&nbsp;&nbsp;&nbsp;</span>
              <span className="text-stone-800">[{post.tags.join(", ")}]</span>
            </div>
            <div>
              <span className="text-stone-500">read:&nbsp;&nbsp;&nbsp;&nbsp;</span>
              <span className="text-stone-800">{post.readingMinutes}m</span>
            </div>
            <div className="text-stone-400">---</div>
          </div>
        </header>

        {/* title block */}
        <h1
          className="text-4xl md:text-5xl leading-[1.15] tracking-tight font-medium"
          style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
        >
          {post.title}
        </h1>
        {post.subtitle && (
          <p
            className="mt-5 text-lg md:text-xl italic text-stone-600 leading-snug"
            style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
          >
            {post.subtitle}
          </p>
        )}

        <hr className="my-10 border-stone-300" />

        {/* body */}
        <div className="space-y-6 text-[1.0625rem] leading-[1.75] text-stone-800">
          {post.blocks.map((block, i) => {
            if (block.kind === "paragraph") {
              const isFirst = i === firstParagraphIndex;
              return (
                <p
                  // biome-ignore lint/suspicious/noArrayIndexKey: blocks have no stable unique key; order is fixed at build time
                  key={i}
                  className={isFirst ? "editorial-dropcap" : ""}
                  // biome-ignore lint/security/noDangerouslySetInnerHtml: inline markdown rendered at build time
                  dangerouslySetInnerHTML={{ __html: block.html }}
                />
              );
            }
            if (block.kind === "heading") {
              if (block.depth === 1) {
                // h1 in body is unusual (page already has the title); render as h2.
                return (
                  <h2
                    // biome-ignore lint/suspicious/noArrayIndexKey: blocks have no stable unique key; order is fixed at build time
                    key={i}
                    className="text-2xl md:text-3xl mt-12 mb-1 leading-tight font-medium"
                    style={{
                      fontFamily: "var(--font-playfair), Georgia, serif",
                    }}
                  >
                    {block.text}
                  </h2>
                );
              }
              if (block.depth === 2) {
                return (
                  <h2
                    // biome-ignore lint/suspicious/noArrayIndexKey: blocks have no stable unique key; order is fixed at build time
                    key={i}
                    className="text-2xl md:text-3xl mt-12 mb-1 leading-tight font-medium"
                    style={{
                      fontFamily: "var(--font-playfair), Georgia, serif",
                    }}
                  >
                    {block.text}
                  </h2>
                );
              }
              return (
                <h3
                  // biome-ignore lint/suspicious/noArrayIndexKey: blocks have no stable unique key; order is fixed at build time
                  key={i}
                  className="text-xl md:text-2xl mt-10 mb-1 leading-tight font-medium"
                  style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
                >
                  {block.text}
                </h3>
              );
            }
            if (block.kind === "list") {
              const Tag = block.ordered ? "ol" : "ul";
              return (
                <Tag
                  // biome-ignore lint/suspicious/noArrayIndexKey: blocks have no stable unique key; order is fixed at build time
                  key={i}
                  className={`space-y-2 pl-6 ${
                    block.ordered ? "list-decimal" : "list-disc"
                  } marker:text-stone-400`}
                >
                  {block.itemsHtml.map((h, j) => (
                    <li
                      // biome-ignore lint/suspicious/noArrayIndexKey: list items have no stable unique key; order is fixed at build time
                      key={j}
                      // biome-ignore lint/security/noDangerouslySetInnerHtml: inline markdown rendered at build time
                      dangerouslySetInnerHTML={{ __html: h }}
                    />
                  ))}
                </Tag>
              );
            }
            if (block.kind === "blockquote") {
              return (
                <blockquote
                  // biome-ignore lint/suspicious/noArrayIndexKey: blocks have no stable unique key; order is fixed at build time
                  key={i}
                  className="my-10 border-y border-stone-400 py-6 text-center"
                >
                  <p
                    className="text-2xl md:text-3xl italic leading-snug text-stone-900"
                    style={{
                      fontFamily: "var(--font-playfair), Georgia, serif",
                    }}
                    // biome-ignore lint/security/noDangerouslySetInnerHtml: inline markdown rendered at build time
                    dangerouslySetInnerHTML={{ __html: `“${block.html}”` }}
                  />
                </blockquote>
              );
            }
            if (block.kind === "hr") {
              // biome-ignore lint/suspicious/noArrayIndexKey: blocks have no stable unique key; order is fixed at build time
              return <hr key={i} className="my-10 border-stone-300" />;
            }
            if (block.kind === "code") {
              return (
                <figure
                  // biome-ignore lint/suspicious/noArrayIndexKey: blocks have no stable unique key; order is fixed at build time
                  key={i}
                  className="my-8 -mx-1 sm:-mx-3"
                >
                  {(block.filename || block.lang !== "text") && (
                    <figcaption className="text-[0.6rem] tracking-[0.32em] uppercase text-stone-500 mb-2 px-1 flex items-center gap-2">
                      {block.filename && <span>{block.filename}</span>}
                      {block.filename && block.lang !== "text" && (
                        <span className="text-stone-400">·</span>
                      )}
                      {block.lang !== "text" && (
                        <span className="text-stone-400">{block.lang}</span>
                      )}
                    </figcaption>
                  )}
                  <div className="group relative">
                    <CopyButton text={block.text} />
                    {block.html ? (
                      <div
                        className="editorial-shiki overflow-x-auto rounded-sm"
                        // biome-ignore lint/security/noDangerouslySetInnerHtml: shiki output is trusted (build time)
                        dangerouslySetInnerHTML={{ __html: block.html }}
                      />
                    ) : (
                      <pre
                        className="overflow-x-auto text-[0.82rem] leading-[1.55] px-4 py-4 rounded-sm"
                        style={{
                          background: "#2a3038",
                          color: "#e6edf3",
                          borderLeft: "3px solid #8b1f1a",
                          paddingRight: "4.5rem",
                          fontFamily: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
                        }}
                      >
                        <code>{block.text}</code>
                      </pre>
                    )}
                  </div>
                </figure>
              );
            }
            if (block.kind === "raw") {
              return (
                <div
                  // biome-ignore lint/suspicious/noArrayIndexKey: blocks have no stable unique key; order is fixed at build time
                  key={i}
                  className="editorial-raw"
                  // biome-ignore lint/security/noDangerouslySetInnerHtml: marked output, trusted markdown
                  dangerouslySetInnerHTML={{ __html: block.html }}
                />
              );
            }
            return null;
          })}
        </div>

        {/* tags */}
        <div className="mt-16 pt-6 border-t border-stone-300 flex items-center gap-2 text-[0.6rem] tracking-[0.32em] uppercase text-stone-500">
          <span>Tags</span>
          <span className="text-stone-400">·</span>
          {post.tags.map((t, i) => (
            <span key={t} className="flex items-center gap-2">
              <span className="text-stone-800">{t}</span>
              {i < post.tags.length - 1 && <span className="text-stone-400">·</span>}
            </span>
          ))}
        </div>

        {/* footer */}
        <footer className="mt-12 text-[0.6rem] tracking-[0.32em] uppercase text-stone-500 flex justify-between">
          <Link href="/blog" className="hover:text-stone-900 transition-colors">
            ← back to index
          </Link>
          <span>© 2026 mizora.dev</span>
        </footer>
      </article>

      <style>{`
        .editorial-dropcap::first-letter {
          font-family: var(--font-playfair), Georgia, serif;
          font-style: italic;
          font-weight: 500;
          font-size: 4.4rem;
          float: left;
          line-height: 0.9;
          padding: 0.25rem 0.5rem 0 0;
          color: #8b1f1a;
        }
        .editorial-shiki {
          border-radius: 4px;
          overflow: hidden;
          box-shadow: 0 1px 0 rgba(0, 0, 0, 0.08), 0 8px 24px -12px rgba(0, 0, 0, 0.18);
        }
        .editorial-shiki pre {
          background-color: #2a3038 !important;
          border-left: 3px solid #8b1f1a;
          padding: 1.1rem 1.2rem;
          padding-right: 4.5rem;
          font-size: 0.82rem;
          line-height: 1.65;
          font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
          margin: 0;
          tab-size: 2;
        }
        .editorial-shiki code {
          font-family: inherit;
        }
      `}</style>
    </div>
  );
}
