"use client";

import { cn } from "@/lib/utils";

/**
 * Chart palette. Blues carry the primary series; the supporting hues stay in
 * the same cool family so multi-series charts still read as one system.
 */
export const CHART_COLORS = {
  primary: "#2563EB",
  primarySoft: "#60A5FA",
  deep: "#1E3A8A",
  cyan: "#0891B2",
  indigo: "#6366F1",
  violet: "#7C3AED",
  success: "#16A34A",
  warning: "#F59E0B",
  danger: "#DC2626",
  slate: "#94A3B8",
} as const;

export const CATEGORICAL = [
  CHART_COLORS.primary,
  CHART_COLORS.primarySoft,
  CHART_COLORS.deep,
  CHART_COLORS.cyan,
  CHART_COLORS.indigo,
  CHART_COLORS.violet,
];

export const AXIS_PROPS = {
  stroke: "var(--muted-foreground)",
  fontSize: 11,
  tickLine: false,
  axisLine: false,
} as const;

export const GRID_PROPS = {
  stroke: "var(--border)",
  strokeDasharray: "3 3",
  vertical: false,
} as const;

export interface TooltipRow {
  label: string;
  value: string;
  color?: string;
}

export function ChartTooltip({
  title,
  rows,
  className,
}: {
  title?: string;
  rows: TooltipRow[];
  className?: string;
}) {
  return (
    <div
      className={cn(
        "min-w-36 rounded-xl border border-border bg-surface px-3 py-2.5 card-shadow-lg",
        className,
      )}
    >
      {title ? (
        <p className="mb-1.5 text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
          {title}
        </p>
      ) : null}
      <div className="space-y-1">
        {rows.map((row) => (
          <div key={row.label} className="flex items-center justify-between gap-4 text-[13px]">
            <span className="flex items-center gap-1.5 text-muted-foreground">
              {row.color ? (
                <span
                  className="size-2 rounded-full"
                  style={{ backgroundColor: row.color }}
                  aria-hidden
                />
              ) : null}
              {row.label}
            </span>
            <span className="font-semibold text-foreground tabular-nums">{row.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ChartLegend({
  items,
  className,
}: {
  items: { label: string; color: string; value?: string }[];
  className?: string;
}) {
  return (
    <ul className={cn("flex flex-wrap items-center gap-x-4 gap-y-2", className)}>
      {items.map((item) => (
        <li key={item.label} className="flex items-center gap-2 text-[13px]">
          <span
            className="size-2.5 rounded-full"
            style={{ backgroundColor: item.color }}
            aria-hidden
          />
          <span className="text-muted-foreground">{item.label}</span>
          {item.value ? (
            <span className="font-medium text-foreground tabular-nums">{item.value}</span>
          ) : null}
        </li>
      ))}
    </ul>
  );
}

export function Sparkline({
  points,
  positive = true,
  className,
}: {
  points: number[];
  positive?: boolean;
  className?: string;
}) {
  if (points.length < 2) return null;

  const width = 96;
  const height = 30;
  const min = Math.min(...points);
  const max = Math.max(...points);
  const span = max - min || 1;

  const coords = points.map((value, index) => {
    const x = (index / (points.length - 1)) * width;
    const y = height - ((value - min) / span) * (height - 4) - 2;
    return `${x.toFixed(2)},${y.toFixed(2)}`;
  });

  const color = positive ? CHART_COLORS.success : CHART_COLORS.danger;
  const id = `spark-${positive ? "up" : "down"}`;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className={cn("h-8 w-24 overflow-visible", className)}
      preserveAspectRatio="none"
      aria-hidden
    >
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.28} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
      <polygon
        points={`0,${height} ${coords.join(" ")} ${width},${height}`}
        fill={`url(#${id})`}
      />
      <polyline
        points={coords.join(" ")}
        fill="none"
        stroke={color}
        strokeWidth={1.75}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
