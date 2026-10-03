"use client";

import { useEffect, useRef, useSyncExternalStore, type CSSProperties } from "react";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { FrameStore, type Frame } from "@/lib/frameStore";
import { drawFrame, fitRect } from "@/lib/drawCover";
import { frameUrl, getFrameSet, scenes, sequenceColors, type DeviceKind } from "@/lib/sequence";
import { loaderStore } from "@/lib/loaderStore";
import { scrollConfig } from "@/config/scroll";
import { useReducedMotion } from "@/hooks/useMediaQuery";
import { StoryOverlays } from "./StoryOverlays";
import { StaticHero } from "./StaticHero";

const noopSubscribe = () => () => {};
const pickKind = (): DeviceKind => (window.innerWidth < scrollConfig.mobileBreakpoint ? "mobile" : "desktop");

export function ScrollSequence() {
  const reduced = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // Frame set is chosen once on the client (null during SSR/hydration).
  const kind = useSyncExternalStore<DeviceKind | null>(noopSubscribe, pickKind, () => null);

  useEffect(() => {
    if (reduced) loaderStore.set({ progress: 1, ready: true });
  }, [reduced]);

  useGSAP(
    () => {
      if (reduced || !kind) return;
      const section = sectionRef.current!;
      const stage = stageRef.current!;
      const canvas = canvasRef.current!;
      // Touch devices (phones/tablets) get a CPU-backed canvas: a GPU canvas keeps a texture
      // for every frame it has drawn, which exhausts mobile GPU memory and crashes the tab.
      // Desktops keep the GPU canvas for the smoothest scrubbing.
      const lowMemory = kind === "mobile" || window.matchMedia("(pointer: coarse)").matches;
      const ctx = canvas.getContext("2d", { alpha: true, willReadFrequently: lowMemory })!;
      const set = getFrameSet(kind);
      const last = set.count - 1;

      // --- Loading ---
      let needsDraw = true;
      const store = new FrameStore({
        urls: Array.from({ length: set.count }, (_, i) => frameUrl(set, i)),
        priority: scrollConfig.preloadFrames,
        chunkSize: scrollConfig.chunkSize,
        concurrency: scrollConfig.concurrency,
        maxDecoded: scrollConfig.maxDecodedFrames[kind],
        onPriorityProgress: (loaded, total) => loaderStore.set({ progress: loaded / total }),
        onPriorityDone: () => {
          loaderStore.set({ progress: 1, ready: true });
          needsDraw = true;
        },
      });
      store.start();

      // --- Canvas sizing (DPR capped at 2) ---
      let cw = 0;
      let ch = 0;
      const resize = () => {
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        const rect = canvas.getBoundingClientRect();
        cw = Math.max(1, Math.round(rect.width * dpr));
        ch = Math.max(1, Math.round(rect.height * dpr));
        if (canvas.width !== cw || canvas.height !== ch) {
          canvas.width = cw;
          canvas.height = ch;
          ctx.imageSmoothingQuality = lowMemory ? "medium" : "high";
        }
        // When the frame doesn't fill the height (portrait), feather its top/bottom edges
        // into the sampled background so there is never a hard line.
        const r = fitRect(set.width, set.height, rect.width, rect.height, scrollConfig.portraitFill);
        if (r.y > 1) {
          const fade = r.h * 0.2;
          const mask = `linear-gradient(to bottom, transparent ${r.y}px, #000 ${r.y + fade}px, #000 ${r.y + r.h - fade}px, transparent ${r.y + r.h}px)`;
          canvas.style.maskImage = mask;
          canvas.style.webkitMaskImage = mask;
        } else {
          canvas.style.maskImage = "";
          canvas.style.webkitMaskImage = "";
        }
        needsDraw = true;
      };
      resize();
      const ro = new ResizeObserver(resize);
      ro.observe(canvas);

      // --- Playhead: ScrollTrigger scrubs the target, the ticker lerps toward it ---
      const playhead = { frame: 0 };
      gsap.to(playhead, {
        frame: last,
        ease: "none",
        scrollTrigger: { trigger: section, start: "top top", end: "bottom bottom", scrub: true, invalidateOnRefresh: true },
      });

      let current = 0;
      let drawn: Frame | undefined;
      const tick = (_time: number, deltaTime: number) => {
        const k = 1 - Math.pow(1 - scrollConfig.lerp, deltaTime / (1000 / 60));
        const diff = playhead.frame - current;
        current = Math.abs(diff) < 0.01 ? playhead.frame : current + diff * k;
        store.focus(current);
        const frame = store.nearest(current);
        if (frame && (frame !== drawn || needsDraw)) {
          drawFrame(ctx, frame, cw, ch, scrollConfig.portraitFill);
          drawn = frame;
          needsDraw = false;
        }
      };
      gsap.ticker.add(tick);

      // --- Background blend: white → ocean across `whiteToOcean` ---
      const [b0, b1] = scenes.whiteToOcean;
      const { start, endTop, endBottom } = sequenceColors;
      gsap.set(stage, { "--seq-top": start, "--seq-bottom": start });
      gsap.set(document.body, { backgroundColor: start });
      gsap
        .timeline({
          defaults: { ease: "none" },
          scrollTrigger: { trigger: section, start: "top top", end: "bottom bottom", scrub: true },
        })
        .to(stage, { "--seq-top": endTop, "--seq-bottom": endBottom, duration: b1 - b0 }, b0)
        .to(document.body, { backgroundColor: endBottom, duration: b1 - b0 }, b0)
        .set({}, {}, 1);

      ScrollTrigger.refresh();

      return () => {
        gsap.ticker.remove(tick);
        ro.disconnect();
        store.dispose();
        gsap.set(document.body, { clearProps: "backgroundColor" });
      };
    },
    { dependencies: [reduced, kind], scope: sectionRef, revertOnUpdate: true },
  );

  if (reduced) return <StaticHero />;

  const style = {
    "--pin-desktop": `${scrollConfig.pinVh.desktop}vh`,
    "--pin-mobile": `${scrollConfig.pinVh.mobile}vh`,
  } as CSSProperties;

  return (
    <section
      id="top"
      ref={sectionRef}
      aria-label="Bobby Group: from India's growers to the world"
      className="relative h-(--pin-mobile) md:h-(--pin-desktop)"
      style={style}
    >
      <div
        ref={stageRef}
        className="sticky top-0 h-svh w-full overflow-hidden"
        style={{ background: "linear-gradient(var(--seq-top, #fff), var(--seq-bottom, #fff))" }}
      >
        <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" aria-hidden="true" />
        <StoryOverlays />
      </div>
    </section>
  );
}
