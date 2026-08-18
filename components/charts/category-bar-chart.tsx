"use client";

import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { AXIS_PROPS, CATEGORICAL, ChartTooltip, GRID_PROPS } from "./chart-primitives";
import { formatCurrency, formatCurrencyCompact, formatNumber } from "@/lib/utils";
import type { CategorySales } from "@/types";

export function CategoryBarChart({
  data,
  height = 260,
}: {
  data: CategorySales[];
  height?: number;
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -12 }} barSize={28}>
        <CartesianGrid {...GRID_PROPS} />
        <XAxis dataKey="category" {...AXIS_PROPS} interval={0} dy={6} tickFormatter={(v: string) => (v.length > 11 ? `${v.slice(0, 10)}…` : v)} />
        <YAxis {...AXIS_PROPS} width={64} tickFormatter={(v: number) => formatCurrencyCompact(v)} />
        <Tooltip
          cursor={{ fill: "var(--surface-muted)" }}
          content={({ active, payload }) => {
            if (!active || !payload?.length) return null;
            const point = payload[0].payload as CategorySales;
            return (
              <ChartTooltip
                title={point.category}
                rows={[
                  { label: "Revenue", value: formatCurrency(point.revenue), color: CATEGORICAL[0] },
                  { label: "Units", value: formatNumber(point.units) },
                ]}
              />
            );
          }}
        />
        <Bar dataKey="revenue" radius={[6, 6, 0, 0]}>
          {data.map((entry, index) => (
            <Cell key={entry.category} fill={CATEGORICAL[index % CATEGORICAL.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
