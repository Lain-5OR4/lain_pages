// Inline ES module served inside <script type="module"> on the admin/new page.
// Handles dropzone, thumbnail grid, EXIF extraction, canvas resize, and form submission.
export const UPLOAD_SCRIPT = `
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
