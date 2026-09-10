import { html, raw } from "hono/html";
import type { PostWithImages } from "../data/posts";
import { layout } from "./layout";
import { UPLOAD_SCRIPT } from "./upload-script";

export const renderAdminPosts = (posts: PostWithImages[]) => {
  const total = posts.length;
  return layout({
    title: "admin — photo-diary",
    noStore: true,
    section: "Editorial Desk",
    issue: `${total} ${total === 1 ? "Entry" : "Entries"}`,
    body: html`
				<a class="new-entry-cta" href="/admin/new">+ New Entry</a>
				${
          posts.length === 0
            ? html`<p class="empty">No entries yet — start with a new one.</p>`
            : html`<ul class="entries">
							${posts.map(
                (p, i) =>
                  html`<li>
										<span class="num"
											>${String(total - i).padStart(2, "0")}</span
										>
										<span class="date">${p.posted_on}</span>
										<span class="title"
											><a href="/post/${p.id}"
												>${p.title || p.caption || "(untitled)"}</a
											></span
										>
										<span class="count"
											>${p.images.length}
											${p.images.length === 1 ? "photo" : "photos"}</span
										>
										<span class="del">
											<form
												method="POST"
												action="/admin/posts/${p.id}/delete"
												onsubmit="return confirm('Delete #${p.id}?')"
											>
												<button type="submit">Delete</button>
											</form>
										</span>
									</li>`,
              )}
						</ul>`
        }
			`,
  });
};

export const renderNewPost = (today: string) => {
  return layout({
    title: "new entry — photo-diary",
    noStore: true,
    section: "New Entry",
    issue: "Draft",
    body: html`
				<p class="back"><a href="/admin">← Editorial Desk</a></p>
				<form
					id="new-post-form"
					action="/admin/posts"
					method="POST"
					enctype="multipart/form-data"
				>
					<div class="field">
						<span class="field-num">01</span>
						<div class="field-body">
							<label>Title</label>
							<input type="text" name="title" autocomplete="off" />
						</div>
					</div>

					<div class="field">
						<span class="field-num">02</span>
						<div class="field-body">
							<label
								>Images
								<span style="color:var(--ink); margin-left:0.5em"
									>(<span id="count">0</span>)</span
								></label
							>
							<div id="thumbs" class="thumbs" style="display:none"></div>
							<div id="dropzone" class="dropzone" tabindex="0">
								drop files here / click to select
							</div>
							<input
								id="file-input"
								type="file"
								name="images"
								accept="image/*"
								multiple
								style="display:none"
							/>
						</div>
					</div>

					<div class="field">
						<span class="field-num">03</span>
						<div class="field-body">
							<label>Date Posted</label>
							<input type="date" name="posted_on" value="${today}" required />
						</div>
					</div>

					<div class="field">
						<span class="field-num">04</span>
						<div class="field-body">
							<label>Caption</label>
							<textarea name="caption" placeholder="(optional)"></textarea>
						</div>
					</div>

					<div class="submit-row">
						<div class="progress"><span id="progress-bar"></span></div>
						<button type="submit">Publish</button>
					</div>
					<div id="upload-status"></div>
				</form>
				<script type="module">
					${raw(UPLOAD_SCRIPT)};
				</script>
			`,
  });
};
