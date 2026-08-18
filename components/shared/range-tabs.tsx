"use client";

import { cn } from "@/lib/utils";
import type { DateRangeKey } from "@/types";

const RANGES: { key: DateRangeKey; label: string }[] = [
  { key: "7d", label: "7D" },
  { key: "30d", label: "30D" },
  { key: "90d", label: "90D" },
  { key: "12m", label: "12M" },
];

export function RangeTabs({
  value,
  onChange,
  className,
}: {
  value: DateRangeKey;
  onChange: (range: DateRangeKey) => void;
  className?: string;
}) {
  return (
    <div
      role="tablist"
      aria-label="Date range"
      className={cn(
        "inline-flex items-center gap-0.5 rounded-xl border border-border bg-surface-muted p-1",
        className,
      )}
    >
      {RANGES.map((range) => {
        const active = range.key === value;
        return (
          <button
            key={range.key}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(range.key)}
            className={cn(
              "rounded-lg px-3 py-1.5 text-[12.5px] font-medium transition-all",
              active
                ? "bg-surface text-foreground card-shadow"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {range.label}
          </button>
        );
      })}
    </div>
  );
}
