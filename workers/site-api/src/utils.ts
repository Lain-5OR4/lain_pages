export const safeExt = (name: string, fallback = "jpg"): string => {
	const m = /\.([a-zA-Z0-9]{1,5})$/.exec(name);
	const ext = m ? m[1].toLowerCase() : fallback;
	const allowed = new Set(["jpg", "jpeg", "png", "webp", "gif", "avif"]);
	return allowed.has(ext) ? ext : fallback;
};

// Content type is derived from the whitelisted extension, never from the
// client-supplied MIME (which could smuggle text/html into R2).
const MIME_BY_EXT: Record<string, string> = {
	jpg: "image/jpeg",
	jpeg: "image/jpeg",
	png: "image/png",
	webp: "image/webp",
	gif: "image/gif",
	avif: "image/avif",
};

export const mimeForExt = (ext: string): string => MIME_BY_EXT[ext] ?? "image/jpeg";

// Workers run in UTC. EXIF DateTimeOriginal is the camera's local time without a
// timezone, so new uploads store a naive "YYYY-MM-DDTHH:MM:SS" we render byte-for-byte.
// Timestamps that carry a UTC marker (Z / offset) — including SQLite CURRENT_TIMESTAMP
// after we normalise it — get shifted to JST so the diary stays in the user's clock.
export const JST_OFFSET_MS = 9 * 60 * 60 * 1000;

export const formatStamp = (s: string | null | undefined): string => {
	if (!s) return "";
	const naive =
		/^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})(?::\d{2}(?:\.\d+)?)?$/.exec(s);
	if (naive) {
		return `'${naive[1].slice(2)} ${naive[2]} ${naive[3]} ${naive[4]}:${naive[5]}`;
	}
	const d = new Date(s);
	if (Number.isNaN(d.getTime())) return "";
	const jst = new Date(d.getTime() + JST_OFFSET_MS);
	const p = (n: number) => String(n).padStart(2, "0");
	return `'${p(jst.getUTCFullYear() % 100)} ${p(jst.getUTCMonth() + 1)} ${p(jst.getUTCDate())} ${p(jst.getUTCHours())}:${p(jst.getUTCMinutes())}`;
};
