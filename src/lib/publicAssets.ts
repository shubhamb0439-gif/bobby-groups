import fs from "node:fs";
import path from "node:path";

/** Finds /public/<dir>/<slug>.<ext> at build/render time; returns its URL or null. */
export function findPublicAsset(dir: string, slug: string, exts = ["webp", "jpg", "jpeg", "png", "svg", "avif"]): string | null {
  for (const ext of exts) {
    const rel = `${dir}/${slug}.${ext}`;
    if (fs.existsSync(path.join(process.cwd(), "public", rel))) return `/${rel}`;
  }
  return null;
}
