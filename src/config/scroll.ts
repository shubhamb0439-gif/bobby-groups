/**
 * Scroll-sequence tuning. Scene ranges live in sequence.json (`scenes`) so the
 * frame script can regenerate everything else without touching them.
 */
export const scrollConfig = {
  /** Total height of the pinned video section, in viewport heights. */
  pinVh: { desktop: 800, mobile: 600 },
  /** Below this width (px) the mobile frame set and mobile pinVh are used. */
  mobileBreakpoint: 768,
  /** Playhead smoothing per 60fps tick (0..1). Lower = silkier, higher = snappier. */
  lerp: 0.14,
  /** Frames that must be ready before the preloader lets go. */
  preloadFrames: 40,
  /** Background loading batch size. */
  chunkSize: 30,
  /** Parallel requests while loading. */
  concurrency: 6,
  /**
   * How a 16:9 frame fills a portrait (phone) screen.
   * 1 = pure cover (crops the sides heavily), 0 = contain (full frame, bands above/below).
   * Values in between zoom part-way; the bands blend into the sampled background colors.
   * Landscape screens always use cover.
   */
  portraitFill: 0.6,
} as const;
