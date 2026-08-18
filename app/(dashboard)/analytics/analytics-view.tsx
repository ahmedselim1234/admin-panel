"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowDownRight, ArrowUpRight, Download, Flame, Globe, TrendingUp } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/shared/page-header";
import { RangeTabs } from "@/components/shared/range-tabs";
import { ErrorState } from "@/components/shared/empty-state";
import { ProductThumb } from "@/components/shared/product-thumb";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { RevenueChart } from "@/components/charts/revenue-chart";
import { ChannelChart } from "@/components/charts/channel-chart";
import { CategoryBarChart } from "@/components/charts/category-bar-chart";
import { SalesHeatmap } from "@/components/charts/sales-heatmap";

import { useApiQuery } from "@/lib/hooks/use-api";
import {
  RANGE_LABELS,
  exportReport,
  getCategorySales,
  getChannelSales,
  getKpis,
  getProductPerformance,
  getRevenueSeries,
  getSalesHeatmap,
  getTrafficSources,
} from "@/lib/api/analytics";
import { formatCompact, formatCurrency, formatCurrencyCompact, formatNumber } from "@/lib/utils";
import type { DateRangeKey, Product } from "@/types";

function PerformanceList({
  products,
  tone,
}: {
  products: Product[];
  tone: "best" | "worst";
}) {
  return (
    <ul className="space-y-1">
      {products.map((product) => (
        <li key={product.id}>
          <Link
            href={`/products?product=${product.id}`}
            className="-mx-2 flex items-center gap-3 rounded-xl p-2 transition-colors hover:bg-surface-muted"
          >
            <ProductThumb name={product.name} seed={product.id} size="sm" />
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[13px] font-medium text-foreground">
                {product.name}
              </span>
              <span className="block text-[12px] text-muted-foreground">
                {formatNumber(product.unitsSold)} units · {product.category}
              </span>
            </span>
            <span
              className={`flex shrink-0 items-center gap-1 text-[13px] font-semibold tabular-nums ${
                tone === "best" ? "text-success" : "text-danger"
              }`}
            >
              {tone === "best" ? (
                <ArrowUpRight className="size-3.5" />
              ) : (
                <ArrowDownRight className="size-3.5" />
              )}
              {formatCurrencyCompact(product.revenue)}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

export function AnalyticsView() {
  const [range, setRange] = useState<DateRangeKey>("90d");
  const [exporting, setExporting] = useState(false);

  const kpis = useApiQuery(() => getKpis(range), [range]);
  const revenue = useApiQuery(() => getRevenueSeries(range), [range]);
  const channels = useApiQuery(() => getChannelSales(), []);
  const categories = useApiQuery(() => getCategorySales(), []);
  const traffic = useApiQuery(() => getTrafficSources(), []);
  const heatmap = useApiQuery(() => getSalesHeatmap(), []);
  const performance = useApiQuery(() => getProductPerformance(), []);

  const onExport = async () => {
    setExporting(true);
    const promise = exportReport(`analytics ${range}`);
    toast.promise(promise, {
      loading: "Generating report…",
      success: (result) => `${result.file} is ready to download`,
      error: "Report generation failed",
    });
    await promise.catch(() => undefined);
    setExporting(false);
  };

  const maxVisitors = Math.max(...(traffic.data?.map((source) => source.visitors) ?? [1]));

  return (
    <>
      <PageHeader
        title="Analytics"
        description="Where the revenue comes from — channels, categories, traffic sources and the hours that convert."
        actions={
          <>
            <RangeTabs value={range} onChange={setRange} />
            <Button variant="secondary" onClick={onExport} loading={exporting}>
              <Download />
              <span className="hidden sm:inline">Export report</span>
            </Button>
          </>
        }
      />

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          {
            label: "Revenue",
            value: kpis.data ? formatCurrency(kpis.data.revenue.value) : "—",
            change: kpis.data?.revenue.change,
          },
          {
            label: "Orders",
            value: kpis.data ? formatNumber(kpis.data.orders.value) : "—",
            change: kpis.data?.orders.change,
          },
          {
            label: "Conversion",
            value: kpis.data ? `${kpis.data.conversion.value.toFixed(2)}%` : "—",
            change: kpis.data?.conversion.change,
          },
          {
            label: "Avg. order value",
            value:
              kpis.data && kpis.data.orders.value
                ? formatCurrency(kpis.data.revenue.value / kpis.data.orders.value)
                : "—",
          },
        ].map((item) => (
          <Card key={item.label} className="p-5">
            <p className="text-[13px] text-muted-foreground">{item.label}</p>
            {kpis.isLoading ? (
              <Skeleton className="mt-2 h-8 w-28" />
            ) : (
              <p className="mt-1.5 text-2xl font-semibold tracking-tight tabular-nums text-foreground">
                {item.value}
              </p>
            )}
            {item.change !== undefined ? (
              <p
                className={`mt-1.5 flex items-center gap-1 text-[12.5px] font-medium ${
                  item.change >= 0 ? "text-success" : "text-danger"
                }`}
              >
                {item.change >= 0 ? (
                  <ArrowUpRight className="size-3.5" />
                ) : (
                  <ArrowDownRight className="size-3.5" />
                )}
                {item.change.toFixed(1)}% vs previous period
              </p>
            ) : (
              <p className="mt-1.5 text-[12.5px] text-muted-foreground">{RANGE_LABELS[range]}</p>
            )}
          </Card>
        ))}
      </section>

      <Card>
        <CardHeader>
          <div>
            <CardTitle>Revenue over time</CardTitle>
            <CardDescription>{RANGE_LABELS[range]}</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          {revenue.error ? (
            <ErrorState message={revenue.error.message} onRetry={revenue.refetch} />
          ) : revenue.isLoading || !revenue.data ? (
            <Skeleton className="h-[320px] w-full rounded-xl" />
          ) : (
            <RevenueChart data={revenue.data} range={range} height={320} />
          )}
        </CardContent>
      </Card>

      <section className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Revenue by channel</CardTitle>
              <CardDescription>Where customers are buying</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            {channels.isLoading || !channels.data ? (
              <Skeleton className="h-[240px] w-full rounded-xl" />
            ) : (
              <ChannelChart data={channels.data} />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div>
              <CardTitle>Revenue by category</CardTitle>
              <CardDescription>Lifetime net revenue</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            {categories.isLoading || !categories.data ? (
              <Skeleton className="h-[260px] w-full rounded-xl" />
            ) : (
              <CategoryBarChart data={categories.data} height={240} />
            )}
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <div>
              <CardTitle className="flex items-center gap-2">
                <Globe className="size-4 text-muted-foreground" />
                Traffic sources
              </CardTitle>
              <CardDescription>Sessions and conversion rate</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            {traffic.isLoading || !traffic.data ? (
              <div className="space-y-4">
                {Array.from({ length: 6 }).map((_, index) => (
                  <Skeleton key={index} className="h-10 w-full" />
                ))}
              </div>
            ) : (
              <ul className="space-y-3.5">
                {traffic.data.map((source) => (
                  <li key={source.source}>
                    <div className="mb-1.5 flex items-baseline justify-between gap-3">
                      <span className="text-[13px] font-medium text-foreground">
                        {source.source}
                      </span>
                      <span className="text-[12.5px] tabular-nums text-muted-foreground">
                        {formatCompact(source.visitors)} · {source.conversion}%
                      </span>
                    </div>
                    <Progress value={(source.visitors / maxVisitors) * 100} />
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="size-4 text-success" />
                Best performers
              </CardTitle>
              <CardDescription>Top 5 by lifetime revenue</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            {performance.isLoading || !performance.data ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, index) => (
                  <Skeleton key={index} className="h-10 w-full" />
                ))}
              </div>
            ) : (
              <PerformanceList products={performance.data.best} tone="best" />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div>
              <CardTitle className="flex items-center gap-2">
                <ArrowDownRight className="size-4 text-danger" />
                Underperformers
              </CardTitle>
              <CardDescription>Consider a promotion or delisting</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            {performance.isLoading || !performance.data ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, index) => (
                  <Skeleton key={index} className="h-10 w-full" />
                ))}
              </div>
            ) : (
              <PerformanceList products={performance.data.worst} tone="worst" />
            )}
          </CardContent>
        </Card>
      </section>

      <Card>
        <CardHeader>
          <div>
            <CardTitle className="flex items-center gap-2">
              <Flame className="size-4 text-warning" />
              Sales heatmap
            </CardTitle>
            <CardDescription>Order density by weekday and hour (store timezone)</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          {heatmap.isLoading || !heatmap.data ? (
            <Skeleton className="h-[220px] w-full rounded-xl" />
          ) : (
            <SalesHeatmap data={heatmap.data} />
          )}
        </CardContent>
      </Card>
    </>
  );
}
