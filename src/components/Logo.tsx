import Image from "next/image";

/** White wordmark on transparent (generated from assets/logo by `npm run logo`). */
export function Logo({ className = "h-9 w-auto", priority = false }: { className?: string; priority?: boolean }) {
  return <Image src="/brand/logo.png" alt="Bobby Group" width={680} height={264} priority={priority} className={className} />;
}
