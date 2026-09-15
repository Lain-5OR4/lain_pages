import { html, raw } from "hono/html";
import type { PostWithImages } from "../data/posts";
import { layout } from "./layout";
import { UPLOAD_SCRIPT } from "./upload-script";

export const renderAdminPosts = (
  posts: PostWithImages[],
  pendingDeletions: number[] = [],
  pendingUploads: { id: number; title: string; created_at: string }[] = [],
) => {
  const total = posts.length;
  return layout({
    title: "admin — photo-diary",
    noStore: true,
    section: "Editorial Desk",
    issue: `${total} ${total === 1 ? "Entry" : "Entries"}`,
    body: html`
				<a class="new-entry-cta" href="/admin/new">+ New Entry</a>
        ${
          pendingUploads.length > 0
            ? html`<section aria-label="Pending uploads">
          <h2>保存中・未完了の投稿</h2>
          <p>これらの投稿はまだ公開されていません。送信元の画面で保存が終了・中断していることを確認してから削除してください。</p>
          <ul>${pendingUploads.map(
            (post) => html`<li>
            <span>#${post.id} ${post.title || "(untitled)"} / ${post.created_at}</span>
            <form method="POST" action="/admin/posts/${post.id}/delete"
              onsubmit="return confirm('アップロードが終了・中断していることを確認しましたか？')">
              <button type="submit">未完了の投稿を削除</button>
            </form>
          </li>`,
          )}</ul>
        </section>`
            : null
        }
        ${
          pendingDeletions.length > 0
            ? html`<section aria-label="Pending deletions">
          <h2>写真の削除が完了していない投稿</h2>
          <p>削除した投稿や保存に失敗した投稿の写真が残っています。削除を再試行してください。</p>
          <ul>${pendingDeletions.map(
            (id) => html`<li>
            <form method="POST" action="/admin/posts/${id}/delete">
              <span>投稿 #${id}</span> <button type="submit">削除を再試行</button>
            </form>
          </li>`,
          )}</ul>
        </section>`
            : null
        }
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

export const renderDeleteFailure = (id: number) =>
  layout({
    title: "削除を再試行",
    noStore: true,
    body: html`<h1>削除を完了できませんでした</h1>
    <p>しばらくしてから、もう一度お試しください。</p>
    <form method="POST" action="/admin/posts/${id}/delete"><button type="submit">削除を再試行</button></form>
    <p><a href="/admin">管理画面に戻る</a></p>`,
  });

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
