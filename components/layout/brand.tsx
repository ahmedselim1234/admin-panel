import { cn } from "@/lib/utils";

export const BRAND = {
  name: "Selim Commerce",
  subtitle: "Admin Console",
  domain: "selimcommerce.store",
  monogram: "AS",
} as const;

const SIZES = {
  sm: "size-8 rounded-[0.6rem] text-[12px]",
  md: "size-9 rounded-xl text-[13px]",
  lg: "size-11 rounded-xl text-[15px]",
} as const;

/**
 * The brand mark: an "AS" monogram in a blue gradient square, with a soft
 * highlight so it reads as a physical tile rather than a flat swatch.
 */
export function BrandMark({
  size = "md",
  className,
}: {
  size?: keyof typeof SIZES;
  className?: string;
}) {
  return (
    <span
      aria-hidden
      className={cn(
        "relative flex shrink-0 items-center justify-center overflow-hidden",
        "bg-gradient-to-br from-brand-400 via-brand-600 to-brand-900",
        "font-semibold tracking-[0.02em] text-white shadow-sm shadow-brand-700/30",
        "ring-1 ring-inset ring-white/20",
        SIZES[size],
        className,
      )}
    >
      <span
        className="absolute -top-1/2 left-0 h-full w-full bg-white/20 blur-[6px]"
        aria-hidden
      />
      <span className="relative">{BRAND.monogram}</span>
    </span>
  );
}
