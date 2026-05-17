import { Hono } from "hono";
import { html, raw } from "hono/html";

type Post = {
	id: number;
	title: string;
	caption: string;
	posted_on: string;
	created_at: string;
};
type ImageRow = {
	post_id: number;
	r2_key: string;
	sort_order: number;
	taken_at: string | null;
};
type PostImage = { key: string; taken_at: string | null };
type PostWithImages = Post & { images: PostImage[] };

type DiaryEntry = {
	id: string;
	date: string;
	title: string;
	description: string;
	photos: Array<{ src: string; alt: string; stamp?: string }>;
};

const app = new Hono<{ Bindings: Env }>();

const ALLOWED_ORIGINS = new Set([
	"https://mizora.dev",
	"http://localhost:3000",
]);

app.use("/api/*", async (c, next) => {
	const origin = c.req.header("Origin") ?? "";
	await next();
	if (ALLOWED_ORIGINS.has(origin)) {
		c.header("Access-Control-Allow-Origin", origin);
		c.header("Vary", "Origin");
	}
});
app.options("/api/*", () => new Response(null, { status: 204 }));

const mergeImages = (posts: Post[], images: ImageRow[]): PostWithImages[] => {
	const byPost = new Map<number, PostImage[]>();
	for (const r of images) {
		const entry: PostImage = { key: r.r2_key, taken_at: r.taken_at };
		const arr = byPost.get(r.post_id);
		if (arr) arr.push(entry);
		else byPost.set(r.post_id, [entry]);
	}
	return posts.map((p) => ({ ...p, images: byPost.get(p.id) ?? [] }));
};

const getRecentPosts = async (
	db: D1Database,
	limit = 50,
): Promise<PostWithImages[]> => {
	const [posts, images] = await Promise.all([
		db
			.prepare(
				"SELECT id, title, caption, posted_on, created_at FROM posts ORDER BY posted_on DESC, id DESC LIMIT ?",
			)
			.bind(limit)
			.all<Post>(),
		db
			.prepare(
				"SELECT post_id, r2_key, sort_order, taken_at FROM post_images ORDER BY post_id, sort_order",
			)
			.all<ImageRow>(),
	]);
	return mergeImages(posts.results, images.results);
};

const getPost = async (
	db: D1Database,
	id: number,
): Promise<PostWithImages | null> => {
	const post = await db
		.prepare(
			"SELECT id, title, caption, posted_on, created_at FROM posts WHERE id = ?",
		)
		.bind(id)
		.first<Post>();
	if (!post) return null;
	const imgs = await db
		.prepare(
			"SELECT post_id, r2_key, sort_order, taken_at FROM post_images WHERE post_id = ? ORDER BY sort_order",
		)
		.bind(id)
		.all<ImageRow>();
	return {
		...post,
		images: imgs.results.map((r) => ({ key: r.r2_key, taken_at: r.taken_at })),
	};
};

const deletePost = async (env: Env, id: number): Promise<boolean> => {
	const { results } = await env.DB.prepare(
		"SELECT r2_key FROM post_images WHERE post_id = ?",
	)
		.bind(id)
		.all<{ r2_key: string }>();
	const post = await env.DB.prepare("SELECT id FROM posts WHERE id = ?")
		.bind(id)
		.first<{ id: number }>();
	if (!post) return false;
	if (results.length > 0) {
		await env.BUCKET.delete(results.map((r) => r.r2_key));
	}
	await env.DB.batch([
		env.DB.prepare("DELETE FROM post_images WHERE post_id = ?").bind(id),
		env.DB.prepare("DELETE FROM posts WHERE id = ?").bind(id),
	]);
	return true;
};

const safeExt = (name: string, fallback = "jpg"): string => {
	const m = /\.([a-zA-Z0-9]{1,5})$/.exec(name);
	const ext = m ? m[1].toLowerCase() : fallback;
	const allowed = new Set(["jpg", "jpeg", "png", "webp", "gif", "avif"]);
	return allowed.has(ext) ? ext : fallback;
};

// Workers run in UTC. EXIF DateTimeOriginal is the camera's local time without a
// timezone, so new uploads store a naive "YYYY-MM-DDTHH:MM:SS" we render byte-for-byte.
// Timestamps that carry a UTC marker (Z / offset) — including SQLite CURRENT_TIMESTAMP
// after we normalise it — get shifted to JST so the diary stays in the user's clock.
const JST_OFFSET_MS = 9 * 60 * 60 * 1000;

const formatStamp = (s: string | null | undefined): string => {
	if (!s) return "";
	const naive = /^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})(?::\d{2}(?:\.\d+)?)?$/.exec(s);
	if (naive) {
		return `'${naive[1].slice(2)} ${naive[2]} ${naive[3]} ${naive[4]}:${naive[5]}`;
	}
	const d = new Date(s);
	if (Number.isNaN(d.getTime())) return "";
	const jst = new Date(d.getTime() + JST_OFFSET_MS);
	const p = (n: number) => String(n).padStart(2, "0");
	return `'${p(jst.getUTCFullYear() % 100)} ${p(jst.getUTCMonth() + 1)} ${p(jst.getUTCDate())} ${p(jst.getUTCHours())}:${p(jst.getUTCMinutes())}`;
};

const PAGE_STYLES = `
:root {
	--ink: #1a1714;
	--paper: #f7f3ec;
	--paper-2: #ede6d6;
	--rule: rgba(26, 23, 20, 0.18);
	--muted: #6b6259;
	--accent: #8b1f1a;
	color-scheme: light;
}
* { box-sizing: border-box; }
html, body { background: var(--paper); }
body {
	color: var(--ink);
	font-family: "Inter", system-ui, -apple-system, "Hiragino Kaku Gothic ProN", "Yu Gothic", sans-serif;
	font-size: 15px;
	line-height: 1.65;
	margin: 0;
	padding: 0;
	-webkit-font-smoothing: antialiased;
}
.page { max-width: 48rem; margin: 0 auto; padding: 3rem 2rem 5rem; }

/* masthead */
.masthead {
	display: grid; grid-template-columns: 1fr auto; align-items: end;
	padding-bottom: 1.25rem; border-bottom: 2px solid var(--ink); margin-bottom: 0.6rem;
}
.masthead h1 {
	font-family: "Playfair Display", "Cormorant Garamond", Georgia, serif;
	font-weight: 500; font-size: 2.6rem; letter-spacing: -0.015em; margin: 0; line-height: 0.95;
}
.masthead h1 em { font-style: italic; font-weight: 400; color: var(--accent); }
.masthead h1 a { color: inherit; text-decoration: none; }
.masthead .meta {
	font-size: 0.65rem; letter-spacing: 0.32em; text-transform: uppercase;
	color: var(--muted); text-align: right; line-height: 1.4;
}
.masthead .meta b { color: var(--ink); font-weight: 500; }
.tagline {
	display: flex; justify-content: space-between; align-items: baseline;
	font-size: 0.62rem; letter-spacing: 0.32em; text-transform: uppercase; color: var(--muted);
	border-bottom: 1px solid var(--rule); padding-bottom: 0.75rem; margin-bottom: 2.5rem;
	font-variant-numeric: tabular-nums;
}

/* back link */
.back { font-size: 0.7rem; letter-spacing: 0.25em; text-transform: uppercase; color: var(--muted); margin: 0 0 2rem; }
.back a { color: inherit; text-decoration: none; border-bottom: 1px solid var(--rule); padding-bottom: 2px; }
.back a:hover { color: var(--ink); border-color: var(--ink); }

/* numbered field */
.field {
	display: grid; grid-template-columns: 2.5rem 1fr; gap: 1.5rem; align-items: baseline;
	padding: 1.5rem 0; border-bottom: 1px solid var(--rule);
}
.field-num {
	font-family: "Playfair Display", Georgia, serif; font-size: 1.5rem; font-style: italic;
	color: var(--accent); line-height: 1;
}
.field-body { min-width: 0; }
.field-body label {
	display: block; font-size: 0.62rem; letter-spacing: 0.32em;
	text-transform: uppercase; color: var(--muted); margin-bottom: 0.6rem;
}

/* inputs */
input[type=text], input[type=date] {
	font-family: inherit; font-size: 1.05rem; color: var(--ink);
	border: none; border-bottom: 1px solid var(--ink); background: transparent;
	padding: 0.3rem 0; width: 100%; outline: none; border-radius: 0;
}
input[type=text]:focus, input[type=date]:focus { border-color: var(--accent); }
textarea {
	font-family: inherit; font-size: 1rem; color: var(--ink);
	border: 1px solid var(--ink); background: transparent;
	padding: 0.7rem 0.85rem; width: 100%; min-height: 5em; resize: vertical;
	outline: none; line-height: 1.55;
}
textarea:focus { border-color: var(--accent); }

/* dropzone + thumbs */
.thumbs {
	display: grid; grid-template-columns: repeat(auto-fill, minmax(7rem, 1fr));
	gap: 0.6rem; margin-bottom: 0.75rem;
}
.thumb {
	position: relative; aspect-ratio: 1 / 1; background: var(--paper-2);
	border: 1px solid var(--rule); overflow: hidden;
}
.thumb img { width: 100%; height: 100%; object-fit: cover; display: block; }
.thumb .idx {
	position: absolute; top: 0; left: 0; background: var(--ink); color: var(--paper);
	font-size: 0.6rem; padding: 2px 5px; letter-spacing: 0.12em;
	font-variant-numeric: tabular-nums; font-family: ui-monospace, monospace;
}
.thumb .rm {
	position: absolute; top: 4px; right: 4px;
	width: 1.3rem; height: 1.3rem; border-radius: 50%;
	display: flex; align-items: center; justify-content: center;
	background: var(--paper); border: 1px solid var(--ink); color: var(--ink);
	font-size: 0.85rem; line-height: 1; cursor: pointer; padding: 0; user-select: none;
}
.thumb .rm:hover { background: var(--accent); border-color: var(--accent); color: var(--paper); }
.thumb .exif {
	position: absolute; bottom: 4px; left: 4px;
	font-size: 0.55rem; color: var(--paper); background: rgba(0,0,0,0.6);
	padding: 2px 5px; font-family: ui-monospace, monospace; letter-spacing: 0.05em;
}
.dropzone {
	display: block; border: 1px dashed var(--ink); padding: 1.5rem 1rem;
	text-align: center; cursor: pointer; font-size: 0.7rem;
	letter-spacing: 0.3em; text-transform: uppercase; color: var(--muted);
	transition: background 0.15s, color 0.15s; user-select: none;
}
.dropzone:hover, .dropzone.over { background: var(--ink); color: var(--paper); }

/* date split */
.date-display {
	font-family: "Playfair Display", Georgia, serif; font-size: 1.3rem;
	color: var(--ink); font-variant-numeric: tabular-nums; letter-spacing: 0.05em;
	margin-top: 0.4rem;
}
.date-display em { font-style: italic; color: var(--muted); margin: 0 0.5em; }

/* submit row */
.submit-row {
	display: flex; align-items: center; gap: 1.5rem; padding-top: 2rem;
}
.progress { flex: 1; height: 1px; background: var(--rule); position: relative; overflow: hidden; }
.progress > span {
	position: absolute; inset: 0 auto 0 0; width: 0%; background: var(--accent);
	transition: width 0.25s ease;
}
button[type=submit] {
	background: var(--ink); color: var(--paper); border: none;
	padding: 0.75rem 2rem; font-size: 0.7rem; letter-spacing: 0.35em;
	text-transform: uppercase; cursor: pointer; font-family: inherit;
	transition: background 0.15s;
}
button[type=submit]:hover:not(:disabled) { background: var(--accent); }
button[type=submit]:disabled { opacity: 0.4; cursor: not-allowed; }
#upload-status {
	font-size: 0.62rem; letter-spacing: 0.25em; text-transform: uppercase;
	color: var(--muted); min-height: 1rem; margin-top: 0.6rem;
	font-variant-numeric: tabular-nums;
}

/* admin entries list */
.entries { list-style: none; margin: 0; padding: 0; }
.entries li {
	display: grid;
	grid-template-columns: 2.5rem 6rem 1fr auto auto;
	align-items: baseline; gap: 1rem;
	padding: 1rem 0; border-bottom: 1px solid var(--rule);
}
.entries .num {
	font-family: "Playfair Display", Georgia, serif; font-style: italic;
	color: var(--muted); font-size: 1.1rem;
}
.entries .date {
	font-size: 0.65rem; letter-spacing: 0.22em; color: var(--muted);
	font-variant-numeric: tabular-nums; font-family: ui-monospace, monospace;
}
.entries .title { font-size: 1rem; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.entries .title a {
	color: inherit; text-decoration: none;
	border-bottom: 1px solid transparent; padding-bottom: 1px;
}
.entries .title a:hover { border-color: var(--ink); }
.entries .count {
	font-size: 0.62rem; letter-spacing: 0.22em; color: var(--muted);
	text-transform: uppercase; font-variant-numeric: tabular-nums;
}
.entries .del form { margin: 0; }
.entries .del button {
	border: 1px solid var(--rule); background: transparent; color: var(--muted);
	font-size: 0.6rem; letter-spacing: 0.25em; text-transform: uppercase;
	padding: 0.35rem 0.7rem; cursor: pointer; font-family: inherit;
}
.entries .del button:hover { color: var(--accent); border-color: var(--accent); }

.new-entry-cta {
	display: inline-block; margin-bottom: 2rem;
	padding: 0.6rem 1.4rem; border: 1px solid var(--ink); color: var(--ink);
	text-decoration: none; font-size: 0.7rem; letter-spacing: 0.3em; text-transform: uppercase;
	transition: background 0.15s, color 0.15s;
}
.new-entry-cta:hover { background: var(--ink); color: var(--paper); }

/* public feed posts */
.post { margin: 0 0 4rem; }
.post header {
	display: flex; justify-content: space-between; align-items: baseline;
	margin-bottom: 0.5rem; font-size: 0.65rem; letter-spacing: 0.22em;
	text-transform: uppercase; color: var(--muted);
}
.post header a { color: inherit; text-decoration: none; }
.post h2 {
	font-family: "Playfair Display", Georgia, serif; font-weight: 500;
	font-style: italic; font-size: 1.6rem; margin: 0.25rem 0 1rem; line-height: 1.15;
}
.post .caption { margin: 1rem 0 0; white-space: pre-wrap; font-size: 0.95rem; }
.carousel {
	display: flex; overflow-x: auto; scroll-snap-type: x mandatory;
	gap: 2px; background: var(--paper-2); -webkit-overflow-scrolling: touch;
}
.carousel img {
	flex: 0 0 100%; scroll-snap-align: start; width: 100%;
	max-height: 80vh; object-fit: contain; display: block;
}
.empty {
	color: var(--muted); font-style: italic; font-family: "Playfair Display", Georgia, serif;
	font-size: 1.05rem; padding: 2rem 0;
}

/* footer */
footer {
	margin-top: 5rem; padding-top: 1.25rem; border-top: 1px solid var(--rule);
	display: flex; justify-content: space-between; font-size: 0.6rem;
	letter-spacing: 0.3em; text-transform: uppercase; color: var(--muted);
}
footer a { color: inherit; text-decoration: none; border-bottom: 1px solid transparent; }
footer a:hover { border-color: var(--muted); }
footer .sep { margin: 0 0.75em; opacity: 0.4; }
`;

const layout = (opts: {
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
		${opts.description
			? html`<meta name="description" content="${opts.description}" />`
			: ""}
		<meta property="og:title" content="${opts.title}" />
		${opts.description
			? html`<meta property="og:description" content="${opts.description}" />`
			: ""}
		${opts.ogImage
			? html`<meta property="og:image" content="${opts.ogImage}" />`
			: ""}
		${opts.ogUrl ? html`<meta property="og:url" content="${opts.ogUrl}" />` : ""}
		<meta property="og:type" content="${opts.ogImage ? "article" : "website"}" />
		<meta name="twitter:card" content="summary_large_image" />
		${opts.noStore ? html`<meta name="robots" content="noindex" />` : ""}
		<link rel="preconnect" href="https://fonts.googleapis.com" />
		<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
		<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,500;1,400;1,500&family=Inter:wght@400;500&display=swap" rel="stylesheet" />
		<style>${raw(PAGE_STYLES)}</style>
	</head>
	<body>
		<div class="page">
			<header class="masthead">
				<h1><a href="/">PHOTO <em>diary</em></a></h1>
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
				<span><a href="/api/posts">JSON</a><span class="sep">·</span><a href="/admin">Admin</a></span>
				<span>© ${year} mizora.dev</span>
			</footer>
		</div>
	</body>
</html>`;
};

const renderPost = (p: PostWithImages) => html`<article class="post">
	<header>
		<time>${p.posted_on}</time>
		<a href="/post/${p.id}">#${p.id}</a>
	</header>
	${p.title ? html`<h2>${p.title}</h2>` : ""}
	${p.images.length > 0
		? html`<div class="carousel">
			${p.images.map(
				(img, i) => html`<img
					src="/images/${img.key}"
					alt="${p.title || p.caption} (${i + 1}/${p.images.length})"
					loading="lazy"
				/>`,
			)}
		</div>`
		: ""}
	${p.caption ? html`<p class="caption">${p.caption}</p>` : ""}
</article>`;

// Inline ES module:
// - dropzone (click + drag) populates an internal items[] state
// - thumbnail grid with index badge, EXIF stamp, and per-file remove button
// - resize to long-edge ≤ 2048px JPEG (browser canvas) at submit time
// - extract EXIF DateTimeOriginal BEFORE re-encoding (canvas resize strips it)
const UPLOAD_SCRIPT = `
import exifr from "https://esm.sh/exifr@7";

(function () {
	const MAX_EDGE = 2048;
	const QUALITY = 0.85;
	const form = document.getElementById("new-post-form");
	if (!form) return;
	const fileInput = document.getElementById("file-input");
	const dropzone = document.getElementById("dropzone");
	const thumbsEl = document.getElementById("thumbs");
	const countEl = document.getElementById("count");
	const status = document.getElementById("upload-status");
	const progress = document.getElementById("progress-bar");
	const btn = form.querySelector("button[type=submit]");

	const items = [];

	function setProgress(pct, msg) {
		if (progress) progress.style.width = Math.max(0, Math.min(100, pct)) + "%";
		if (msg != null) status.textContent = msg;
	}

	function pad(n) { return String(n).padStart(2, "0"); }
	function formatStamp(iso) {
		const d = new Date(iso);
		if (isNaN(d.getTime())) return "";
		return "'" + pad(d.getFullYear() % 100) + " " + pad(d.getMonth() + 1) + " " + pad(d.getDate()) + " " + pad(d.getHours()) + ":" + pad(d.getMinutes());
	}

	function render() {
		thumbsEl.innerHTML = "";
		for (let i = 0; i < items.length; i++) {
			const it = items[i];
			const card = document.createElement("div");
			card.className = "thumb";
			const idx = document.createElement("span");
			idx.className = "idx";
			idx.textContent = pad(i + 1);
			const rm = document.createElement("button");
			rm.type = "button";
			rm.className = "rm";
			rm.setAttribute("aria-label", "remove");
			rm.textContent = "×";
			rm.addEventListener("click", () => {
				URL.revokeObjectURL(it.url);
				items.splice(i, 1);
				render();
			});
			const img = document.createElement("img");
			img.src = it.url;
			img.alt = "";
			card.append(idx, rm, img);
			if (it.takenAt) {
				const exif = document.createElement("span");
				exif.className = "exif";
				exif.textContent = formatStamp(it.takenAt);
				card.appendChild(exif);
			}
			thumbsEl.appendChild(card);
		}
		thumbsEl.style.display = items.length ? "" : "none";
		countEl.textContent = String(items.length);
	}

	async function addFiles(fileList) {
		const incoming = Array.from(fileList || []).filter((f) => f.type && f.type.startsWith("image/"));
		if (!incoming.length) return;
		const startCount = items.length;
		for (let i = 0; i < incoming.length; i++) {
			items.push({ file: incoming[i], url: URL.createObjectURL(incoming[i]), takenAt: "" });
		}
		render();
		for (let i = 0; i < incoming.length; i++) {
			const slot = startCount + i;
			try {
				const meta = await exifr.parse(incoming[i], ["DateTimeOriginal"]);
				const d = meta && meta.DateTimeOriginal;
				if (d instanceof Date && !isNaN(d.getTime()) && items[slot] && items[slot].file === incoming[i]) {
					// EXIF DateTimeOriginal is camera-local with no TZ; store as naive
					// "YYYY-MM-DDTHH:MM:SS" so the worker renders it byte-for-byte
					// instead of converting through UTC.
					items[slot].takenAt =
						d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate()) +
						"T" + pad(d.getHours()) + ":" + pad(d.getMinutes()) + ":" + pad(d.getSeconds());
				}
			} catch {}
		}
		render();
	}

	fileInput.addEventListener("change", () => {
		addFiles(fileInput.files);
		fileInput.value = "";
	});
	dropzone.addEventListener("click", () => fileInput.click());
	dropzone.addEventListener("keydown", (e) => {
		if (e.key === "Enter" || e.key === " ") { e.preventDefault(); fileInput.click(); }
	});
	["dragenter", "dragover"].forEach((ev) => {
		dropzone.addEventListener(ev, (e) => { e.preventDefault(); dropzone.classList.add("over"); });
	});
	["dragleave", "dragend"].forEach((ev) => {
		dropzone.addEventListener(ev, () => dropzone.classList.remove("over"));
	});
	dropzone.addEventListener("drop", (e) => {
		e.preventDefault();
		dropzone.classList.remove("over");
		if (e.dataTransfer && e.dataTransfer.files) addFiles(e.dataTransfer.files);
	});

	form.addEventListener("submit", async (e) => {
		e.preventDefault();
		if (!items.length) { setProgress(0, "select at least one image"); return; }
		btn.disabled = true;
		try {
			const total = items.length;
			setProgress(4, "resizing 0/" + total);
			const resized = [];
			for (let i = 0; i < total; i++) {
				resized.push(await resize(items[i].file));
				setProgress(4 + Math.round(((i + 1) / total) * 66), "resizing " + (i + 1) + "/" + total);
			}
			setProgress(78, "uploading…");
			const fd = new FormData();
			fd.append("title", form.elements.title.value);
			fd.append("caption", form.elements.caption.value);
			fd.append("posted_on", form.elements.posted_on.value);
			for (let i = 0; i < resized.length; i++) {
				fd.append("images", resized[i], resized[i].name);
				fd.append("taken_at", items[i].takenAt || "");
			}
			const res = await fetch("/admin/posts", { method: "POST", body: fd });
			if (!res.ok) { setProgress(0, "upload failed: " + res.status); btn.disabled = false; return; }
			setProgress(100, "done");
			const data = await res.json();
			window.location = data.url || "/admin";
		} catch (err) {
			setProgress(0, "error: " + ((err && err.message) || err));
			btn.disabled = false;
		}
	});

	async function resize(file) {
		const img = await loadImage(file);
		const long = Math.max(img.naturalWidth, img.naturalHeight);
		const scale = Math.min(1, MAX_EDGE / long);
		const w = Math.round(img.naturalWidth * scale);
		const h = Math.round(img.naturalHeight * scale);
		const canvas = document.createElement("canvas");
		canvas.width = w; canvas.height = h;
		canvas.getContext("2d").drawImage(img, 0, 0, w, h);
		const blob = await new Promise((r) => canvas.toBlob(r, "image/jpeg", QUALITY));
		const name = file.name.replace(/\\.[^.]+$/, "") + ".jpg";
		return new File([blob], name, { type: "image/jpeg" });
	}

	function loadImage(file) {
		return new Promise((resolve, reject) => {
			const url = URL.createObjectURL(file);
			const img = new Image();
			img.onload = () => { URL.revokeObjectURL(url); resolve(img); };
			img.onerror = (e) => { URL.revokeObjectURL(url); reject(e); };
			img.src = url;
		});
	}
})();
`;

app.get("/", async (c) => {
	const posts = await getRecentPosts(c.env.DB);
	c.header("Cache-Control", "public, max-age=60, s-maxage=300");
	return c.html(
		layout({
			title: "photo-diary",
			description: "個人の写真日記",
			body:
				posts.length === 0
					? html`<p class="empty">(no posts yet)</p>`
					: html`${posts.map(renderPost)}`,
		}),
	);
});

app.get("/post/:id{[0-9]+}", async (c) => {
	const id = Number(c.req.param("id"));
	const post = await getPost(c.env.DB, id);
	if (!post) return c.notFound();

	const origin = new URL(c.req.url).origin;
	const ogImage = post.images[0]
		? `${origin}/images/${post.images[0].key}`
		: undefined;
	const ogUrl = `${origin}/post/${post.id}`;
	const description = post.caption || post.title || `posted on ${post.posted_on}`;
	const titleText = post.title || post.caption || `#${post.id}`;
	const pageTitle = `${titleText.slice(0, 60)} — photo-diary`;

	c.header("Cache-Control", "public, max-age=60, s-maxage=300");
	return c.html(
		layout({
			title: pageTitle,
			description,
			ogImage,
			ogUrl,
			body: renderPost(post),
		}),
	);
});

app.get("/api/posts", async (c) => {
	const posts = await getRecentPosts(c.env.DB);
	return c.json(posts);
});

app.get("/api/diary", async (c) => {
	const posts = await getRecentPosts(c.env.DB);
	const origin = new URL(c.req.url).origin;
	const entries: DiaryEntry[] = posts.map((p) => {
		// D1's CURRENT_TIMESTAMP is UTC but written as "YYYY-MM-DD HH:MM:SS" with no
		// marker; tag it so formatStamp treats it as UTC and shifts to JST.
		const createdUtc = /[Z]|[+-]\d{2}:?\d{2}$/.test(p.created_at)
			? p.created_at
			: `${p.created_at.replace(" ", "T")}Z`;
		return {
			id: String(p.id),
			date: p.posted_on,
			title: p.title,
			description: p.caption,
			photos: p.images.map((img) => ({
				src: `${origin}/images/${img.key}`,
				alt: p.title || p.caption || `#${p.id}`,
				stamp: formatStamp(img.taken_at ?? createdUtc),
			})),
		};
	});
	c.header("Cache-Control", "public, max-age=60, s-maxage=300");
	return c.json(entries);
});

app.get("/images/:key{.+}", async (c) => {
	const key = c.req.param("key");
	const obj = await c.env.BUCKET.get(key);
	if (!obj) return c.notFound();

	const headers = new Headers();
	obj.writeHttpMetadata(headers);
	headers.set("etag", obj.httpEtag);
	headers.set("cache-control", "public, max-age=31536000, immutable");
	return new Response(obj.body, { headers });
});

app.get("/admin", async (c) => {
	const posts = await getRecentPosts(c.env.DB);
	c.header("Cache-Control", "no-store");
	const total = posts.length;
	return c.html(
		layout({
			title: "admin — photo-diary",
			noStore: true,
			section: "Editorial Desk",
			issue: `${total} ${total === 1 ? "Entry" : "Entries"}`,
			body: html`
				<a class="new-entry-cta" href="/admin/new">+ New Entry</a>
				${posts.length === 0
					? html`<p class="empty">No entries yet — start with a new one.</p>`
					: html`<ul class="entries">
						${posts.map(
							(p, i) => html`<li>
								<span class="num">${String(total - i).padStart(2, "0")}</span>
								<span class="date">${p.posted_on}</span>
								<span class="title"><a href="/post/${p.id}">${p.title || p.caption || "(untitled)"}</a></span>
								<span class="count">${p.images.length} ${p.images.length === 1 ? "photo" : "photos"}</span>
								<span class="del">
									<form method="POST" action="/admin/posts/${p.id}/delete" onsubmit="return confirm('Delete #${p.id}?')">
										<button type="submit">Delete</button>
									</form>
								</span>
							</li>`,
						)}
					</ul>`}
			`,
		}),
	);
});

app.get("/admin/new", (c) => {
	const today = new Date().toISOString().slice(0, 10);
	c.header("Cache-Control", "no-store");
	return c.html(
		layout({
			title: "new entry — photo-diary",
			noStore: true,
			section: "New Entry",
			issue: "Draft",
			body: html`
				<p class="back"><a href="/admin">← Editorial Desk</a></p>
				<form id="new-post-form" action="/admin/posts" method="POST" enctype="multipart/form-data">
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
							<label>Images <span style="color:var(--ink); margin-left:0.5em">(<span id="count">0</span>)</span></label>
							<div id="thumbs" class="thumbs" style="display:none"></div>
							<div id="dropzone" class="dropzone" tabindex="0">drop files here / click to select</div>
							<input id="file-input" type="file" name="images" accept="image/*" multiple style="display:none" />
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
				<script type="module">${raw(UPLOAD_SCRIPT)}</script>
			`,
		}),
	);
});

app.post("/admin/posts", async (c) => {
	const formData = await c.req.formData();
	const title = String(formData.get("title") ?? "").trim();
	const caption = String(formData.get("caption") ?? "").trim();
	const today = new Date().toISOString().slice(0, 10);
	const posted_on = String(formData.get("posted_on") ?? today) || today;
	const files = formData
		.getAll("images")
		.filter((v): v is File => v instanceof File && v.size > 0);
	const takenAts = formData.getAll("taken_at").map((v) => String(v ?? ""));
	if (files.length === 0) return c.json({ error: "no images" }, 400);

	const inserted = await c.env.DB.prepare(
		"INSERT INTO posts (title, caption, posted_on) VALUES (?, ?, ?)",
	)
		.bind(title, caption, posted_on)
		.run();
	const postId = Number(inserted.meta.last_row_id);

	const imageInserts: D1PreparedStatement[] = [];
	await Promise.all(
		files.map(async (file, i) => {
			const ext = safeExt(file.name);
			const shortHash = crypto.randomUUID().slice(0, 8);
			const key = `posts/${postId}/${i}-${shortHash}.${ext}`;
			const takenAt = takenAts[i] ? takenAts[i] : null;
			await c.env.BUCKET.put(key, await file.arrayBuffer(), {
				httpMetadata: { contentType: file.type || "image/jpeg" },
			});
			imageInserts.push(
				c.env.DB.prepare(
					"INSERT INTO post_images (post_id, r2_key, sort_order, taken_at) VALUES (?, ?, ?, ?)",
				).bind(postId, key, i, takenAt),
			);
		}),
	);
	if (imageInserts.length > 0) await c.env.DB.batch(imageInserts);

	return c.json({ ok: true, id: postId, url: `/post/${postId}` });
});

app.delete("/admin/posts/:id{[0-9]+}", async (c) => {
	const id = Number(c.req.param("id"));
	const ok = await deletePost(c.env, id);
	if (!ok) return c.json({ error: "not found" }, 404);
	return c.json({ ok: true });
});

// HTML-form-friendly variant (browsers can't POST DELETE from <form>)
app.post("/admin/posts/:id{[0-9]+}/delete", async (c) => {
	const id = Number(c.req.param("id"));
	const ok = await deletePost(c.env, id);
	if (!ok) return c.notFound();
	return c.redirect("/admin");
});

export default app;
