// Re-encode committed raster images in public/ — smaller files, quality retained.
// Run once after adding new photos:  node scripts/optimize-images.mjs
import { readdir, readFile, writeFile, stat } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import sharp from "sharp";

const root = path.resolve(fileURLToPath(import.meta.url), "../..");
const dir = path.join(root, "public");
const MAX_W = 2000;
const SKIP = new Set(["uploads"]); // user uploads / generated icons left alone
const KEEP = new Set(["icon-192.png", "icon-512.png"]);

async function* walk(d) {
  for (const e of await readdir(d, { withFileTypes: true })) {
    if (e.isDirectory()) {
      if (!SKIP.has(e.name)) yield* walk(path.join(d, e.name));
    } else {
      yield path.join(d, e.name);
    }
  }
}

let before = 0;
let after = 0;
for await (const file of walk(dir)) {
  const ext = path.extname(file).toLowerCase();
  if (![".jpg", ".jpeg", ".png"].includes(ext)) continue;
  if (KEEP.has(path.basename(file))) continue;

  const src = await readFile(file);
  const img = sharp(src).rotate();
  const meta = await img.metadata();
  if ((meta.width ?? 0) > MAX_W) img.resize({ width: MAX_W, withoutEnlargement: true });

  const out =
    ext === ".png"
      ? await img.png({ compressionLevel: 9, palette: true, quality: 82 }).toBuffer()
      : await img.jpeg({ quality: 82, mozjpeg: true, progressive: true }).toBuffer();

  before += src.length;
  if (out.length < src.length) {
    await writeFile(file, out);
    after += out.length;
    console.log(
      `  ${path.relative(root, file)}  ${(src.length / 1024) | 0}KB → ${(out.length / 1024) | 0}KB`,
    );
  } else {
    after += src.length;
  }
}
console.log(
  `\npublic/ rasters: ${(before / 1e6).toFixed(2)}MB → ${(after / 1e6).toFixed(2)}MB  (−${(
    (1 - after / before) *
    100
  ).toFixed(0)}%)`,
);
