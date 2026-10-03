#!/usr/bin/env node
/**
 * Crops the supplied logo (white wordmark on black) to the wordmark and writes
 * web assets: public/brand/logo.png (transparent), src/app/icon.png, src/app/apple-icon.png.
 *
 * Usage: npm run logo [-- --src assets/logo/bobby-logo.png]
 */
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const srcArg = process.argv.indexOf("--src");
const SRC = path.resolve(ROOT, srcArg > -1 ? process.argv[srcArg + 1] : "assets/logo/bobby-logo.png");

const trimmed = await sharp(SRC).flatten({ background: "#000" }).trim({ background: "#000", threshold: 20 }).toBuffer({ resolveWithObject: true });
const { width, height } = trimmed.info;

// Use luminance as alpha so the white wordmark sits on any dark surface without a box.
const { data, info } = await sharp(trimmed.data).removeAlpha().raw().toBuffer({ resolveWithObject: true });
const rgba = Buffer.alloc(info.width * info.height * 4);
for (let i = 0, j = 0; i < data.length; i += 3, j += 4) {
  const lum = Math.max(data[i], data[i + 1], data[i + 2]);
  rgba[j] = rgba[j + 1] = rgba[j + 2] = 255;
  rgba[j + 3] = lum;
}
const pad = Math.round(width * 0.02);
await fs.mkdir(path.join(ROOT, "public", "brand"), { recursive: true });
await sharp(rgba, { raw: { width: info.width, height: info.height, channels: 4 } })
  .extend({ top: pad, bottom: pad, left: pad, right: pad, background: { r: 0, g: 0, b: 0, alpha: 0 } })
  .resize({ width: 640 })
  .png({ compressionLevel: 9 })
  .toFile(path.join(ROOT, "public", "brand", "logo.png"));

// Icons: "B" monogram crop from the wordmark on black.
const bWidth = Math.round(width * 0.165);
const mono = await sharp(trimmed.data).extract({ left: 0, top: 0, width: bWidth, height: Math.round(height * 0.78) }).toBuffer();
for (const [file, size] of [["icon.png", 64], ["apple-icon.png", 180]]) {
  const inner = Math.round(size * 0.62);
  const glyph = await sharp(mono).resize({ height: inner, width: inner, fit: "contain", background: "#000" }).toBuffer();
  await sharp({ create: { width: size, height: size, channels: 3, background: "#000" } })
    .composite([{ input: glyph, gravity: "center" }])
    .png()
    .toFile(path.join(ROOT, "src", "app", file));
}
console.log(`Logo trimmed to ${width}x${height}; wrote public/brand/logo.png, src/app/icon.png, src/app/apple-icon.png`);
