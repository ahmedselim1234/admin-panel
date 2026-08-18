"use client";

import { Tooltip } from "@/components/ui/tooltip";
import { formatNumber } from "@/lib/utils";
import type { HeatmapCell } from "@/types";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

/**
 * Sales density by weekday and hour. Built with a plain CSS grid rather than a
 * chart library — it renders faster and stays crisp at any size.
 */
export function SalesHeatmap({ data }: { data: HeatmapCell[] }) {
  const max = Math.max(...data.map((cell) => cell.value), 1);
  const byKey = new Map(data.map((cell) => [`${cell.day}-${cell.hour}`, cell.value]));

  return (
    <div className="overflow-x-auto scrollbar-thin pb-1">
      <div className="min-w-[42rem]">
        <div className="mb-1.5 grid grid-cols-[2.5rem_repeat(24,minmax(0,1fr))] gap-1">
          <span />
          {Array.from({ length: 24 }, (_, hour) => (
            <span
              key={hour}
              className="text-center text-[10px] tabular-nums text-muted-foreground"
            >
              {hour % 3 === 0 ? hour : ""}
            </span>
          ))}
        </div>

        <div className="space-y-1">
          {DAYS.map((label, day) => (
            <div
              key={label}
              className="grid grid-cols-[2.5rem_repeat(24,minmax(0,1fr))] items-center gap-1"
            >
              <span className="text-[11px] font-medium text-muted-foreground">{label}</span>
              {Array.from({ length: 24 }, (_, hour) => {
                const value = byKey.get(`${day}-${hour}`) ?? 0;
                const intensity = value / max;
                return (
                  <Tooltip
                    key={hour}
                    content={`${label} ${String(hour).padStart(2, "0")}:00 — ${formatNumber(value)} orders`}
                  >
                    <div
                      tabIndex={0}
                      className="aspect-square rounded-[3px] ring-offset-1 transition-transform hover:scale-[1.18] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
                      style={{
                        backgroundColor: `color-mix(in oklab, var(--brand-600) ${Math.round(
                          8 + intensity * 92,
                        )}%, var(--surface-muted))`,
                      }}
                    />
                  </Tooltip>
                );
              })}
            </div>
          ))}
        </div>

        <div className="mt-4 flex items-center justify-end gap-2 text-[11px] text-muted-foreground">
          <span>Less</span>
          {[10, 30, 50, 75, 100].map((step) => (
            <span
              key={step}
              className="size-3 rounded-[3px]"
              style={{
                backgroundColor: `color-mix(in oklab, var(--brand-600) ${step}%, var(--surface-muted))`,
              }}
            />
          ))}
          <span>More</span>
        </div>
      </div>
    </div>
  );
}
