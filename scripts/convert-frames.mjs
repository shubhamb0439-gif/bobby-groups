#!/usr/bin/env node
/**
 * Converts a raw image sequence (JPG/PNG) into web-ready WebP sets and writes
 * src/config/sequence.json.
 *
 * Usage:
 *   npm run frames                              # uses FRAMES_SRC or ../jpeg/Comp 1
 *   npm run frames -- --src "D:/renders/seq"    # custom source folder
 *   npm run frames -- --budget 40               # desktop budget in MB (default 40)
 *
 * Scene ranges and posterAt already in sequence.json are preserved on re-run.
 */
import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT_DIR = path.join(ROOT, "public", "frames");
const CONFIG_PATH = path.join(ROOT, "src", "config", "sequence.json");

const args = parseArgs(process.argv.slice(2));
const SRC = path.resolve(ROOT, args.src ?? process.env.FRAMES_SRC ?? "../jpeg/Comp 1");
const BUDGET_MB = Number(args.budget ?? 40);
const CONCURRENCY = Math.max(2, Math.min(8, os.cpus().length));
const PAD = 4;
const PATTERN = `frame_{index}.webp`;

const DEFAULT_SCENES = {
  fill: [0, 0.17],
  zoomOutTruck: [0.17, 0.27],
  crane: [0.27, 0.37],
  shipLoad: [0.37, 0.5],
  shipDepart: [0.5, 0.63],
  whiteToOcean: [0.63, 0.77],
  drone: [0.77, 1.0],
};

// Desktop attempts in order; first one under budget wins.
const DESKTOP_ATTEMPTS = [
  { quality: 75, step: 1 },
  { quality: 70, step: 1 },
  { quality: 65, step: 1 },
  { quality: 60, step: 1 },
  { quality: 70, step: 2 },
  { quality: 65, step: 2 },
  { quality: 60, step: 2 },
];
const DESKTOP = { maxWidth: 1920 };
const MOBILE = { maxWidth: 960, quality: 70, step: 2 };

sharp.concurrency(1); // we parallelise across files instead

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

async function main() {
  const files = await listFrames(SRC);
  if (!files.length) throw new Error(`No .jpg/.jpeg/.png frames found in ${SRC}`);

  const first = await sharp(files[0]).metadata();
  const totalSrc = (await Promise.all(files.map((f) => fs.stat(f)))).reduce((a, s) => a + s.size, 0);
  console.log(`Source: ${SRC}`);
  console.log(`  ${files.length} frames, ${first.width}x${first.height}, ${mb(totalSrc)} MB`);
  console.log(`  first: ${path.basename(files[0])}  last: ${path.basename(files.at(-1))}`);

  // --- Estimate desktop settings from a sample, then convert for real ---
  const sample = pickEvenly(files, 36);
  const budget = BUDGET_MB * 1024 * 1024;
  let chosenIdx = 0;
  for (let i = 0; i < DESKTOP_ATTEMPTS.length; i++) {
    const a = DESKTOP_ATTEMPTS[i];
    const avg = await estimateAvg(sample, DESKTOP.maxWidth, a.quality);
    const est = avg * Math.ceil(files.length / a.step);
    console.log(`  estimate q${a.quality} step${a.step}: ~${mb(est)} MB`);
    chosenIdx = i;
    if (est <= budget * 0.97) break;
  }

  let desktop;
  for (let i = chosenIdx; i < DESKTOP_ATTEMPTS.length; i++) {
    const a = DESKTOP_ATTEMPTS[i];
    desktop = await convertSet("desktop", files, { ...DESKTOP, ...a });
    if (desktop.bytes <= budget) break;
    console.log(`  desktop over budget (${mb(desktop.bytes)} MB), trying next setting…`);
  }
  const mobile = await convertSet("mobile", files, MOBILE);

  // --- Edge colors ---
  const colors = {
    start: await sampleEdges(files[0]),
    end: await sampleEdges(files.at(-1)),
  };

  // --- Config (preserve user-tuned values) ---
  let existing = {};
  try {
    existing = JSON.parse(await fs.readFile(CONFIG_PATH, "utf8"));
  } catch {}
  const posterAt = existing.posterAt ?? 0.5;

  // Poster (reduced motion) + OG image
  const posterSrc = files[Math.round(posterAt * (files.length - 1))];
  await sharp(posterSrc).resize({ width: 1920, withoutEnlargement: true }).webp({ quality: 78 }).toFile(path.join(OUT_DIR, "poster.webp"));
  await sharp(posterSrc).resize(1200, 630, { fit: "cover" }).jpeg({ quality: 82, mozjpeg: true }).toFile(path.join(ROOT, "public", "og.jpg"));

  const config = {
    /** Cache-busting token appended to frame URLs (frames are served with immutable caching). */
    version: Date.now().toString(36),
    source: { frames: files.length, width: first.width, height: first.height },
    desktop: desktop.meta,
    mobile: mobile.meta,
    pad: PAD,
    pattern: PATTERN,
    colors: {
      start: colors.start.border,
      endTop: colors.end.top,
      endBottom: colors.end.bottom,
      endBorder: colors.end.border,
    },
    posterAt,
    scenes: { ...DEFAULT_SCENES, ...(existing.scenes ?? {}) },
  };
  await fs.mkdir(path.dirname(CONFIG_PATH), { recursive: true });
  await fs.writeFile(CONFIG_PATH, JSON.stringify(config, null, 2) + "\n");

  console.log("\nResult");
  console.log(`  desktop: ${desktop.meta.count} frames @ q${desktop.meta.quality}, ${desktop.meta.width}x${desktop.meta.height}, ${mb(desktop.bytes)} MB`);
  console.log(`  mobile:  ${mobile.meta.count} frames @ q${mobile.meta.quality}, ${mobile.meta.width}x${mobile.meta.height}, ${mb(mobile.bytes)} MB`);
  console.log(`  colors:  start ${config.colors.start} | end top ${config.colors.endTop} | end bottom ${config.colors.endBottom} | end border ${config.colors.endBorder}`);
  console.log(`  wrote ${path.relative(ROOT, CONFIG_PATH)}`);
}

async function convertSet(name, files, { maxWidth, quality, step }) {
  const dir = path.join(OUT_DIR, name);
  await fs.rm(dir, { recursive: true, force: true });
  await fs.mkdir(dir, { recursive: true });
  const picked = files.filter((_, i) => i % step === 0);
  let done = 0;
  let bytes = 0;
  let size = null;
  await pool(picked, CONCURRENCY, async (file, i) => {
    const out = path.join(dir, PATTERN.replace("{index}", String(i).padStart(PAD, "0")));
    const info = await sharp(file)
      .resize({ width: maxWidth, withoutEnlargement: true })
      .webp({ quality, effort: 5, smartSubsample: true })
      .toFile(out);
    bytes += info.size;
    size ??= { width: info.width, height: info.height };
    if (++done % 50 === 0 || done === picked.length) {
      process.stdout.write(`\r  ${name}: ${done}/${picked.length} (${mb(bytes)} MB)   `);
    }
  });
  process.stdout.write("\n");
  return {
    bytes,
    meta: { count: picked.length, folder: `/frames/${name}`, step, quality, ...size, bytes },
  };
}

async function estimateAvg(sample, maxWidth, quality) {
  const sizes = await pool(sample, CONCURRENCY, async (f) => {
    const buf = await sharp(f).resize({ width: maxWidth, withoutEnlargement: true }).webp({ quality, effort: 5, smartSubsample: true }).toBuffer();
    return buf.length;
  });
  return sizes.reduce((a, b) => a + b, 0) / sizes.length;
}

/** Median color of the 4px border, plus top/bottom strips separately. */
async function sampleEdges(file) {
  const { data, info } = await sharp(file).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width: w, height: h } = info;
  const S = 4;
  const px = (x, y) => {
    const o = (y * w + x) * 3;
    return [data[o], data[o + 1], data[o + 2]];
  };
  const top = [], bottom = [], border = [];
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const inTop = y < S, inBottom = y >= h - S, inSide = x < S || x >= w - S;
      if (!(inTop || inBottom || inSide)) {
        x = w - S - 1; // skip interior
        continue;
      }
      const p = px(x, y);
      border.push(p);
      if (inTop) top.push(p);
      if (inBottom) bottom.push(p);
    }
  }
  return { border: hex(median(border)), top: hex(median(top)), bottom: hex(median(bottom)) };
}

function median(pixels) {
  return [0, 1, 2].map((c) => {
    const v = pixels.map((p) => p[c]).sort((a, b) => a - b);
    return v[v.length >> 1];
  });
}

const hex = (rgb) => "#" + rgb.map((v) => v.toString(16).padStart(2, "0")).join("");
const mb = (b) => (b / 1024 / 1024).toFixed(1);

async function listFrames(dir) {
  const names = (await fs.readdir(dir)).filter((n) => /\.(jpe?g|png)$/i.test(n));
  names.sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
  return names.map((n) => path.join(dir, n));
}

function pickEvenly(arr, n) {
  if (arr.length <= n) return arr;
  return Array.from({ length: n }, (_, i) => arr[Math.round((i * (arr.length - 1)) / (n - 1))]);
}

async function pool(items, limit, fn) {
  const results = new Array(items.length);
  let next = 0;
  await Promise.all(
    Array.from({ length: Math.min(limit, items.length) }, async () => {
      while (next < items.length) {
        const i = next++;
        results[i] = await fn(items[i], i);
      }
    }),
  );
  return results;
}

function parseArgs(argv) {
  const out = {};
  for (let i = 0; i < argv.length; i++) {
    const m = argv[i].match(/^--([^=]+)(?:=(.*))?$/);
    if (m) out[m[1]] = m[2] ?? argv[++i];
  }
  return out;
}
