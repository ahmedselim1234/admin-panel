"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import type { ColumnDef } from "@tanstack/react-table";
import { Crown, TrendingUp, UserPlus, UserRoundSearch, Users } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { EmptyState } from "@/components/shared/empty-state";
import { FilterBar, FilterSelect, SearchField } from "@/components/shared/filter-bar";
import { CustomerStatusBadge } from "@/components/shared/status-badge";
import { DataTable } from "@/components/tables/data-table";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { CustomerGrowthChart } from "@/components/charts/customer-growth-chart";

import { useApiQuery } from "@/lib/hooks/use-api";
import { useQueryParams } from "@/lib/hooks/use-query-params";
import {
  getCustomerFacets,
  getCustomerGrowth,
  getCustomerSummary,
  getCustomers,
  type CustomerQuery,
} from "@/lib/api/customers";
import { formatCurrency, formatDate, formatNumber, formatRelative } from "@/lib/utils";
import type { Customer, CustomerStatus, SortDirection } from "@/types";

const STATUS_OPTIONS = [
  { value: "vip", label: "VIP" },
  { value: "active", label: "Active" },
  { value: "new", label: "New" },
  { value: "inactive", label: "Inactive" },
];

export function CustomersView() {
  const router = useRouter();
  const { get, getNumber, setParams } = useQueryParams();

  const query: CustomerQuery = useMemo(
    () => ({
      search: get("q") || undefined,
      status: (get("status", "all") as CustomerStatus | "all") || "all",
      country: get("country", "all"),
      sort: get("sort", "totalSpent"),
      dir: get("dir", "desc") as SortDirection,
      page: getNumber("page", 1),
      pageSize: getNumber("pageSize", 10),
    }),
    [get, getNumber],
  );

  const { data, isLoading, isFetching, error, refetch } = useApiQuery(
    () => getCustomers(query),
    [JSON.stringify(query)],
  );
  const summary = useApiQuery(() => getCustomerSummary(), []);
  const growth = useApiQuery(() => getCustomerGrowth(12), []);
  const facets = useApiQuery(() => getCustomerFacets(), []);

  const columns = useMemo<ColumnDef<Customer, unknown>[]>(
    () => [
      {
        id: "name",
        header: "Customer",
        meta: { sortKey: "name" },
        cell: ({ row }) => (
          <div className="flex items-center gap-3">
            <Avatar name={row.original.name} color={row.original.avatarColor} />
            <div className="min-w-0">
              <p className="truncate text-[13.5px] font-medium text-foreground">
                {row.original.name}
              </p>
              <p className="truncate text-[12px] text-muted-foreground">{row.original.email}</p>
            </div>
          </div>
        ),
      },
      {
        id: "location",
        header: "Location",
        meta: { hideBelow: "lg" },
        cell: ({ row }) => (
          <span className="text-[13px] text-muted-foreground">
            {row.original.address.city}, {row.original.address.country}
          </span>
        ),
      },
      {
        id: "orders",
        header: "Orders",
        meta: { sortKey: "orders", align: "right" },
        cell: ({ row }) => (
          <span className="text-[13px] tabular-nums">{formatNumber(row.original.orders)}</span>
        ),
      },
      {
        id: "totalSpent",
        header: "Total spent",
        meta: { sortKey: "totalSpent", align: "right" },
        cell: ({ row }) => (
          <span className="text-[13px] font-semibold tabular-nums">
            {formatCurrency(row.original.totalSpent)}
          </span>
        ),
      },
      {
        id: "averageOrderValue",
        header: "Avg. order",
        meta: { sortKey: "averageOrderValue", align: "right", hideBelow: "xl" },
        cell: ({ row }) => (
          <span className="text-[13px] tabular-nums text-muted-foreground">
            {formatCurrency(row.original.averageOrderValue)}
          </span>
        ),
      },
      {
        id: "joinedAt",
        header: "Joined",
        meta: { sortKey: "joinedAt", hideBelow: "md" },
        cell: ({ row }) => (
          <span className="text-[13px] whitespace-nowrap text-muted-foreground">
            {formatDate(row.original.joinedAt)}
          </span>
        ),
      },
      {
        id: "lastOrderAt",
        header: "Last order",
        meta: { sortKey: "lastOrderAt", hideBelow: "xl" },
        cell: ({ row }) => (
          <span className="text-[13px] whitespace-nowrap text-muted-foreground">
            {row.original.orders ? formatRelative(row.original.lastOrderAt) : "—"}
          </span>
        ),
      },
      {
        id: "status",
        header: "Status",
        meta: { sortKey: "status" },
        cell: ({ row }) => <CustomerStatusBadge status={row.original.status} />,
      },
    ],
    [],
  );

  return (
    <>
      <PageHeader
        title="Customers"
        description="Who is buying, how often, and how much they are worth over their lifetime."
      />

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total customers"
          value={summary.data ? formatNumber(summary.data.total) : "—"}
          icon={Users}
          isLoading={summary.isLoading}
        />
        <StatCard
          label="VIP customers"
          value={summary.data ? formatNumber(summary.data.vip) : "—"}
          comparison="8+ orders and €3,200+ spent"
          icon={Crown}
          isLoading={summary.isLoading}
        />
        <StatCard
          label="New this quarter"
          value={summary.data ? formatNumber(summary.data.new) : "—"}
          comparison="Joined in the last 45 days"
          icon={UserPlus}
          isLoading={summary.isLoading}
        />
        <StatCard
          label="Avg. lifetime value"
          value={summary.data ? formatCurrency(summary.data.lifetimeValue) : "—"}
          comparison="Across all customers"
          icon={TrendingUp}
          isLoading={summary.isLoading}
        />
      </section>

      <Card>
        <CardHeader>
          <div>
            <CardTitle>Customer growth</CardTitle>
            <CardDescription>New sign-ups per month over the last year</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          {growth.isLoading || !growth.data ? (
            <Skeleton className="h-[200px] w-full rounded-xl" />
          ) : (
            <CustomerGrowthChart data={growth.data} />
          )}
        </CardContent>
      </Card>

      <Card className="overflow-hidden">
        <FilterBar>
          <SearchField placeholder="Search name, email or city…" />
          <FilterSelect paramKey="status" label="Segment" options={STATUS_OPTIONS} width="w-full sm:w-36" />
          <FilterSelect
            paramKey="country"
            label="Country"
            options={(facets.data?.countries ?? []).map((country) => ({
              value: country,
              label: country,
            }))}
            width="w-full sm:w-44"
          />
        </FilterBar>

        <DataTable
          columns={columns}
          data={data?.rows}
          getRowId={(row) => row.id}
          isLoading={isLoading}
          isFetching={isFetching}
          error={error}
          onRetry={refetch}
          sort={query.sort}
          dir={query.dir}
          onSortChange={(sort, dir) => setParams({ sort, dir })}
          page={data?.page ?? 1}
          pageSize={data?.pageSize ?? 10}
          pageCount={data?.pageCount ?? 1}
          total={data?.total ?? 0}
          onPageChange={(page) => setParams({ page }, { resetPage: false })}
          onPageSizeChange={(pageSize) => setParams({ pageSize })}
          onRowClick={(customer) => router.push(`/customers/${customer.id}`)}
          emptyState={
            <EmptyState
              icon={UserRoundSearch}
              title="No customers found"
              description="Nobody matches this search or segment. Try a broader filter."
              action={
                <Button
                  variant="secondary"
                  onClick={() => setParams({ q: null, status: null, country: null })}
                >
                  Clear filters
                </Button>
              }
            />
          }
        />
      </Card>
    </>
  );
}
