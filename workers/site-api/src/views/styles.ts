export const PAGE_STYLES = `
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

/* select inputs (books admin) */
select {
	font-family: inherit; font-size: 1.05rem; color: var(--ink);
	border: none; border-bottom: 1px solid var(--ink); background: transparent;
	padding: 0.3rem 0; width: 100%; outline: none; border-radius: 0;
}
select:focus { border-color: var(--accent); }

/* admin books list */
.books { list-style: none; margin: 0; padding: 0; }
.books li {
	display: grid;
	grid-template-columns: 2.75rem 7rem 1fr auto auto auto;
	align-items: center; gap: 1rem;
	padding: 0.75rem 0; border-bottom: 1px solid var(--rule);
}
.books .cover {
	width: 2.75rem; height: 3.9rem; background: var(--paper-2);
	border: 1px solid var(--rule); overflow: hidden; flex-shrink: 0;
}
.books .cover img { width: 100%; height: 100%; object-fit: cover; display: block; }
.books .status-form { margin: 0; }
.books .status-form select {
	font-size: 0.6rem; letter-spacing: 0.1em; text-transform: uppercase;
	color: var(--muted); border: 1px solid var(--rule); padding: 0.3rem 0.4rem;
	background: transparent; width: 100%;
}
.books .title { font-size: 1rem; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.books .title .author { color: var(--muted); font-size: 0.85em; margin-left: 0.6em; }
.books .rating {
	font-size: 0.75rem; color: var(--accent); letter-spacing: 0.1em;
	font-variant-numeric: tabular-nums; white-space: nowrap;
}
.books .edit a {
	font-size: 0.6rem; letter-spacing: 0.25em; text-transform: uppercase;
	color: var(--muted); text-decoration: none; border-bottom: 1px solid var(--rule);
}
.books .edit a:hover { color: var(--ink); border-color: var(--ink); }
.books .del form { margin: 0; }
.books .del button {
	border: 1px solid var(--rule); background: transparent; color: var(--muted);
	font-size: 0.6rem; letter-spacing: 0.25em; text-transform: uppercase;
	padding: 0.35rem 0.7rem; cursor: pointer; font-family: inherit;
}
.books .del button:hover { color: var(--accent); border-color: var(--accent); }

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
