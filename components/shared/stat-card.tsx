"use client";

import { ArrowDownRight, ArrowUpRight, type LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Sparkline } from "@/components/charts/chart-primitives";
import { cn, formatPercent } from "@/lib/utils";

export function StatCard({
  label,
  value,
  change,
  comparison,
  icon: Icon,
  trend,
  invertTrend = false,
  isLoading = false,
}: {
  label: string;
  value: string;
  change?: number;
  comparison?: string;
  icon: LucideIcon;
  trend?: number[];
  /** For metrics where "down" is good (e.g. refunds). */
  invertTrend?: boolean;
  isLoading?: boolean;
}) {
  if (isLoading) {
    return (
      <Card className="p-5">
        <div className="flex items-start justify-between">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="size-9 rounded-xl" />
        </div>
        <Skeleton className="mt-4 h-8 w-32" />
        <Skeleton className="mt-3 h-4 w-40" />
      </Card>
    );
  }

  const up = (change ?? 0) >= 0;
  const good = invertTrend ? !up : up;

  return (
    <Card className="group relative overflow-hidden p-5 transition-shadow hover:card-shadow-lg">
      <div
        className="pointer-events-none absolute -top-16 -right-10 size-32 rounded-full bg-brand-500/[0.06] blur-2xl transition-opacity group-hover:opacity-100 md:opacity-0"
        aria-hidden
      />

      <div className="relative flex items-start justify-between gap-3">
        <p className="text-[13px] font-medium text-muted-foreground">{label}</p>
        <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-900/40 dark:text-brand-300">
          <Icon className="size-4.5" />
        </span>
      </div>

      <p className="relative mt-3 text-2xl font-semibold tracking-tight text-foreground tabular-nums">
        {value}
      </p>

      <div className="relative mt-3 flex items-end justify-between gap-3">
        <div className="min-w-0">
          {change !== undefined ? (
            <span
              className={cn(
                "inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[12px] font-semibold",
                good ? "bg-success-soft text-success" : "bg-danger-soft text-danger",
              )}
            >
              {up ? <ArrowUpRight className="size-3.5" /> : <ArrowDownRight className="size-3.5" />}
              {formatPercent(change)}
            </span>
          ) : null}
          {comparison ? (
            <p className="mt-1.5 truncate text-[12px] text-muted-foreground">{comparison}</p>
          ) : null}
        </div>

        {trend?.length ? <Sparkline points={trend} positive={good} /> : null}
      </div>
    </Card>
  );
}
