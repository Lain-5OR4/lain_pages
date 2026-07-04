import { PLACEHOLDER_SLUG, getAllPosts, getPostBySlug, placeholderPost } from "@/data/blog-posts";
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
  if (posts.length === 0) return [{ slug: PLACEHOLDER_SLUG }];
  return posts.map((p) => ({ slug: p.slug }));
}

async function resolvePost(slug: string) {
  const post = await getPostBySlug(slug);
  if (post) return post;
  if (slug === PLACEHOLDER_SLUG) return placeholderPost();
  return undefined;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await resolvePost(slug);
  if (!post) return {};
  return {
    title: `${post.title} | mizora journal`,
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await resolvePost(slug);
  if (!post) notFound();

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
        {/* prompt + front-matter */}
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
              <span className="text-stone-800">{BYLINE}@mizora.dev</span>
            </div>
            <div>
              <span className="text-stone-500">date:&nbsp;&nbsp;&nbsp;&nbsp;</span>
              <span className="text-stone-800">{post.date}</span>
            </div>
            {post.category && (
              <div>
                <span className="text-stone-500">category:&nbsp;</span>
                <span className="text-stone-800">{post.category}</span>
              </div>
            )}
            <div>
              <span className="text-stone-500">read:&nbsp;&nbsp;&nbsp;&nbsp;</span>
              <span className="text-stone-800">{post.readingMinutes}m</span>
            </div>
            <div className="text-stone-400">---</div>
          </div>
        </header>

        {/* eyecatch */}
        {post.eyecatch && (
          <div className="mb-10 -mx-1 sm:-mx-3 overflow-hidden rounded-sm">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={post.eyecatch.url}
              alt={post.title}
              width={post.eyecatch.width}
              height={post.eyecatch.height}
              className="w-full object-cover"
              style={{ maxHeight: "28rem" }}
            />
          </div>
        )}

        {/* title */}
        <h1
          className="text-4xl md:text-5xl leading-[1.15] tracking-tight font-medium mb-10"
          style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
        >
          {post.title}
        </h1>

        <hr className="my-10 border-stone-300" />

        {/* body — rich editor HTML */}
        <div
          className="rich-content"
          // biome-ignore lint/security/noDangerouslySetInnerHtml: trusted microCMS rich editor output
          dangerouslySetInnerHTML={{ __html: post.contentHtml }}
        />

        {/* footer */}
        <footer className="mt-16 pt-6 border-t border-stone-300 text-[0.6rem] tracking-[0.32em] uppercase text-stone-500 flex justify-between">
          <Link href="/blog" className="hover:text-stone-900 transition-colors">
            ← back to index
          </Link>
          <span>© 2026 mizora.dev</span>
        </footer>
      </article>

      <style>{`
        .rich-content {
          font-size: 1.0625rem;
          line-height: 1.75;
          color: #3a3330;
        }
        .rich-content p { margin: 0 0 1.5rem; }
        .rich-content p:first-of-type::first-letter {
          font-family: var(--font-playfair), Georgia, serif;
          font-style: italic;
          font-weight: 500;
          font-size: 4.4rem;
          float: left;
          line-height: 0.9;
          padding: 0.25rem 0.5rem 0 0;
          color: #8b1f1a;
        }
        .rich-content h1,
        .rich-content h2 {
          font-family: var(--font-playfair), Georgia, serif;
          font-size: 1.75rem;
          font-weight: 500;
          line-height: 1.25;
          margin: 3rem 0 0.5rem;
          color: #1a1714;
        }
        .rich-content h3 {
          font-family: var(--font-playfair), Georgia, serif;
          font-size: 1.35rem;
          font-weight: 500;
          margin: 2.5rem 0 0.5rem;
          color: #1a1714;
        }
        .rich-content ul,
        .rich-content ol {
          padding-left: 1.5rem;
          margin: 0 0 1.5rem;
        }
        .rich-content ul { list-style: disc; }
        .rich-content ol { list-style: decimal; }
        .rich-content li { margin-bottom: 0.4rem; }
        .rich-content li::marker { color: #9d8878; }
        .rich-content blockquote {
          border-top: 1px solid #b8a898;
          border-bottom: 1px solid #b8a898;
          padding: 1.5rem 0;
          margin: 2.5rem 0;
          text-align: center;
          font-family: var(--font-playfair), Georgia, serif;
          font-size: 1.4rem;
          font-style: italic;
          line-height: 1.4;
          color: #1a1714;
        }
        .rich-content pre,
        .rich-content code {
          font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
          font-size: 0.82rem;
        }
        .rich-content pre {
          background: #2a3038;
          color: #e6edf3;
          border-left: 3px solid #8b1f1a;
          padding: 1.1rem 1.2rem;
          border-radius: 4px;
          overflow-x: auto;
          margin: 0 0 1.5rem;
        }
        .rich-content code {
          background: #ede8e0;
          padding: 0.1em 0.35em;
          border-radius: 3px;
          color: #8b1f1a;
        }
        .rich-content pre code {
          background: none;
          padding: 0;
          color: inherit;
        }
        .rich-content a {
          color: #8b1f1a;
          text-decoration: underline;
          text-underline-offset: 3px;
        }
        .rich-content img {
          max-width: 100%;
          border-radius: 4px;
          margin: 1.5rem 0;
        }
        .rich-content hr {
          border: none;
          border-top: 1px solid #d6cfc6;
          margin: 2.5rem 0;
        }
      `}</style>
    </div>
  );
}
