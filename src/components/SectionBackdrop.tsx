type Variant = "paper" | "cream" | "ink";

type Props = {
  variant: Variant;
  /** Where the spice line-art is strongest; it fades out toward the opposite side. */
  pattern?: "left" | "right" | "top" | "none";
};

const base: Record<Variant, string> = {
  paper: "bg-paper",
  cream: "bg-cream",
  ink: "bg-ink",
};

const patternMask: Record<Exclude<Props["pattern"], "none" | undefined>, string> = {
  left: "radial-gradient(70% 80% at 0% 40%, #000 0%, transparent 75%)",
  right: "radial-gradient(70% 80% at 100% 40%, #000 0%, transparent 75%)",
  top: "radial-gradient(90% 60% at 50% 0%, #000 0%, transparent 80%)",
};

/**
 * Layered, static background for content sections: base color, warm glows,
 * faint spice line-art (gently parallaxed) and film grain. Sits behind content
 * via `-z-10`; the parent section needs `relative isolate overflow-hidden`.
 */
export function SectionBackdrop({ variant, pattern = "right" }: Props) {
  const dark = variant === "ink";
  return (
    <div aria-hidden="true" className={`pointer-events-none absolute inset-0 -z-10 ${base[variant]}`}>
      {/* Warm glows */}
      <div
        className="absolute inset-0"
        style={{
          background: dark
            ? "radial-gradient(60% 50% at 15% 0%, rgba(133,112,79,0.28), transparent 70%), radial-gradient(50% 45% at 100% 100%, rgba(184,50,28,0.12), transparent 70%)"
            : variant === "cream"
              ? "radial-gradient(55% 45% at 100% 0%, rgba(232,163,23,0.10), transparent 70%), radial-gradient(50% 50% at 0% 100%, rgba(133,112,79,0.12), transparent 70%)"
              : "radial-gradient(50% 40% at 0% 100%, rgba(127,161,74,0.08), transparent 70%), radial-gradient(45% 40% at 100% 20%, rgba(133,112,79,0.10), transparent 70%)",
        }}
      />
      {/* Fine linen weave on light sections */}
      {!dark && (
        <div
          className="absolute inset-0 opacity-[0.5]"
          style={{
            backgroundImage:
              "repeating-linear-gradient(0deg, rgba(20,18,16,0.018) 0 1px, transparent 1px 3px), repeating-linear-gradient(90deg, rgba(20,18,16,0.014) 0 1px, transparent 1px 4px)",
          }}
        />
      )}
      {/* Spice line-art */}
      {pattern !== "none" && (
        <div
          data-parallax="4"
          className={`bg-spice-pattern absolute -inset-y-[10%] inset-x-0 ${dark ? "opacity-[0.1]" : "opacity-[0.15]"}`}
          style={{ maskImage: patternMask[pattern], WebkitMaskImage: patternMask[pattern] }}
        />
      )}
      {/* Grain */}
      <div className={`bg-grain absolute inset-0 ${dark ? "opacity-40 mix-blend-screen" : "opacity-45 mix-blend-multiply"}`} />
      {/* Hairline at the top edge */}
      <div className={`absolute inset-x-0 top-0 h-px ${dark ? "bg-white/8" : "bg-gradient-to-r from-transparent via-gold/30 to-transparent"}`} />
    </div>
  );
}
