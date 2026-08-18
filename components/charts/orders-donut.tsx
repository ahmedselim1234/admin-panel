"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { CHART_COLORS, ChartTooltip } from "./chart-primitives";
import { formatNumber } from "@/lib/utils";
import type { OrderStatus } from "@/types";

const STATUS_COLOR: Record<OrderStatus, string> = {
  delivered: CHART_COLORS.success,
  shipped: CHART_COLORS.primary,
  processing: CHART_COLORS.primarySoft,
  pending: CHART_COLORS.warning,
  cancelled: CHART_COLORS.slate,
  refunded: CHART_COLORS.danger,
};

const LABEL: Record<OrderStatus, string> = {
  delivered: "Delivered",
  shipped: "Shipped",
  processing: "Processing",
  pending: "Pending",
  cancelled: "Cancelled",
  refunded: "Refunded",
};

export interface StatusSlice {
  status: OrderStatus;
  count: number;
  share: number;
}

export function OrdersDonut({ data, height = 220 }: { data: StatusSlice[]; height?: number }) {
  const total = data.reduce((sum, slice) => sum + slice.count, 0);

  return (
    <div className="flex flex-col items-center gap-5">
      <div className="relative w-full max-w-[13.75rem] shrink-0" style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="count"
              nameKey="status"
              innerRadius="66%"
              outerRadius="100%"
              paddingAngle={2}
              stroke="var(--surface)"
              strokeWidth={2}
            >
              {data.map((slice) => (
                <Cell key={slice.status} fill={STATUS_COLOR[slice.status]} />
              ))}
            </Pie>
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const slice = payload[0].payload as StatusSlice;
                return (
                  <ChartTooltip
                    title={LABEL[slice.status]}
                    rows={[
                      {
                        label: "Orders",
                        value: formatNumber(slice.count),
                        color: STATUS_COLOR[slice.status],
                      },
                      { label: "Share", value: `${slice.share}%` },
                    ]}
                  />
                );
              }}
            />
          </PieChart>
        </ResponsiveContainer>

        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xl font-semibold text-foreground tabular-nums">
            {formatNumber(total)}
          </span>
          <span className="text-[11px] tracking-wide text-muted-foreground uppercase">Orders</span>
        </div>
      </div>

      <ul className="grid w-full min-w-0 gap-2.5">
        {data.map((slice) => (
          <li key={slice.status} className="flex items-center gap-2.5 text-[13px]">
            <span
              className="size-2.5 shrink-0 rounded-full"
              style={{ backgroundColor: STATUS_COLOR[slice.status] }}
              aria-hidden
            />
            <span className="flex-1 text-muted-foreground">{LABEL[slice.status]}</span>
            <span className="font-medium text-foreground tabular-nums">
              {formatNumber(slice.count)}
            </span>
            <span className="w-11 text-right text-muted-foreground tabular-nums">
              {slice.share}%
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
