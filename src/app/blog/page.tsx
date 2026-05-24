import { getAllPosts } from "@/data/blog-posts";
import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import Link from "next/link";

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

export const metadata: Metadata = {
  title: "mizora journal",
  description: "Notes on what I'm building and breaking.",
};

export default async function BlogIndexPage() {
  const posts = await getAllPosts();

  return (
    <div
      className={`${playfair.variable} ${inter.variable} min-h-screen`}
      style={{
        background: "#f7f3ec",
        color: "#1a1714",
        fontFamily: "var(--font-inter), Inter, system-ui, sans-serif",
      }}
    >
      <div className="max-w-[64rem] mx-auto px-6 sm:px-10 py-16 md:py-24">
        {/* prompt header */}
        <header
          className="text-[0.78rem] leading-[1.7] mb-12"
          style={{
            fontFamily: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
            color: "#6b5f4f",
          }}
        >
          <div>
            <span style={{ color: "#8b1f1a" }}>mizora@journal</span>
            <span className="text-stone-400">:</span>
            <span className="text-stone-700">~/posts</span>
            <span className="text-stone-400">$ </span>
            <span className="text-stone-900">ls -lh</span>
          </div>
          <div className="mt-2 border-t border-stone-300" />
        </header>

        {/* masthead */}
        <h1
          className="text-5xl md:text-6xl leading-[1.05] tracking-tight font-medium mb-3"
          style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
        >
          mizora <em style={{ color: "#8b1f1a", fontWeight: 400 }}>journal</em>
        </h1>
        <p className="text-stone-600 italic text-lg max-w-prose">
          Notes on what I&rsquo;m building and breaking.
        </p>

        <hr className="my-12 border-stone-300" />

        {/* post list */}
        <ul className="divide-y divide-stone-300">
          {posts.map((post) => (
            <li key={post.slug} className="py-8">
              <Link href={`/blog/${post.slug}`} className="block group">
                <div className="flex items-baseline gap-4 text-[0.65rem] tracking-[0.3em] uppercase text-stone-500 mb-3 font-variant-numeric tabular-nums">
                  <span>{post.date}</span>
                  <span className="text-stone-400">·</span>
                  <span>{post.readingMinutes} min read</span>
                </div>
                <h2
                  className="text-2xl md:text-3xl leading-tight font-medium group-hover:underline decoration-stone-400 underline-offset-4"
                  style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
                >
                  {post.title}
                </h2>
                {post.subtitle && (
                  <p className="mt-3 text-stone-600 italic leading-snug">{post.subtitle}</p>
                )}
                <div className="mt-4 flex items-center gap-2 text-[0.6rem] tracking-[0.32em] uppercase text-stone-500">
                  {post.tags.map((t, i) => (
                    <span key={t} className="flex items-center gap-2">
                      <span className="text-stone-700">{t}</span>
                      {i < post.tags.length - 1 && <span className="text-stone-400">·</span>}
                    </span>
                  ))}
                </div>
              </Link>
            </li>
          ))}
        </ul>

        {/* footer */}
        <footer className="mt-16 pt-6 border-t border-stone-300 text-[0.6rem] tracking-[0.32em] uppercase text-stone-500 flex justify-between">
          <Link href="/" className="hover:text-stone-900 transition-colors">
            ← back to home
          </Link>
          <span>© 2026 mizora.dev</span>
        </footer>
      </div>
    </div>
  );
}
