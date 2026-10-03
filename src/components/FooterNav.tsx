"use client";

import { site } from "@/config/site";
import { useSmoothScroll } from "./SmoothScrollProvider";

export function FooterNav() {
  const { scrollTo } = useSmoothScroll();
  return (
    <nav aria-label="Footer">
      <ul className="mt-5 flex flex-col gap-3 text-sm">
        {site.nav.map(({ id, label }) => (
          <li key={id}>
            <a
              href={`#${id}`}
              onClick={(e) => {
                e.preventDefault();
                scrollTo(id);
              }}
              className="text-white/70 transition-colors hover:text-white"
            >
              {label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
