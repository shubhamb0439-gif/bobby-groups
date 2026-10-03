import { site } from "@/config/site";
import { Logo } from "./Logo";
import { FooterNav } from "./FooterNav";

const socialIcons: Record<string, React.ReactNode> = {
  LinkedIn: <path d="M6.5 9.5V18M6.5 6.5v.01M10.5 18v-5a3 3 0 0 1 6 0v5M10.5 9.5V18" />,
  Instagram: (
    <>
      <rect x="4" y="4" width="16" height="16" rx="4.5" />
      <circle cx="12" cy="12" r="3.5" />
      <path d="M16.8 7.2v.01" />
    </>
  ),
  Facebook: <path d="M14.5 8H16V4.5h-2.2C11.4 4.5 10 6 10 8.3V11H8v3.3h2V20h3.3v-5.7h2.4L16 11h-2.7V8.9c0-.6.4-.9 1.2-.9Z" />,
  WhatsApp: (
    <>
      <path d="M4.5 19.5 5.6 16A8 8 0 1 1 8.3 18.6l-3.8.9Z" />
      <path d="M9.2 8.6c.2-.5.6-.5.9-.5h.3c.2 0 .4.1.5.4l.6 1.5c0 .2 0 .4-.1.5l-.5.6c.6 1.2 1.6 2.1 2.8 2.7l.6-.6c.1-.1.3-.2.5-.1l1.5.6c.3.1.4.3.4.5v.3c0 .4-.2.8-.6 1-1 .6-2.7.3-4.6-1.4s-2.6-3.3-2.4-4.3c0-.1 0-.1.1-.2Z" />
    </>
  ),
};

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="relative isolate overflow-hidden bg-black text-white">
      <div aria-hidden="true" className="bg-grain pointer-events-none absolute inset-0 -z-10 opacity-50 mix-blend-screen" />
      <div className="mx-auto max-w-7xl px-5 pt-20 pb-10 md:px-8">
        <div className="grid gap-12 md:grid-cols-12">
          <div className="md:col-span-5">
            <Logo className="h-14 w-auto" />
            <p className="mt-6 max-w-sm text-sm leading-relaxed text-white/65">{site.description}</p>
            <ul className="mt-8 flex gap-3" aria-label="Social media">
              {site.social.map((s) => (
                <li key={s.name}>
                  {s.href ? (
                    <a
                      href={s.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={s.name}
                      className="flex h-11 w-11 items-center justify-center rounded-full border border-white/15 text-white/70 transition-colors hover:border-gold hover:text-gold-light"
                    >
                      <SocialIcon name={s.name} />
                    </a>
                  ) : (
                    <span
                      title={`${s.name} (coming soon)`}
                      className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 text-white/45"
                    >
                      <SocialIcon name={s.name} />
                      <span className="sr-only">{s.name} (coming soon)</span>
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>

          <div className="md:col-span-3">
            <h2 className="text-xs font-semibold tracking-[0.24em] text-white/60 uppercase">Explore</h2>
            <FooterNav />
          </div>

          <div className="md:col-span-4">
            <h2 className="text-xs font-semibold tracking-[0.24em] text-white/60 uppercase">Contact</h2>
            <address className="mt-5 flex flex-col gap-3 text-sm text-white/70 not-italic">
              <span>{site.contact.addressLine}</span>
              <a href={site.contact.phoneHref} className="w-fit hover:text-white">
                {site.contact.phone}
              </a>
              <a href={`mailto:${site.contact.email}`} className="w-fit hover:text-white">
                {site.contact.email}
              </a>
            </address>
          </div>
        </div>

        <div className="mt-16 flex flex-col gap-3 border-t border-white/10 pt-8 text-xs text-white/60 sm:flex-row sm:justify-between">
          <p>© {year} Bobby Group. All rights reserved.</p>
          <p>Premium Indian spices &amp; coffee, exported worldwide.</p>
        </div>
      </div>
    </footer>
  );
}

function SocialIcon({ name }: { name: string }) {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {socialIcons[name]}
    </svg>
  );
}
