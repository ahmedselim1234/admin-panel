import { cn, hashHue, initials } from "@/lib/utils";

const sizes = {
  sm: "size-9 rounded-lg text-[10px]",
  md: "size-11 rounded-xl text-xs",
  lg: "size-16 rounded-xl text-sm",
  xl: "size-full rounded-2xl text-2xl",
};

/**
 * Product artwork is generated from the product name so the demo stays fully
 * self-contained (no external image host, no broken thumbnails, no CLS).
 */
export function ProductThumb({
  name,
  seed,
  size = "md",
  className,
}: {
  name: string;
  seed?: string;
  size?: keyof typeof sizes;
  className?: string;
}) {
  const hue = hashHue(seed ?? name);
  return (
    <span
      aria-hidden
      className={cn(
        "flex shrink-0 items-center justify-center font-semibold tracking-wide text-white/95 ring-1 ring-black/5",
        sizes[size],
        className,
      )}
      style={{
        backgroundImage: `linear-gradient(135deg, hsl(${hue} 72% 58%), hsl(${(hue + 38) % 360} 78% 42%))`,
      }}
    >
      {initials(name)}
    </span>
  );
}
