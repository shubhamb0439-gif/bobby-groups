#!/usr/bin/env node
/**
 * Builds decorative assets:
 *  - public/cursors/{cardamom,chilli}.png and @2x  (from assets/cursors/*.svg)
 *  - public/textures/grain.png                     (tileable film-grain noise)
 *
 * Usage: npm run decor
 */
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const CURSOR_SRC = path.join(ROOT, "assets", "cursors");
const CURSOR_OUT = path.join(ROOT, "public", "cursors");
const TEXTURE_OUT = path.join(ROOT, "public", "textures");

await fs.mkdir(CURSOR_OUT, { recursive: true });
await fs.mkdir(TEXTURE_OUT, { recursive: true });

for (const name of ["cardamom", "chilli"]) {
  const svg = await fs.readFile(path.join(CURSOR_SRC, `${name}.svg`));
  for (const [suffix, size] of [["", 32], ["@2x", 64]]) {
    await sharp(svg, { density: 72 * (size / 32) })
      .resize(size, size)
      .png({ compressionLevel: 9 })
      .toFile(path.join(CURSOR_OUT, `${name}${suffix}.png`));
  }
}

// Grain: neutral grey noise with per-pixel alpha, so it works on light and dark surfaces.
const N = 160;
const px = Buffer.alloc(N * N * 4);
let seed = 7;
const rand = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
for (let i = 0; i < N * N; i++) {
  const v = rand() > 0.5 ? 255 : 0;
  px[i * 4] = px[i * 4 + 1] = px[i * 4 + 2] = v;
  px[i * 4 + 3] = Math.round(rand() * 22);
}
await sharp(px, { raw: { width: N, height: N, channels: 4 } }).png({ compressionLevel: 9 }).toFile(path.join(TEXTURE_OUT, "grain.png"));

console.log("Wrote public/cursors/*.png and public/textures/grain.png");
