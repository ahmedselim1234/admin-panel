import { cn, initials } from "@/lib/utils";

const sizes = {
  sm: "size-7 text-[11px]",
  md: "size-9 text-xs",
  lg: "size-12 text-sm",
  xl: "size-16 text-lg",
};

export function Avatar({
  name,
  color = "#2563EB",
  size = "md",
  className,
}: {
  name: string;
  color?: string;
  size?: keyof typeof sizes;
  className?: string;
}) {
  return (
    <span
      aria-hidden
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full font-semibold text-white",
        sizes[size],
        className,
      )}
      style={{ background: `linear-gradient(140deg, ${color}, ${color}b3)` }}
    >
      {initials(name)}
    </span>
  );
}
