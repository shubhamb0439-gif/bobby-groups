import { spices } from "@/config/content";
import { findPublicAsset } from "@/lib/publicAssets";
import { SectionBackdrop } from "@/components/SectionBackdrop";
import { Reveal } from "@/components/Reveal";
import { SectionHeading } from "@/components/SectionHeading";
import { SpiceCard } from "./SpiceCard";

/** With an odd count, the last card spans both columns on the 2-column (mobile/tablet) grid. */
const wideLast = (i: number, n: number) => n % 2 === 1 && i === n - 1;

export function Spices() {
  const items = spices.items.map((s) => ({ ...s, image: findPublicAsset("spices", s.slug) }));
  return (
    <Reveal id="spices" aria-labelledby="spices-title" className="relative isolate overflow-hidden">
      <SectionBackdrop variant="cream" pattern="left" />
      <div className="mx-auto max-w-7xl px-5 py-20 md:px-8 md:py-32">
        <div className="flex flex-col justify-between gap-8 md:flex-row md:items-end">
          <SectionHeading id="spices" eyebrow={spices.eyebrow} title={spices.title} intro={spices.intro} />
          <p data-reveal className="shrink-0 font-heading text-sm font-semibold tracking-widest text-ink/60 uppercase">
            {spices.items.length} products
          </p>
        </div>
        <ul className="mt-12 grid grid-cols-2 gap-3 sm:mt-14 sm:gap-5 lg:grid-cols-3 lg:gap-7">
          {items.map((s, i) => (
            <li key={s.slug} data-reveal className={wideLast(i, items.length) ? "col-span-2 lg:col-span-1" : undefined}>
              <SpiceCard name={s.name} image={s.image} tint={[...s.tint]} index={i} wide={wideLast(i, items.length)} />
            </li>
          ))}
        </ul>
      </div>
    </Reveal>
  );
}
