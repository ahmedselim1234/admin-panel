"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  AXIS_PROPS,
  CHART_COLORS,
  ChartTooltip,
  GRID_PROPS,
} from "./chart-primitives";
import {
  formatCompact,
  formatCurrency,
  formatCurrencyCompact,
  formatDayMonth,
  formatMonthYear,
  formatNumber,
} from "@/lib/utils";
import type { DateRangeKey } from "@/types";

export interface RevenueChartPoint {
  date: string;
  label: string;
  revenue: number;
  orders: number;
  visitors: number;
}

export function RevenueChart({
  data,
  range,
  height = 300,
}: {
  data: RevenueChartPoint[];
  range: DateRangeKey;
  height?: number;
}) {
  const formatAxisDate = (value: string) =>
    range === "12m" ? formatMonthYear(value) : formatDayMonth(value);

  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -12 }}>
        <defs>
          <linearGradient id="revenue-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={CHART_COLORS.primary} stopOpacity={0.28} />
            <stop offset="100%" stopColor={CHART_COLORS.primary} stopOpacity={0.02} />
          </linearGradient>
        </defs>

        <CartesianGrid {...GRID_PROPS} />
        <XAxis
          dataKey="date"
          {...AXIS_PROPS}
          tickFormatter={formatAxisDate}
          minTickGap={28}
          dy={6}
        />
        <YAxis
          {...AXIS_PROPS}
          tickFormatter={(value: number) => formatCurrencyCompact(value)}
          width={64}
        />
        <Tooltip
          cursor={{ stroke: CHART_COLORS.primarySoft, strokeWidth: 1, strokeDasharray: "4 4" }}
          content={({ active, payload, label }) => {
            if (!active || !payload?.length) return null;
            const point = payload[0].payload as RevenueChartPoint;
            return (
              <ChartTooltip
                title={
                  range === "12m" ? formatMonthYear(String(label)) : formatDayMonth(String(label))
                }
                rows={[
                  {
                    label: "Revenue",
                    value: formatCurrency(point.revenue),
                    color: CHART_COLORS.primary,
                  },
                  {
                    label: "Orders",
                    value: formatNumber(point.orders),
                    color: CHART_COLORS.primarySoft,
                  },
                  { label: "Visitors", value: formatCompact(point.visitors) },
                ]}
              />
            );
          }}
        />

        <Area
          type="monotone"
          dataKey="revenue"
          stroke={CHART_COLORS.primary}
          strokeWidth={2.25}
          fill="url(#revenue-fill)"
          activeDot={{ r: 4, strokeWidth: 2, stroke: "var(--surface)" }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
