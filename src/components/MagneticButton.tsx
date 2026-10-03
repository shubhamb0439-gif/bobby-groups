"use client";

import { useRef, type ReactNode } from "react";
import { gsap, useGSAP } from "@/lib/gsap";

type Props = {
  children: ReactNode;
  href?: string;
  onClick?: (e: React.MouseEvent) => void;
  variant?: "gold" | "outline" | "dark";
  type?: "button" | "submit";
  disabled?: boolean;
  className?: string;
};

const variants = {
  gold: "bg-gold text-white hover:bg-gold-dark shadow-[0_10px_30px_-10px_rgba(133,112,79,0.7)]",
  outline: "border border-current/30 hover:border-current",
  dark: "bg-ink text-white hover:bg-black",
};

/** Button/link that leans toward the cursor on fine pointers (no-op on touch or reduced motion). */
export function MagneticButton({ children, href, onClick, variant = "gold", type = "button", disabled, className = "" }: Props) {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    (_, contextSafe) => {
      const el = ref.current;
      if (!el || !contextSafe) return;
      if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      const inner = el.querySelector("[data-magnet]");
      const xTo = gsap.quickTo(el, "x", { duration: 0.5, ease: "power3.out" });
      const yTo = gsap.quickTo(el, "y", { duration: 0.5, ease: "power3.out" });
      const ixTo = inner && gsap.quickTo(inner, "x", { duration: 0.5, ease: "power3.out" });
      const iyTo = inner && gsap.quickTo(inner, "y", { duration: 0.5, ease: "power3.out" });
      const move = contextSafe((e: PointerEvent) => {
        const r = el.getBoundingClientRect();
        const dx = e.clientX - (r.left + r.width / 2);
        const dy = e.clientY - (r.top + r.height / 2);
        xTo(dx * 0.3);
        yTo(dy * 0.35);
        ixTo?.(dx * 0.12);
        iyTo?.(dy * 0.12);
      });
      const leave = contextSafe(() => {
        xTo(0);
        yTo(0);
        ixTo?.(0);
        iyTo?.(0);
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

  const cls = `inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold tracking-wide transition-colors duration-300 will-change-transform disabled:cursor-not-allowed disabled:opacity-60 ${variants[variant]} ${className}`;
  const inner = (
    <span data-magnet className="inline-flex items-center gap-2">
      {children}
    </span>
  );

  if (href) {
    return (
      <a ref={ref as React.RefObject<HTMLAnchorElement>} href={href} onClick={onClick} className={cls}>
        {inner}
      </a>
    );
  }
  return (
    <button ref={ref as React.RefObject<HTMLButtonElement>} type={type} onClick={onClick} disabled={disabled} className={cls}>
      {inner}
    </button>
  );
}
