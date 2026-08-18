"use client";

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { AXIS_PROPS, CHART_COLORS, ChartTooltip, GRID_PROPS } from "./chart-primitives";
import { formatMonthYear, formatNumber } from "@/lib/utils";

export interface GrowthPoint {
  month: string;
  customers: number;
  cumulative: number;
}

export function CustomerGrowthChart({
  data,
  height = 200,
}: {
  data: GrowthPoint[];
  height?: number;
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
        <defs>
          <linearGradient id="growth-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={CHART_COLORS.cyan} stopOpacity={0.3} />
            <stop offset="100%" stopColor={CHART_COLORS.cyan} stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <CartesianGrid {...GRID_PROPS} />
        <XAxis
          dataKey="month"
          {...AXIS_PROPS}
          dy={6}
          minTickGap={16}
          tickFormatter={(value: string) => formatMonthYear(`${value}-01`)}
        />
        <YAxis {...AXIS_PROPS} width={40} allowDecimals={false} />
        <Tooltip
          cursor={{ stroke: CHART_COLORS.cyan, strokeWidth: 1, strokeDasharray: "4 4" }}
          content={({ active, payload, label }) => {
            if (!active || !payload?.length) return null;
            const point = payload[0].payload as GrowthPoint;
            return (
              <ChartTooltip
                title={formatMonthYear(`${String(label)}-01`)}
                rows={[
                  {
                    label: "New customers",
                    value: formatNumber(point.customers),
                    color: CHART_COLORS.cyan,
                  },
                  { label: "Total", value: formatNumber(point.cumulative) },
                ]}
              />
            );
          }}
        />
        <Area
          type="monotone"
          dataKey="customers"
          stroke={CHART_COLORS.cyan}
          strokeWidth={2}
          fill="url(#growth-fill)"
          activeDot={{ r: 3.5, strokeWidth: 2, stroke: "var(--surface)" }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
