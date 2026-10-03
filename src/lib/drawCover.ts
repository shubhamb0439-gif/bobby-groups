import type { Frame } from "./frameStore";

/**
 * Draws `frame` centered in a canvas of size (cw, ch) in device pixels.
 * Landscape canvases use cover. Portrait canvases interpolate (log-scale)
 * between contain (fill=0) and cover (fill=1).
 */
export function drawFrame(ctx: CanvasRenderingContext2D, frame: Frame, cw: number, ch: number, portraitFill: number) {
  const { x, y, w, h } = fitRect(frame.width, frame.height, cw, ch, portraitFill);
  ctx.clearRect(0, 0, cw, ch);
  ctx.drawImage(frame, x, y, w, h);
}

/** Where a (iw x ih) frame lands inside a (cw x ch) canvas. */
export function fitRect(iw: number, ih: number, cw: number, ch: number, portraitFill: number) {
  const cover = Math.max(cw / iw, ch / ih);
  const contain = Math.min(cw / iw, ch / ih);
  const portrait = ch > cw;
  const scale = portrait ? contain * Math.pow(cover / contain, clamp01(portraitFill)) : cover;
  const w = iw * scale;
  const h = ih * scale;
  return { x: (cw - w) / 2, y: (ch - h) / 2, w, h };
}

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
