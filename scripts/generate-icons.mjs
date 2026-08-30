// Rasterise the brand mark (src/app/icon.svg) into the full icon set.
// Run once after changing the mark:  node scripts/generate-icons.mjs
import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import sharp from "sharp";
import pngToIco from "png-to-ico";

const root = path.resolve(fileURLToPath(import.meta.url), "../..");
const PURPLE = "#6E3482";

const svg = await readFile(path.join(root, "src/app/icon.svg"));

/** Render the SVG to a square PNG buffer at `size`, on an opaque purple ground. */
const render = (size, scale = 1) => {
  const inner = Math.round(size * scale);
  return sharp(svg, { density: 384 })
    .resize(inner, inner, { fit: "contain", background: PURPLE })
    .extend({
      top: Math.floor((size - inner) / 2),
      bottom: Math.ceil((size - inner) / 2),
      left: Math.floor((size - inner) / 2),
      right: Math.ceil((size - inner) / 2),
      background: PURPLE,
    })
    .flatten({ background: PURPLE })
    .png()
    .toBuffer();
};

const out = async (rel, buf) => {
  await writeFile(path.join(root, rel), buf);
  console.log("  ✓", rel, `${(buf.length / 1024).toFixed(1)} KB`);
};

console.log("generating icons…");
await out("src/app/apple-icon.png", await render(180));
await out("public/icon-192.png", await render(192));
// 512 with ~12% safe-area padding so the maskable circle doesn't clip the mark.
await out("public/icon-512.png", await render(512, 0.76));
await out(
  "src/app/favicon.ico",
  await pngToIco([await render(16), await render(32), await render(48)]),
);
console.log("done.");
