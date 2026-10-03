import { about } from "@/config/content";
import { sequenceColors } from "@/lib/sequence";
import { SectionBackdrop } from "@/components/SectionBackdrop";
import { Reveal } from "@/components/Reveal";
import { SectionHeading } from "@/components/SectionHeading";

export function About() {
  return (
    <Reveal id="about" aria-labelledby="about-title" className="relative isolate overflow-hidden">
      <SectionBackdrop variant="paper" pattern="right" />
      {/* Blends the last (ocean) video frame into the white page. */}
      <div
        aria-hidden="true"
        className="h-24 md:h-40"
        style={{ background: `linear-gradient(${sequenceColors.endBottom}, var(--color-paper))` }}
      />
      <span
        aria-hidden="true"
        data-parallax="18"
        className="pointer-events-none absolute top-32 -right-10 font-heading text-[22vw] leading-none font-extrabold text-ink/[0.03] select-none"
      >
        BOBBY
      </span>
      <div className="relative mx-auto grid max-w-7xl gap-14 px-5 py-20 md:px-8 md:py-28 lg:grid-cols-12 lg:gap-20">
        <div className="lg:col-span-7">
          <SectionHeading id="about" eyebrow={about.eyebrow} title={about.title} />
          <p data-reveal className="mt-8 text-lg leading-relaxed text-ink/75 md:text-xl md:leading-relaxed">
            {about.lead}
          </p>
        </div>
        <div className="flex flex-col gap-6 lg:col-span-5 lg:pt-24">
          {about.pillars.map((p, i) => (
            <article
              key={p.title}
              data-reveal
              className="group relative overflow-hidden rounded-2xl border border-ink/8 bg-white p-8 shadow-[0_30px_60px_-40px_rgba(0,0,0,0.35)]"
            >
              <span
                aria-hidden="true"
                className="absolute inset-y-0 left-0 w-1 origin-top scale-y-0 bg-gradient-to-b from-gold to-saffron transition-transform duration-700 group-hover:scale-y-100"
              />
              <p className="font-heading text-sm font-semibold text-gold tabular-nums">0{i + 1}</p>
              <h3 className="mt-3 font-heading text-2xl font-bold text-ink">{p.title}</h3>
              <p className="mt-3 leading-relaxed text-ink/70">{p.body}</p>
            </article>
          ))}
        </div>
      </div>
    </Reveal>
  );
}
