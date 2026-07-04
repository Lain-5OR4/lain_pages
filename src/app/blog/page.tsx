import { JournalFooter, JournalHeader } from "@/components/blog/JournalChrome";
import { JOURNAL } from "@/components/blog/theme";
import { getAllPosts } from "@/data/blog-posts";
import Link from "next/link";

export default async function BlogIndexPage() {
  const posts = await getAllPosts();

  return (
    <div className="max-w-[64rem] mx-auto px-6 sm:px-10 py-16 md:py-24">
      <JournalHeader command="ls -lh" />

      {/* masthead */}
      <h1
        className="text-5xl md:text-6xl leading-[1.05] tracking-tight font-medium mb-3"
        style={{ fontFamily: JOURNAL.serif }}
      >
        mizora <em style={{ color: JOURNAL.accent, fontWeight: 400 }}>journal</em>
      </h1>
      <p className="text-stone-600 italic text-lg max-w-prose">
        Notes on what I&rsquo;m building and breaking.
      </p>

      <hr className="my-12 border-stone-300" />

      {/* post list */}
      {posts.length === 0 && (
        <p className="text-[0.78rem] text-stone-500" style={{ fontFamily: JOURNAL.mono }}>
          ls: no entries yet. check back soon.
        </p>
      )}
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
                style={{ fontFamily: JOURNAL.serif }}
              >
                {post.title}
              </h2>
              {post.category && (
                <div className="mt-4 text-[0.6rem] tracking-[0.32em] uppercase text-stone-700">
                  {post.category}
                </div>
              )}
            </Link>
          </li>
        ))}
      </ul>

      <JournalFooter backHref="/" backLabel="back to home" />
    </div>
  );
}
