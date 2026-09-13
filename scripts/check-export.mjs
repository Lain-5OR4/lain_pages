import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";

for (const route of ["", "reading/", "diary/", "tropical/"]) {
  const html = await readFile(`out/${route}index.html`, "utf8");
  assert(html.includes("/_next/static/"), `${route || "/"}: missing static scripts`);
  for (const match of html.matchAll(/(?:src|href)="([^"#?]+)(?:[?#][^"]*)?"/g)) {
    const url = match[1];
    if (!url.includes("/_next/")) continue;
    assert(url.startsWith("/_next/"), `${route}: wrong asset prefix: ${url}`);
    await access(`out${url}`);
  }
}
for (const asset of ["assets/tropical/fix.webp", "assets/wired-sky-v2.webp", "diary/cork.jpg"]) {
  await access(`out/${asset}`);
}
console.log("Static export verified for /");
