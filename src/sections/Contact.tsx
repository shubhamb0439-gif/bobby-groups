import { contact } from "@/config/content";
import { site } from "@/config/site";
import { SectionBackdrop } from "@/components/SectionBackdrop";
import { Reveal } from "@/components/Reveal";
import { SectionHeading } from "@/components/SectionHeading";
import { EnquiryForm } from "./EnquiryForm";

const details = [
  { label: "Address", value: site.contact.addressLine, href: undefined },
  { label: "Phone", value: site.contact.phone, href: site.contact.phoneHref },
  { label: "Email", value: site.contact.email, href: `mailto:${site.contact.email}` },
];

export function Contact() {
  return (
    <Reveal id="contact" aria-labelledby="contact-title" className="relative isolate overflow-hidden">
      <SectionBackdrop variant="cream" pattern="left" />
      <div className="mx-auto grid max-w-7xl gap-14 px-5 py-20 md:px-8 md:py-32 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-5">
          <SectionHeading id="contact" eyebrow={contact.eyebrow} title={contact.title} intro={contact.intro} />
          <address className="mt-12 flex flex-col gap-6 not-italic">
            {details.map((d) => (
              <div key={d.label} data-reveal className="border-t border-ink/10 pt-5">
                <p className="text-xs font-semibold tracking-[0.24em] text-ink/60 uppercase">{d.label}</p>
                {d.href ? (
                  <a href={d.href} className="mt-1 inline-block font-heading text-xl font-semibold text-ink transition-colors hover:text-gold">
                    {d.value}
                  </a>
                ) : (
                  <p className="mt-1 font-heading text-xl font-semibold text-ink">{d.value}</p>
                )}
              </div>
            ))}
          </address>
        </div>
        <div data-reveal className="lg:col-span-7">
          <EnquiryForm />
        </div>
      </div>
    </Reveal>
  );
}
