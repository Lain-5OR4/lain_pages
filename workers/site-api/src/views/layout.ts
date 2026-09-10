import { html, raw } from "hono/html";
import { PAGE_STYLES } from "./styles";

export const layout = (opts: {
  title: string;
  description?: string;
  ogImage?: string;
  ogUrl?: string;
  noStore?: boolean;
  section?: string;
  issue?: string;
  body: ReturnType<typeof html>;
}) => {
  const now = new Date();
  const year = now.getFullYear();
  const dateStamp = `${year}.${String(now.getMonth() + 1).padStart(2, "0")}.${String(now.getDate()).padStart(2, "0")}`;
  return html`<!doctype html>
		<html lang="ja">
			<head>
				<meta charset="UTF-8" />
				<meta name="viewport" content="width=device-width, initial-scale=1.0" />
				<title>${opts.title}</title>
				${opts.description ? html`<meta name="description" content="${opts.description}" />` : ""}
				<meta property="og:title" content="${opts.title}" />
				${
          opts.description
            ? html`<meta
							property="og:description"
							content="${opts.description}"
						/>`
            : ""
        }
				${opts.ogImage ? html`<meta property="og:image" content="${opts.ogImage}" />` : ""}
				${opts.ogUrl ? html`<meta property="og:url" content="${opts.ogUrl}" />` : ""}
				<meta
					property="og:type"
					content="${opts.ogImage ? "article" : "website"}"
				/>
				<meta name="twitter:card" content="summary_large_image" />
				${opts.noStore ? html`<meta name="robots" content="noindex" />` : ""}
				<link rel="preconnect" href="https://fonts.googleapis.com" />
				<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
				<link
					href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,500;1,400;1,500&family=Inter:wght@400;500&display=swap"
					rel="stylesheet"
				/>
				<style>
					${raw(PAGE_STYLES)}
				</style>
			</head>
			<body>
				<div class="page">
					<header class="masthead">
						<h1>
							<a href="/">PHOTO <em>diary</em></a>
						</h1>
						<div class="meta">
							<b>${opts.issue ?? `Vol. ${year}`}</b><br />
							${opts.section ?? "Archive"}
						</div>
					</header>
					<div class="tagline">
						<span>個人写真日記 — by mizora</span>
						<span>${dateStamp}</span>
					</div>
					${opts.body}
					<footer>
						<span
							><a href="/api/posts">JSON</a><span class="sep">·</span
							><a href="/admin">Admin</a><span class="sep">·</span
							><a href="/admin/books">Books</a></span
						>
						<span>© ${year} mizora.dev</span>
					</footer>
				</div>
			</body>
		</html>`;
};
