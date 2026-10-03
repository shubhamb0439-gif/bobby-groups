import { hero } from "@/config/content";
import { posterUrl } from "@/lib/sequence";

/** Reduced-motion hero: a single poster frame with the headline, no scrubbing. */
export function StaticHero() {
  return (
    <section id="top" aria-label="Bobby Group" className="relative flex min-h-svh items-end overflow-hidden bg-paper pt-[72px]">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={posterUrl} alt="A Bobby Group container ship leaving port" className="absolute inset-0 h-full w-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-t from-white via-white/70 to-transparent" aria-hidden="true" />
      <div className="relative mx-auto w-full max-w-5xl px-5 pb-[12svh] text-center">
        <h1 className="font-heading text-[clamp(2.1rem,6vw,5.25rem)] leading-[1.02] font-extrabold tracking-tight text-ink text-balance">
          {hero.title}
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-lg text-ink/75">{hero.subline}</p>
      </div>
    </section>
  );
}
