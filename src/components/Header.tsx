"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { site, type SectionId } from "@/config/site";
import { useSmoothScroll } from "./SmoothScrollProvider";
import { MagneticButton } from "./MagneticButton";
import { Logo } from "./Logo";

export function Header() {
  const { scrollTo, lock } = useSmoothScroll();
  const headerRef = useRef<HTMLElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const menuTl = useRef<gsap.core.Timeline | null>(null);
  const [active, setActive] = useState<SectionId | null>(null);
  const [open, setOpen] = useState(false);

  // Scrolled state + active section tracking.
  useGSAP(() => {
    const header = headerRef.current!;
    ScrollTrigger.create({
      start: 0,
      end: "max",
      onUpdate: (self) => header.toggleAttribute("data-scrolled", self.scroll() > 24),
    });
    for (const { id } of site.nav) {
      const el = document.getElementById(id);
      if (!el) continue;
      ScrollTrigger.create({
        trigger: el,
        start: "top 45%",
        end: "bottom 45%",
        onToggle: (self) => {
          if (self.isActive) setActive(id);
          else setActive((cur) => (cur === id ? null : cur));
        },
      });
    }
  });

  // Mobile menu timeline.
  useGSAP(
    () => {
      menuTl.current = gsap
        .timeline({ paused: true })
        .to(menuRef.current, { autoAlpha: 1, duration: 0.35, ease: "power2.out" })
        .from("[data-menu-item]", { y: 48, autoAlpha: 0, duration: 0.6, stagger: 0.07, ease: "power3.out" }, "-=0.1");
    },
    { scope: menuRef },
  );

  useEffect(() => {
    const tl = menuTl.current;
    if (!tl) return;
    if (open) {
      lock("menu", true);
      tl.timeScale(1).play();
      // Links are visibility:hidden until their stagger starts; focus once they're shown.
      const t = setTimeout(() => menuRef.current?.querySelector<HTMLElement>("a,button")?.focus(), 450);
      return () => clearTimeout(t);
    } else {
      tl.timeScale(1.6).reverse();
      lock("menu", false);
    }
  }, [open, lock]);

  // Esc closes; Tab stays inside the open menu (+ toggle button).
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        toggleRef.current?.focus();
        return;
      }
      if (e.key !== "Tab") return;
      const focusables = [toggleRef.current, ...Array.from(menuRef.current?.querySelectorAll<HTMLElement>("a,button") ?? [])].filter(
        Boolean,
      ) as HTMLElement[];
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  // Close the menu if the viewport grows past the mobile layout.
  useEffect(() => {
    const mql = window.matchMedia("(min-width: 1024px)");
    const onChange = () => mql.matches && setOpen(false);
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  const go = useCallback(
    (id: string) => (e: React.MouseEvent) => {
      e.preventDefault();
      setOpen(false);
      scrollTo(id);
    },
    [scrollTo],
  );

  return (
    <>
      <header
        ref={headerRef}
        className="group/header fixed inset-x-0 top-0 z-50 h-[72px] border-b border-white/10 bg-black/70 shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_10px_30px_-20px_rgba(0,0,0,0.6)] backdrop-blur-xl transition-[background-color,backdrop-filter] duration-500 data-[scrolled]:bg-black/85 data-[scrolled]:backdrop-blur-2xl"
      >
        <div className="mx-auto flex h-full max-w-[1440px] items-center justify-between gap-6 px-5 md:px-8">
          <a href="#top" onClick={go("top")} className="-m-2 rounded-md p-2" aria-label="Bobby Group, back to top">
            <Logo className="h-10 w-auto md:h-11" priority />
          </a>

          <nav aria-label="Primary" className="hidden items-center gap-1 lg:flex">
            {site.nav.map(({ id, label }) => (
              <a
                key={id}
                href={`#${id}`}
                onClick={go(id)}
                aria-current={active === id ? "true" : undefined}
                className="relative rounded-full px-4 py-2 text-sm font-medium text-white/70 transition-colors hover:text-white aria-[current]:text-white"
              >
                {label}
                <span
                  aria-hidden="true"
                  className={`absolute inset-x-4 -bottom-0.5 h-px origin-left bg-gold transition-transform duration-500 ${
                    active === id ? "scale-x-100" : "scale-x-0"
                  }`}
                />
              </a>
            ))}
            <span className="ml-3">
              <MagneticButton href="#contact" onClick={go("contact")} variant="gold">
                Get a Quote
              </MagneticButton>
            </span>
          </nav>

          <button
            ref={toggleRef}
            type="button"
            className="relative -mr-2 flex h-11 w-11 items-center justify-center rounded-full text-white lg:hidden"
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((o) => !o)}
          >
            <span className="relative block h-3.5 w-6" aria-hidden="true">
              <span className={`absolute left-0 h-px w-6 bg-current transition-all duration-300 ${open ? "top-1/2 rotate-45" : "top-0"}`} />
              <span className={`absolute top-1/2 left-0 h-px w-6 bg-current transition-opacity duration-300 ${open ? "opacity-0" : ""}`} />
              <span className={`absolute left-0 h-px w-6 bg-current transition-all duration-300 ${open ? "top-1/2 -rotate-45" : "top-full"}`} />
            </span>
          </button>
        </div>
      </header>

      <div
        id="mobile-menu"
        ref={menuRef}
        role="dialog"
        aria-modal="true"
        aria-label="Site menu"
        inert={!open}
        className="invisible fixed inset-0 z-40 flex flex-col justify-between bg-black/90 px-6 pt-[104px] pb-10 opacity-0 backdrop-blur-2xl lg:hidden"
      >
        <nav aria-label="Mobile">
          <ul className="flex flex-col gap-1">
            {site.nav.map(({ id, label }, i) => (
              <li key={id} data-menu-item>
                <a
                  href={`#${id}`}
                  onClick={go(id)}
                  aria-current={active === id ? "true" : undefined}
                  className="flex items-baseline gap-4 py-2 font-heading text-[clamp(2rem,9vw,3rem)] font-bold text-white/85 transition-colors hover:text-white aria-[current]:text-gold-light"
                >
                  <span className="font-sans text-xs font-medium text-white/60 tabular-nums">0{i + 1}</span>
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <div data-menu-item className="flex flex-col gap-6">
          <MagneticButton href="#contact" onClick={go("contact")} variant="gold" className="w-full py-4 text-base">
            Get a Quote
          </MagneticButton>
          <div className="text-sm text-white/65">
            <a href={site.contact.phoneHref} className="block py-1 hover:text-white">
              {site.contact.phone}
            </a>
            <a href={`mailto:${site.contact.email}`} className="block py-1 hover:text-white">
              {site.contact.email}
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
