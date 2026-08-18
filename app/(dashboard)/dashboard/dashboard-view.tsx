"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  CreditCard,
  Download,
  Inbox,
  Percent,
  ShoppingCart,
  TrendingUp,
  Users,
  Wallet,
} from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { RangeTabs } from "@/components/shared/range-tabs";
import { EmptyState, ErrorState } from "@/components/shared/empty-state";
import { ProductThumb } from "@/components/shared/product-thumb";
import { OrderStatusBadge } from "@/components/shared/status-badge";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { RevenueChart } from "@/components/charts/revenue-chart";
import { OrdersDonut } from "@/components/charts/orders-donut";
import { CategoryBarChart } from "@/components/charts/category-bar-chart";

import { useApiQuery } from "@/lib/hooks/use-api";
import {
  RANGE_LABELS,
  exportReport,
  getCategorySales,
  getKpis,
  getRevenueSeries,
} from "@/lib/api/analytics";
import { getOrderStatusBreakdown, getRecentOrders } from "@/lib/api/orders";
import { getTopProducts } from "@/lib/api/products";
import {
  formatCompact,
  formatCurrency,
  formatCurrencyCompact,
  formatNumber,
  formatRelative,
} from "@/lib/utils";
import type { DateRangeKey } from "@/types";

const PREVIOUS_LABEL: Record<DateRangeKey, string> = {
  "7d": "vs previous 7 days",
  "30d": "vs previous 30 days",
  "90d": "vs previous 90 days",
  "12m": "vs previous year",
};

function ChartCardSkeleton({ height = 300 }: { height?: number }) {
  return (
    <div className="space-y-3" style={{ height }}>
      <Skeleton className="h-full w-full rounded-xl" />
    </div>
  );
}

export function DashboardView() {
  const [range, setRange] = useState<DateRangeKey>("30d");
  const [exporting, setExporting] = useState(false);

  const kpis = useApiQuery(() => getKpis(range), [range]);
  const revenue = useApiQuery(() => getRevenueSeries(range), [range]);
  const statuses = useApiQuery(() => getOrderStatusBreakdown(), []);
  const categories = useApiQuery(() => getCategorySales(), []);
  const topProducts = useApiQuery(() => getTopProducts(5), []);
  const recentOrders = useApiQuery(() => getRecentOrders(6), []);

  const onExport = async () => {
    setExporting(true);
    const promise = exportReport(`dashboard ${range}`);
    toast.promise(promise, {
      loading: "Generating report…",
      success: (result) => `${result.file} is ready (${formatNumber(result.rows)} rows)`,
      error: "Report generation failed",
    });
    await promise.catch(() => undefined);
    setExporting(false);
  };

  return (
    <>
      <PageHeader
        title="Dashboard"
        description="Store performance at a glance — revenue, orders, customers and the products driving them."
        actions={
          <>
            <RangeTabs value={range} onChange={setRange} />
            <Button variant="secondary" onClick={onExport} loading={exporting}>
              <Download />
              <span className="hidden sm:inline">Export</span>
            </Button>
          </>
        }
      />

      <section
        className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
        aria-label="Key performance indicators"
      >
        <StatCard
          label="Total revenue"
          value={kpis.data ? formatCurrency(kpis.data.revenue.value) : "—"}
          change={kpis.data?.revenue.change}
          comparison={PREVIOUS_LABEL[range]}
          icon={Wallet}
          trend={kpis.data?.revenue.trend}
          isLoading={kpis.isLoading}
        />
        <StatCard
          label="Orders"
          value={kpis.data ? formatNumber(kpis.data.orders.value) : "—"}
          change={kpis.data?.orders.change}
          comparison={PREVIOUS_LABEL[range]}
          icon={ShoppingCart}
          trend={kpis.data?.orders.trend}
          isLoading={kpis.isLoading}
        />
        <StatCard
          label="New customers"
          value={kpis.data ? formatNumber(kpis.data.customers.value) : "—"}
          change={kpis.data?.customers.change}
          comparison={PREVIOUS_LABEL[range]}
          icon={Users}
          trend={kpis.data?.customers.trend}
          isLoading={kpis.isLoading}
        />
        <StatCard
          label="Conversion rate"
          value={kpis.data ? `${kpis.data.conversion.value.toFixed(2)}%` : "—"}
          change={kpis.data?.conversion.change}
          comparison={PREVIOUS_LABEL[range]}
          icon={Percent}
          trend={kpis.data?.conversion.trend}
          isLoading={kpis.isLoading}
        />
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <div>
              <CardTitle>Revenue trend</CardTitle>
              <CardDescription>{RANGE_LABELS[range]} · net of refunds</CardDescription>
            </div>
            {kpis.data ? (
              <div className="hidden text-right sm:block">
                <p className="text-lg font-semibold tabular-nums text-foreground">
                  {formatCurrencyCompact(kpis.data.revenue.value)}
                </p>
                <p className="text-[12px] text-muted-foreground">
                  {formatNumber(kpis.data.orders.value)} orders
                </p>
              </div>
            ) : null}
          </CardHeader>
          <CardContent>
            {revenue.error ? (
              <ErrorState message={revenue.error.message} onRetry={revenue.refetch} />
            ) : revenue.isLoading || !revenue.data ? (
              <ChartCardSkeleton />
            ) : (
              <RevenueChart data={revenue.data} range={range} />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div>
              <CardTitle>Orders by status</CardTitle>
              <CardDescription>Lifetime distribution</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            {statuses.error ? (
              <ErrorState message={statuses.error.message} onRetry={statuses.refetch} />
            ) : statuses.isLoading || !statuses.data ? (
              <ChartCardSkeleton height={260} />
            ) : (
              <OrdersDonut data={statuses.data} />
            )}
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <div>
              <CardTitle>Sales by category</CardTitle>
              <CardDescription>Net revenue per product category</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            {categories.error ? (
              <ErrorState message={categories.error.message} onRetry={categories.refetch} />
            ) : categories.isLoading || !categories.data ? (
              <ChartCardSkeleton height={260} />
            ) : (
              <CategoryBarChart data={categories.data} />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div>
              <CardTitle>Top selling products</CardTitle>
              <CardDescription>By lifetime revenue</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/products?sort=revenue&dir=desc">
                All
                <ArrowRight />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="pt-0">
            {topProducts.isLoading ? (
              <ul className="space-y-3.5">
                {Array.from({ length: 5 }).map((_, index) => (
                  <li key={index} className="flex items-center gap-3">
                    <Skeleton className="size-11 rounded-xl" />
                    <div className="flex-1 space-y-1.5">
                      <Skeleton className="h-3.5 w-3/4" />
                      <Skeleton className="h-3 w-1/3" />
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <ul className="space-y-1">
                {topProducts.data?.map((product, index) => (
                  <li key={product.id}>
                    <Link
                      href={`/products?product=${product.id}`}
                      className="flex items-center gap-3 rounded-xl p-2 -mx-2 transition-colors hover:bg-surface-muted"
                    >
                      <span className="w-4 shrink-0 text-[12px] font-semibold text-muted-foreground tabular-nums">
                        {index + 1}
                      </span>
                      <ProductThumb name={product.name} seed={product.id} />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[13px] font-medium text-foreground">
                          {product.name}
                        </span>
                        <span className="block text-[12px] text-muted-foreground">
                          {formatNumber(product.unitsSold)} sold · {product.category}
                        </span>
                      </span>
                      <span className="shrink-0 text-[13px] font-semibold tabular-nums text-foreground">
                        {formatCurrencyCompact(product.revenue)}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </section>

      <Card>
        <CardHeader>
          <div>
            <CardTitle>Recent orders</CardTitle>
            <CardDescription>The latest activity across every sales channel</CardDescription>
          </div>
          <Button variant="secondary" size="sm" asChild>
            <Link href="/orders">
              View all orders
              <ArrowRight />
            </Link>
          </Button>
        </CardHeader>
        <CardContent className="px-0 pb-0">
          {recentOrders.error ? (
            <ErrorState message={recentOrders.error.message} onRetry={recentOrders.refetch} />
          ) : recentOrders.isLoading ? (
            <div className="space-y-3 px-5 pb-5">
              {Array.from({ length: 5 }).map((_, index) => (
                <Skeleton key={index} className="h-12 w-full rounded-xl" />
              ))}
            </div>
          ) : recentOrders.data?.length === 0 ? (
            <EmptyState
              icon={Inbox}
              title="No orders yet"
              description="Orders will appear here as soon as customers start checking out."
              compact
            />
          ) : (
            <ul className="divide-y divide-border border-t border-border">
              {recentOrders.data?.map((order) => (
                <li key={order.id}>
                  <Link
                    href={`/orders/${order.id}`}
                    className="flex items-center gap-3 px-5 py-3 transition-colors hover:bg-surface-muted/60"
                  >
                    <Avatar name={order.customerName} color={order.customerAvatarColor} size="sm" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[13px] font-medium text-foreground">
                        {order.customerName}
                      </span>
                      <span className="block truncate text-[12px] text-muted-foreground">
                        {order.reference} · {order.itemCount} items · {formatRelative(order.createdAt)}
                      </span>
                    </span>
                    <span className="hidden shrink-0 sm:block">
                      <OrderStatusBadge status={order.status} />
                    </span>
                    <span className="w-20 shrink-0 text-right text-[13px] font-semibold tabular-nums text-foreground">
                      {formatCurrency(order.total)}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <section className="grid gap-4 sm:grid-cols-3">
        {[
          {
            icon: TrendingUp,
            label: "Average order value",
            value:
              kpis.data && kpis.data.orders.value
                ? formatCurrency(kpis.data.revenue.value / kpis.data.orders.value)
                : "—",
            hint: RANGE_LABELS[range],
          },
          {
            icon: CreditCard,
            label: "Revenue per visitor",
            value:
              kpis.data && revenue.data?.length
                ? formatCurrency(
                    kpis.data.revenue.value /
                      Math.max(1, revenue.data.reduce((total, point) => total + point.visitors, 0)),
                  )
                : "—",
            hint: RANGE_LABELS[range],
          },
          {
            icon: Users,
            label: "Sessions",
            value: revenue.data
              ? formatCompact(revenue.data.reduce((total, point) => total + point.visitors, 0))
              : "—",
            hint: RANGE_LABELS[range],
          },
        ].map((item) => (
          <Card key={item.label} className="flex items-center gap-4 p-5">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-surface-muted text-muted-foreground">
              <item.icon className="size-5" />
            </span>
            <div className="min-w-0">
              <p className="text-[13px] text-muted-foreground">{item.label}</p>
              <p className="mt-0.5 text-lg font-semibold tabular-nums text-foreground">
                {item.value}
              </p>
            </div>
          </Card>
        ))}
      </section>
    </>
  );
}
