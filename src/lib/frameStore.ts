/**
 * Loads an image sequence into decoded frames (ImageBitmap where supported).
 * The first `priority` frames load first; the rest load in progressive passes
 * (every 8th, every 4th, … every frame) so a nearby frame is always available
 * even if the user scrolls ahead of the download.
 */
export type Frame = ImageBitmap | HTMLImageElement;

type Options = {
  urls: string[];
  priority: number;
  chunkSize: number;
  concurrency: number;
  onPriorityProgress?: (loaded: number, total: number) => void;
  onPriorityDone?: () => void;
};

const supportsBitmap = typeof window !== "undefined" && "createImageBitmap" in window;

export class FrameStore {
  readonly count: number;
  private frames: (Frame | undefined)[];
  private loaded = new Set<number>();
  private abort = new AbortController();
  private disposed = false;

  constructor(private opts: Options) {
    this.count = opts.urls.length;
    this.frames = new Array(this.count);
  }

  get loadedCount() {
    return this.loaded.size;
  }

  async start() {
    const { priority, chunkSize, concurrency } = this.opts;
    const first = Array.from({ length: Math.min(priority, this.count) }, (_, i) => i);
    let done = 0;
    await this.loadAll(first, concurrency, () => {
      done++;
      this.opts.onPriorityProgress?.(done, first.length);
    });
    if (this.disposed) return;
    this.opts.onPriorityDone?.();

    const rest = progressiveOrder(this.count).filter((i) => !this.loaded.has(i));
    for (let i = 0; i < rest.length && !this.disposed; i += chunkSize) {
      await idle();
      await this.loadAll(rest.slice(i, i + chunkSize), concurrency);
    }
  }

  /** The requested frame, or the closest one that has finished loading. */
  nearest(index: number): Frame | undefined {
    const i = Math.max(0, Math.min(this.count - 1, Math.round(index)));
    if (this.frames[i]) return this.frames[i];
    for (let d = 1; d < this.count; d++) {
      const lo = this.frames[i - d];
      if (lo) return lo;
      const hi = this.frames[i + d];
      if (hi) return hi;
    }
    return undefined;
  }

  dispose() {
    this.disposed = true;
    this.abort.abort();
    for (const f of this.frames) if (f && "close" in f) f.close();
    this.frames = [];
  }

  private async loadAll(indices: number[], limit: number, onEach?: () => void) {
    let next = 0;
    const worker = async () => {
      while (next < indices.length && !this.disposed) {
        const idx = indices[next++];
        try {
          const frame = await this.loadOne(this.opts.urls[idx]);
          if (this.disposed) {
            if ("close" in frame) frame.close();
            return;
          }
          this.frames[idx] = frame;
          this.loaded.add(idx);
        } catch (err) {
          if ((err as Error).name !== "AbortError") console.warn(`Frame ${idx} failed to load`, err);
        }
        onEach?.();
      }
    };
    await Promise.all(Array.from({ length: Math.min(limit, indices.length) }, worker));
  }

  private async loadOne(url: string): Promise<Frame> {
    if (supportsBitmap) {
      const res = await fetch(url, { signal: this.abort.signal });
      if (!res.ok) throw new Error(`${res.status} ${url}`);
      return createImageBitmap(await res.blob());
    }
    const img = new Image();
    img.decoding = "async";
    img.src = url;
    await img.decode();
    return img;
  }
}

/** 0, 8, 16… then 4, 12… then 2, 6… then odd indices. */
function progressiveOrder(count: number): number[] {
  const order: number[] = [];
  const seen = new Set<number>();
  for (let step = 8; step >= 1; step /= 2) {
    for (let i = 0; i < count; i += step) {
      if (!seen.has(i)) {
        seen.add(i);
        order.push(i);
      }
    }
  }
  return order;
}

function idle(): Promise<void> {
  return new Promise((resolve) => {
    if ("requestIdleCallback" in window) window.requestIdleCallback(() => resolve(), { timeout: 200 });
    else setTimeout(resolve, 16);
  });
}
