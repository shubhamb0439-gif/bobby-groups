import { whyUs } from "@/config/content";
import { SectionBackdrop } from "@/components/SectionBackdrop";
import { Reveal } from "@/components/Reveal";
import { SectionHeading } from "@/components/SectionHeading";

type IconName = (typeof whyUs.items)[number]["icon"];

const icons: Record<IconName, React.ReactNode> = {
  sourcing: <path d="M12 21c0-5 0-8-3.5-11.5C6 7 3 7 3 7s0 3 2.5 5.5C9 16 12 15.5 12 15.5M12 21c0-4 .5-6.5 3-9 2.5-2.5 6-2.5 6-2.5s0 3.5-2.5 6c-2.5 2.5-6.5 2.5-6.5 2.5" />,
  pricing: (
    <>
      <path d="M20.6 13.4 13.4 20.6a2 2 0 0 1-2.8 0L3 13V3h10l7.6 7.6a2 2 0 0 1 0 2.8Z" />
      <circle cx="7.5" cy="7.5" r="1.5" />
    </>
  ),
  packaging: (
    <>
      <path d="m21 8-9-5-9 5v8l9 5 9-5V8Z" />
      <path d="m3 8 9 5 9-5M12 13v8M7.5 5.5l9 5" />
    </>
  ),
  bulk: (
    <>
      <path d="m12 3 9 4.5-9 4.5-9-4.5L12 3Z" />
      <path d="m3 12 9 4.5 9-4.5M3 16.5 12 21l9-4.5" />
    </>
  ),
  shipping: (
    <>
      <path d="M3 17.5c1.5 1 3 1 4.5 0s3-1 4.5 0 3 1 4.5 0 3-1 4.5 0" />
      <path d="M4.5 15 3 10h18l-2 5M6 10V6h8v4M14 7h3v3" />
    </>
  ),
  inspection: (
    <>
      <circle cx="10.5" cy="10.5" r="6.5" />
      <path d="m15.5 15.5 5 5M7.8 10.6l1.9 1.9 3.6-3.6" />
    </>
  ),
  delivery: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3.5 2" />
    </>
  ),
};

export function WhyUs() {
  return (
    <Reveal id="why-us" aria-labelledby="why-us-title" className="relative isolate overflow-hidden text-white">
      <SectionBackdrop variant="ink" pattern="left" />
      <div
        aria-hidden="true"
        data-parallax="12"
        className="pointer-events-none absolute -top-40 left-1/2 h-[640px] w-[900px] -translate-x-1/2 rounded-full opacity-40 blur-3xl"
        style={{ background: "radial-gradient(closest-side, rgba(133,112,79,.55), transparent)" }}
      />
      <div className="relative mx-auto max-w-7xl px-5 py-20 md:px-8 md:py-32">
        <SectionHeading id="why-us" eyebrow={whyUs.eyebrow} title={whyUs.title} tone="light" />
        <ul className="mt-12 grid grid-cols-1 gap-3 sm:mt-16 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4 lg:gap-5">
          {whyUs.items.map((item, i) => (
            <li
              key={item.title}
              data-reveal
              className={`group relative flex gap-4 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-5 backdrop-blur-[2px] transition-colors sm:block sm:p-7 duration-500 hover:border-gold/60 hover:bg-white/[0.06] ${
                i === 0 ? "lg:col-span-2 lg:row-span-1" : ""
              }`}
            >
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gold/15 text-gold-light ring-1 ring-gold/30 transition-transform duration-500 group-hover:-translate-y-1 group-hover:rotate-[-6deg]">
                <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  {icons[item.icon]}
                </svg>
              </span>
              <div>
                <h3 className="font-heading text-lg font-semibold sm:mt-6 sm:text-xl">{item.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-white/60 sm:mt-2">{item.body}</p>
              </div>
              <span
                aria-hidden="true"
                className="absolute right-6 bottom-6 font-heading text-xs text-white/20 tabular-nums transition-colors group-hover:text-gold-light"
              >
                {String(i + 1).padStart(2, "0")}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </Reveal>
  );
}
