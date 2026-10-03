"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { hero, storyPanels, type StoryPanel } from "@/config/content";
import { scenes, sceneSpan } from "@/lib/sequence";
import { useSmoothScroll } from "./SmoothScrollProvider";
import { MagneticButton } from "./MagneticButton";

const FADE = 0.18; // fraction of a panel's scene span used for each fade

/** Text panels over the video, scrubbed on the same scroll range as the enclosing <section>. */
export function StoryOverlays() {
  const root = useRef<HTMLDivElement>(null);
  const { scrollTo } = useSmoothScroll();

  useGSAP(
    () => {
      // The parent section ref is not attached yet when child effects run, so look it up via the DOM.
      const trigger = root.current?.closest("section");
      if (!trigger) return;
      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: { trigger, start: "top top", end: "bottom bottom", scrub: 0.6 },
      });

      // Hero fades as the spices begin to fall.
      const heroEnd = Math.max(0.03, scenes.fill[1] * 0.3);
      tl.to("[data-hero]", { autoAlpha: 0, y: -60, duration: heroEnd }, 0.005);
      tl.to("[data-cue]", { autoAlpha: 0, duration: heroEnd * 0.5 }, 0);

      for (const panel of storyPanels) {
        const el = root.current!.querySelector(`[data-panel="${panel.id}"]`);
        if (!el) continue;
        const [s, e] = sceneSpan(panel.scenes);
        const len = e - s;
        const [h0, h1] = panel.hold ?? [0.2, 0.8];
        const fade = len * FADE;
        const inAt = Math.max(0, s + len * h0 - fade);
        gsap.set(el, { autoAlpha: 0, y: 40 });
        tl.to(el, { autoAlpha: 1, y: 0, duration: fade, ease: "power1.out" }, inAt);
        if (h1 < 1) tl.to(el, { autoAlpha: 0, y: -40, duration: fade, ease: "power1.in" }, s + len * h1);
      }
      tl.set({}, {}, 1); // timeline length = 1 so positions are scroll fractions
    },
    { scope: root },
  );

  return (
    <div ref={root} className="pointer-events-none absolute inset-0 z-10">
      {/* Hero */}
      <div data-hero className="absolute inset-x-0 bottom-[max(6rem,14svh)] px-5 text-center md:bottom-[max(6rem,16svh)]">
        <h1 className="mx-auto max-w-4xl font-heading text-[clamp(1.85rem,min(6vw,8.5svh),5.25rem)] leading-[1.02] font-extrabold tracking-tight text-ink text-balance">
          {hero.title}
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-[clamp(0.95rem,1.6vw,1.25rem)] sm:mt-5 text-ink/70 text-pretty">{hero.subline}</p>
        <dl className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-ink/70 [@media(max-height:560px)]:hidden">
          {hero.facts.map((f) => (
            <div key={f.label} className="flex items-baseline gap-2">
              <dt className="sr-only">{f.label}</dt>
              <dd className="font-heading text-2xl font-bold text-gold">{f.value}</dd>
              <span aria-hidden="true">{f.label}</span>
            </div>
          ))}
        </dl>
      </div>
      <div data-cue className="absolute inset-x-0 bottom-6 flex flex-col items-center gap-2 text-[11px] font-semibold tracking-[0.3em] text-ink/60 uppercase">
        {hero.scrollCue}
        <span className="relative block h-10 w-px overflow-hidden bg-ink/15" aria-hidden="true">
          <span className="absolute inset-x-0 top-0 h-1/2 animate-scroll-cue bg-gold" />
        </span>
      </div>

      {/* Story panels */}
      {storyPanels.map((p) => (
        <Panel key={p.id} panel={p} onCta={() => p.cta && scrollTo(p.cta.target)} />
      ))}
    </div>
  );
}

function Panel({ panel, onCta }: { panel: StoryPanel; onCta: () => void }) {
  const light = panel.tone === "light";
  const pos =
    panel.align === "center"
      ? "inset-x-0 bottom-[12svh] mx-auto text-center items-center"
      : panel.align === "left"
        ? "left-5 md:left-[6vw] top-[max(96px,18svh)] md:top-[max(96px,22svh)]"
        : "right-5 md:right-[6vw] top-[max(96px,18svh)] md:top-[max(96px,22svh)] md:text-right md:items-end";
  return (
    <div
      data-panel={panel.id}
      className={`invisible absolute flex max-w-[min(34rem,calc(100vw-2.5rem))] flex-col opacity-0 ${pos} ${
        panel.align === "center" ? "max-w-[min(46rem,calc(100vw-2.5rem))]" : ""
      }`}
    >
      <div
        className={`rounded-2xl px-5 py-4 sm:px-6 sm:py-5 md:px-8 md:py-7 ${
          light
            ? "bg-black/30 text-white shadow-2xl ring-1 ring-white/15 backdrop-blur-md"
            : "bg-white/70 text-ink shadow-[0_20px_60px_-20px_rgba(0,0,0,0.25)] ring-1 ring-black/5 backdrop-blur-md"
        }`}
      >
        {panel.eyebrow && (
          <p className={`mb-3 text-[11px] font-semibold tracking-[0.28em] uppercase ${light ? "text-saffron" : "text-gold-dark"}`}>
            {panel.eyebrow}
          </p>
        )}
        <h2 className="font-heading text-[clamp(1.4rem,min(3.4vw,6.5svh),3rem)] leading-[1.08] font-bold tracking-tight text-balance">
          {panel.title}
        </h2>
        {panel.body && <p className={`mt-4 text-base md:text-lg ${light ? "text-white/80" : "text-ink/70"}`}>{panel.body}</p>}
        {panel.cta && (
          <div className="pointer-events-auto mt-7">
            <MagneticButton onClick={onCta} variant="gold">
              {panel.cta.label}
            </MagneticButton>
          </div>
        )}
      </div>
    </div>
  );
}
