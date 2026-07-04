import { JournalFooter, JournalHeader } from "@/components/blog/JournalChrome";
import { JOURNAL } from "@/components/blog/theme";
import { PLACEHOLDER_SLUG, getAllPosts, getPostBySlug, placeholderPost } from "@/data/blog-posts";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

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
  return { title: post.title };
}

function FrontMatterRow({
  label,
  value,
  strong = false,
}: {
  label: string;
  value: string;
  strong?: boolean;
}) {
  // Pad with no-break spaces (regular spaces collapse in HTML) so values
  // line up in a column, mimicking YAML front-matter in a terminal.
  const pad = " ".repeat(Math.max(9 - label.length, 1));
  return (
    <div>
      <span className="text-stone-500">
        {label}
        {pad}
      </span>
      <span className={strong ? "text-stone-900" : "text-stone-800"}>{value}</span>
    </div>
  );
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
    <article className="max-w-[64rem] mx-auto px-6 sm:px-10 py-16 md:py-24">
      <JournalHeader command={`cat ${post.slug}.md`} href="/blog">
        <div className="mt-3 space-y-[0.1rem]">
          <div className="text-stone-400">---</div>
          <FrontMatterRow label="title:" value={post.title} strong />
          <FrontMatterRow label="author:" value={`${BYLINE}@mizora.dev`} />
          <FrontMatterRow label="date:" value={post.date} />
          {post.category && <FrontMatterRow label="category:" value={post.category} />}
          <FrontMatterRow label="read:" value={`${post.readingMinutes}m`} />
          <div className="text-stone-400">---</div>
        </div>
      </JournalHeader>

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
        style={{ fontFamily: JOURNAL.serif }}
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

      <JournalFooter backHref="/blog" backLabel="back to index" />

      <style>{`
        .rich-content {
          font-size: 1.0625rem;
          line-height: 1.75;
          color: ${JOURNAL.body};
        }
        .rich-content p { margin: 0 0 1.5rem; }
        .rich-content p:first-of-type::first-letter {
          font-family: ${JOURNAL.serif};
          font-style: italic;
          font-weight: 500;
          font-size: 4.4rem;
          float: left;
          line-height: 0.9;
          padding: 0.25rem 0.5rem 0 0;
          color: ${JOURNAL.accent};
        }
        .rich-content h1,
        .rich-content h2 {
          font-family: ${JOURNAL.serif};
          font-size: 1.75rem;
          font-weight: 500;
          line-height: 1.25;
          margin: 3rem 0 0.5rem;
          color: ${JOURNAL.ink};
        }
        .rich-content h3 {
          font-family: ${JOURNAL.serif};
          font-size: 1.35rem;
          font-weight: 500;
          margin: 2.5rem 0 0.5rem;
          color: ${JOURNAL.ink};
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
          font-family: ${JOURNAL.serif};
          font-size: 1.4rem;
          font-style: italic;
          line-height: 1.4;
          color: ${JOURNAL.ink};
        }
        .rich-content pre,
        .rich-content code {
          font-family: ${JOURNAL.mono};
          font-size: 0.82rem;
        }
        .rich-content pre {
          background: #2a3038;
          color: #e6edf3;
          border-left: 3px solid ${JOURNAL.accent};
          padding: 1.1rem 1.2rem;
          border-radius: 4px;
          overflow-x: auto;
          margin: 0 0 1.5rem;
        }
        .rich-content code {
          background: #ede8e0;
          padding: 0.1em 0.35em;
          border-radius: 3px;
          color: ${JOURNAL.accent};
        }
        .rich-content pre code {
          background: none;
          padding: 0;
          color: inherit;
        }
        .rich-content a {
          color: ${JOURNAL.accent};
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
    </article>
  );
}
