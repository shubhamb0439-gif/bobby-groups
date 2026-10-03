"use client";

import Image from "next/image";
import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";

type Props = { name: string; image: string | null; tint: string[]; index: number; wide?: boolean };

export function SpiceCard({ name, image, tint, index, wide = false }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    (_, contextSafe) => {
      const el = ref.current;
      if (!el || !contextSafe) return;
      if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      const rx = gsap.quickTo(el, "rotationX", { duration: 0.6, ease: "power3.out" });
      const ry = gsap.quickTo(el, "rotationY", { duration: 0.6, ease: "power3.out" });
      gsap.set(el, { transformPerspective: 900 });
      const move = contextSafe((e: PointerEvent) => {
        const r = el.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        ry(px * 10);
        rx(-py * 10);
        el.style.setProperty("--mx", `${(px + 0.5) * 100}%`);
        el.style.setProperty("--my", `${(py + 0.5) * 100}%`);
      });
      const leave = contextSafe(() => {
        rx(0);
        ry(0);
      });
      el.addEventListener("pointermove", move);
      el.addEventListener("pointerleave", leave);
      return () => {
        el.removeEventListener("pointermove", move);
        el.removeEventListener("pointerleave", leave);
      };
    },
    { scope: ref },
  );

  return (
    <div
      ref={ref}
      data-cursor
      className={`group relative overflow-hidden rounded-xl sm:rounded-2xl ${wide ? "aspect-[2/1] lg:aspect-[4/5]" : "aspect-[3/4] sm:aspect-[4/5]"} bg-ink shadow-[0_30px_60px_-35px_rgba(0,0,0,0.45)] will-change-transform`}
    >
      <div className="absolute inset-0 transition-transform duration-[1.2s] ease-[cubic-bezier(.2,.7,.2,1)] group-hover:scale-110">
        {image ? (
          <Image src={image} alt={name} fill sizes={wide ? "(min-width: 1024px) 33vw, 100vw" : "(min-width: 1024px) 33vw, 50vw"} className="object-cover" />
        ) : (
          <div
            role="img"
            aria-label={`${name} (photo coming soon)`}
            className="h-full w-full"
            style={{
              background: `radial-gradient(120% 90% at 30% 20%, ${tint[0]} 0%, ${tint[1]} 70%, #120c08 100%)`,
            }}
          >
            <span
              aria-hidden="true"
              className="absolute inset-0 opacity-25 mix-blend-overlay"
              style={{
                backgroundImage: "radial-gradient(rgba(255,255,255,.55) 1px, transparent 1.5px)",
                backgroundSize: "14px 14px",
              }}
            />
          </div>
        )}
      </div>
      {/* Hover glare that follows the cursor */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{ background: "radial-gradient(400px circle at var(--mx,50%) var(--my,50%), rgba(255,255,255,.18), transparent 60%)" }}
      />
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent p-4 pt-14 sm:p-6 sm:pt-20">
        <p className="font-heading text-xs font-semibold text-white/60 tabular-nums">{String(index + 1).padStart(2, "0")}</p>
        <h3 className="mt-1 font-heading text-base leading-tight font-bold text-white sm:text-2xl">{name}</h3>
      </div>
    </div>
  );
}
