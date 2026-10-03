type Props = {
  id: string;
  eyebrow: string;
  title: string;
  intro?: string;
  align?: "left" | "center";
  tone?: "dark" | "light";
};

export function SectionHeading({ id, eyebrow, title, intro, align = "left", tone = "dark" }: Props) {
  const center = align === "center";
  return (
    <div className={`max-w-3xl ${center ? "mx-auto text-center" : ""}`}>
      <p
        data-reveal
        className={`mb-4 inline-flex items-center gap-3 text-xs font-semibold tracking-[0.28em] uppercase ${
          tone === "light" ? "text-gold-light" : "text-gold-dark"
        }`}
      >
        <span className="h-px w-8 bg-gold" aria-hidden="true" />
        {eyebrow}
      </p>
      <h2
        id={`${id}-title`}
        data-reveal
        className={`font-heading text-[clamp(2rem,4.4vw,3.6rem)] leading-[1.05] font-bold tracking-tight text-balance ${
          tone === "light" ? "text-white" : "text-ink"
        }`}
      >
        {title}
      </h2>
      {intro && (
        <p data-reveal className={`mt-6 text-lg leading-relaxed text-pretty ${tone === "light" ? "text-white/70" : "text-ink/65"}`}>
          {intro}
        </p>
      )}
    </div>
  );
}
