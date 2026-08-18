"use client";

import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { AXIS_PROPS, CATEGORICAL, ChartTooltip } from "./chart-primitives";
import { formatCurrency, formatCurrencyCompact } from "@/lib/utils";
import type { ChannelSales } from "@/types";

export function ChannelChart({ data, height = 240 }: { data: ChannelSales[]; height?: number }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart
        data={data}
        layout="vertical"
        margin={{ top: 4, right: 16, bottom: 4, left: 8 }}
        barSize={20}
      >
        <XAxis type="number" hide tickFormatter={(v: number) => formatCurrencyCompact(v)} />
        <YAxis type="category" dataKey="channel" {...AXIS_PROPS} width={104} />
        <Tooltip
          cursor={{ fill: "var(--surface-muted)" }}
          content={({ active, payload }) => {
            if (!active || !payload?.length) return null;
            const point = payload[0].payload as ChannelSales;
            return (
              <ChartTooltip
                title={point.channel}
                rows={[
                  { label: "Revenue", value: formatCurrency(point.revenue), color: CATEGORICAL[0] },
                  { label: "Share", value: `${point.share}%` },
                ]}
              />
            );
          }}
        />
        <Bar dataKey="revenue" radius={[0, 6, 6, 0]}>
          {data.map((entry, index) => (
            <Cell key={entry.channel} fill={CATEGORICAL[index % CATEGORICAL.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
