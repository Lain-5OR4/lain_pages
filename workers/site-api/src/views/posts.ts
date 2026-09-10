import { html } from "hono/html";
import type { PostWithImages } from "../data/posts";

export const renderPost = (p: PostWithImages) =>
  html`<article class="post">
		<header>
			<time>${p.posted_on}</time>
			<a href="/post/${p.id}">#${p.id}</a>
		</header>
		${p.title ? html`<h2>${p.title}</h2>` : ""}
		${
      p.images.length > 0
        ? html`<div class="carousel">
					${p.images.map(
            (img, i) =>
              html`<img
								src="/images/${img.key}"
								alt="${p.title || p.caption} (${i + 1}/${p.images.length})"
								loading="lazy"
							/>`,
          )}
				</div>`
        : ""
    }
		${p.caption ? html`<p class="caption">${p.caption}</p>` : ""}
	</article>`;
