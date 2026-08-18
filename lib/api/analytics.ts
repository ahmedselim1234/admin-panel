import { respond } from "./client";
import { store } from "./store";
import { percentChange } from "@/lib/utils";
import type { DateRangeKey, KpiSummary, MetricValue, RevenuePoint } from "@/types";

export const RANGE_DAYS: Record<DateRangeKey, number> = {
  "7d": 7,
  "30d": 30,
  "90d": 90,
  "12m": 365,
};

export const RANGE_LABELS: Record<DateRangeKey, string> = {
  "7d": "Last 7 days",
  "30d": "Last 30 days",
  "90d": "Last 90 days",
  "12m": "Last 12 months",
};

function windows(range: DateRangeKey) {
  const days = RANGE_DAYS[range];
  const series = store.analytics.revenueSeries;
  const current = series.slice(-days);
  const previous = series.slice(-days * 2, -days);
  return { current, previous, days };
}

function metric(current: number, previous: number, trend: number[]): MetricValue {
  return { value: current, previous, change: percentChange(current, previous), trend };
}

/** Down-samples a series to a fixed number of points for sparklines. */
function spark(points: RevenuePoint[], key: keyof RevenuePoint, buckets = 12) {
  if (!points.length) return [];
  const size = Math.max(1, Math.ceil(points.length / buckets));
  const out: number[] = [];
  for (let i = 0; i < points.length; i += size) {
    const slice = points.slice(i, i + size);
    out.push(slice.reduce((total, point) => total + Number(point[key]), 0));
  }
  return out;
}

export async function getKpis(range: DateRangeKey = "30d"): Promise<KpiSummary> {
  return respond(() => {
    const { current, previous, days } = windows(range);

    const total = (points: RevenuePoint[], key: keyof RevenuePoint) =>
      points.reduce((sum, point) => sum + Number(point[key]), 0);

    const cutoff = (offset: number) => {
      const last = current.at(-1)?.date ?? new Date().toISOString().slice(0, 10);
      return new Date(new Date(last).getTime() - offset * 86_400_000);
    };

    const newCustomers = (start: Date, end: Date) =>
      store.customers.filter((customer) => {
        const joined = new Date(customer.joinedAt);
        return joined >= start && joined <= end;
      }).length;

    const currentCustomers = newCustomers(cutoff(days), cutoff(0));
    const previousCustomers = newCustomers(cutoff(days * 2), cutoff(days));

    const currentConversion =
      (total(current, "orders") / Math.max(1, total(current, "visitors"))) * 100;
    const previousConversion =
      (total(previous, "orders") / Math.max(1, total(previous, "visitors"))) * 100;

    return {
      revenue: metric(
        total(current, "revenue"),
        total(previous, "revenue"),
        spark(current, "revenue"),
      ),
      orders: metric(total(current, "orders"), total(previous, "orders"), spark(current, "orders")),
      customers: metric(
        currentCustomers,
        previousCustomers,
        spark(current, "visitors"),
      ),
      conversion: metric(currentConversion, previousConversion, spark(current, "orders")),
    };
  });
}

export interface RevenueSeriesPoint extends RevenuePoint {
  label: string;
}

export async function getRevenueSeries(range: DateRangeKey = "30d") {
  return respond(() => {
    const { current } = windows(range);

    // Long ranges are rolled up to months so the chart stays readable.
    if (range === "12m") {
      const buckets = new Map<string, RevenueSeriesPoint>();
      for (const point of current) {
        const key = point.date.slice(0, 7);
        const bucket =
          buckets.get(key) ??
          ({ date: `${key}-01`, label: key, revenue: 0, orders: 0, visitors: 0 } as RevenueSeriesPoint);
        bucket.revenue += point.revenue;
        bucket.orders += point.orders;
        bucket.visitors += point.visitors;
        buckets.set(key, bucket);
      }
      return [...buckets.values()].map((bucket) => ({
        ...bucket,
        revenue: Math.round(bucket.revenue),
      }));
    }

    return current.map((point) => ({ ...point, label: point.date }));
  });
}

export async function getCategorySales() {
  return respond(() => store.analytics.categorySales);
}

export async function getChannelSales() {
  return respond(() => store.analytics.channelSales);
}

export async function getTrafficSources() {
  return respond(() => store.analytics.trafficSources);
}

export async function getSalesHeatmap() {
  return respond(() => store.analytics.heatmap);
}

export async function getProductPerformance() {
  return respond(() => {
    const ranked = [...store.products]
      .filter((product) => product.status === "active")
      .sort((a, b) => b.revenue - a.revenue);
    return {
      best: ranked.slice(0, 5),
      worst: ranked.slice(-5).reverse(),
    };
  });
}

export async function exportReport(scope: string) {
  return respond(
    () => ({
      file: `${scope.toLowerCase().replace(/\s+/g, "-")}-${new Date()
        .toISOString()
        .slice(0, 10)}.csv`,
      rows: store.orders.length,
    }),
    { delay: 1400 },
  );
}
