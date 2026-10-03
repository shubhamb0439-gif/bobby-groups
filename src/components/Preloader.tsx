"use client";

import { useEffect, useRef, useState } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { useLoader } from "@/lib/loaderStore";
import { useSmoothScroll } from "./SmoothScrollProvider";
import { Logo } from "./Logo";

const MIN_VISIBLE_MS = 900;
const FAILSAFE_MS = 15000;

export function Preloader() {
  const { progress, ready } = useLoader();
  const { lock } = useSmoothScroll();
  const root = useRef<HTMLDivElement>(null);
  const [gone, setGone] = useState(false);
  const [timedOut, setTimedOut] = useState(false);
  const [minElapsed, setMinElapsed] = useState(false);
  const shown = useRef(0);
  const counter = useRef<HTMLSpanElement>(null);
  const bar = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    lock("preloader", true);
    const min = setTimeout(() => setMinElapsed(true), MIN_VISIBLE_MS);
    const fail = setTimeout(() => setTimedOut(true), FAILSAFE_MS);
    return () => {
      clearTimeout(min);
      clearTimeout(fail);
      lock("preloader", false);
    };
  }, [lock]);

  // Count up smoothly toward the real progress.
  useEffect(() => {
    const target = { v: shown.current };
    const tween = gsap.to(target, {
      v: progress * 100,
      duration: 0.4,
      ease: "power1.out",
      onUpdate: () => {
        shown.current = target.v;
        if (counter.current) counter.current.textContent = String(Math.round(target.v));
        if (bar.current) bar.current.style.transform = `scaleX(${target.v / 100})`;
      },
    });
    return () => {
      tween.kill();
    };
  }, [progress]);

  const done = (ready && minElapsed) || timedOut;

  useEffect(() => {
    if (!done || !root.current) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const tl = gsap.timeline({
      onComplete: () => {
        setGone(true);
        lock("preloader", false);
        ScrollTrigger.refresh();
      },
    });
    if (reduced) {
      tl.to(root.current, { autoAlpha: 0, duration: 0.3 });
    } else {
      tl.add(() => {
        if (counter.current) counter.current.textContent = "100";
        if (bar.current) bar.current.style.transform = "scaleX(1)";
      })
        .to("[data-pl-fade]", { autoAlpha: 0, y: -16, duration: 0.45, stagger: 0.06, ease: "power2.in" }, "+=0.1")
        .to(root.current, { yPercent: -100, duration: 0.9, ease: "expo.inOut" }, "-=0.1");
    }
    return () => {
      tl.kill();
    };
  }, [done, lock]);

  if (gone) return null;

  return (
    <div
      id="preloader"
      ref={root}
      role="status"
      aria-live="polite"
      aria-label={done ? "Loaded" : "Loading"}
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black text-white"
    >
      <div data-pl-fade>
        <Logo className="h-auto w-[min(56vw,300px)]" priority />
      </div>
      <div data-pl-fade className="mt-10 flex w-[min(56vw,300px)] flex-col items-center gap-3">
        <span className="relative block h-px w-full overflow-hidden bg-white/15" aria-hidden="true">
          <span ref={bar} className="absolute inset-0 origin-left scale-x-0 bg-gold" />
        </span>
        <span className="font-heading text-xs tracking-[0.35em] text-white/60 tabular-nums">
          <span ref={counter}>0</span>%
        </span>
      </div>
    </div>
  );
}
