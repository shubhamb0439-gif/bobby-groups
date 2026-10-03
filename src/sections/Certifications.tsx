import Image from "next/image";
import { certifications } from "@/config/content";
import { findPublicAsset } from "@/lib/publicAssets";
import { SectionBackdrop } from "@/components/SectionBackdrop";
import { Reveal } from "@/components/Reveal";
import { SectionHeading } from "@/components/SectionHeading";

export function Certifications() {
  const items = certifications.items.map((c) => ({ ...c, logo: findPublicAsset("certifications", c.slug) }));
  return (
    <Reveal id="certifications" aria-labelledby="certifications-title" className="relative isolate overflow-hidden">
      <SectionBackdrop variant="paper" pattern="top" />
      <div className="mx-auto max-w-7xl px-5 py-20 md:px-8 md:py-32">
        <SectionHeading
          id="certifications"
          eyebrow={certifications.eyebrow}
          title={certifications.title}
          intro={certifications.intro}
          align="center"
        />
        <ul className="mt-12 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-ink/8 bg-ink/8 sm:mt-16 lg:grid-cols-4">
          {items.map((c) => (
            <li key={c.slug} data-reveal className="group flex flex-col items-center justify-center gap-4 bg-white/90 px-3 py-7 text-center backdrop-blur-sm sm:gap-5 sm:px-6 sm:py-10">
              <div className="flex h-14 w-full items-center justify-center sm:h-20">
                {c.logo ? (
                  <Image
                    src={c.logo}
                    alt={`${c.org} logo`}
                    width={160}
                    height={80}
                    className="max-h-14 w-auto object-contain sm:max-h-20 opacity-70 grayscale transition duration-500 group-hover:opacity-100 group-hover:grayscale-0"
                  />
                ) : (
                  <span
                    aria-hidden="true"
                    className="flex h-14 min-w-14 items-center justify-center rounded-full border border-ink/15 px-4 font-heading text-sm font-bold sm:h-20 sm:min-w-20 sm:px-5 sm:text-lg tracking-tight text-ink/60 transition-colors duration-500 group-hover:border-gold group-hover:text-gold"
                  >
                    {c.short}
                  </span>
                )}
              </div>
              <div>
                <p className="font-heading text-sm leading-snug font-semibold text-ink sm:text-base">{c.org}</p>
                <p className="mt-1 text-xs text-ink/60 sm:text-sm">{c.name}</p>
              </div>
            </li>
          ))}
          <li data-reveal className="flex flex-col justify-center bg-ink px-5 py-7 text-white sm:px-8 sm:py-10">
            <p className="font-heading text-4xl font-bold text-gold-light sm:text-5xl">{items.length}</p>
            <p className="mt-2 text-xs text-white/70 sm:text-sm">Registrations & certifications</p>
          </li>
        </ul>
      </div>
    </Reveal>
  );
}
