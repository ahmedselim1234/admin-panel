"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ColumnDef } from "@tanstack/react-table";
import {
  CheckCircle2,
  Download,
  Eye,
  MoreHorizontal,
  PackageCheck,
  SearchX,
  Truck,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { FilterBar, FilterSelect, SearchField } from "@/components/shared/filter-bar";
import { OrderStatusBadge } from "@/components/shared/status-badge";
import { DataTable } from "@/components/tables/data-table";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { useApiQuery } from "@/lib/hooks/use-api";
import { useQueryParams } from "@/lib/hooks/use-query-params";
import { getOrders, updateOrderStatus, type OrderQuery } from "@/lib/api/orders";
import { exportReport } from "@/lib/api/analytics";
import { formatCurrency, formatDateTime, formatNumber } from "@/lib/utils";
import type { Order, OrderStatus, PaymentMethod, SortDirection } from "@/types";

const STATUS_OPTIONS = [
  { value: "pending", label: "Pending" },
  { value: "processing", label: "Processing" },
  { value: "shipped", label: "Shipped" },
  { value: "delivered", label: "Delivered" },
  { value: "cancelled", label: "Cancelled" },
  { value: "refunded", label: "Refunded" },
];

const PAYMENT_OPTIONS = [
  "Credit Card",
  "PayPal",
  "Apple Pay",
  "Bank Transfer",
  "Klarna",
].map((value) => ({ value, label: value }));

const CHANNEL_OPTIONS = [
  "Online Store",
  "Mobile App",
  "Marketplace",
  "Social",
  "Retail POS",
].map((value) => ({ value, label: value }));

const NEXT_STATUS: { status: OrderStatus; label: string; icon: typeof Truck }[] = [
  { status: "processing", label: "Mark processing", icon: PackageCheck },
  { status: "shipped", label: "Mark shipped", icon: Truck },
  { status: "delivered", label: "Mark delivered", icon: CheckCircle2 },
  { status: "cancelled", label: "Cancel order", icon: XCircle },
];

function DateRangeFields() {
  const { get, setParams } = useQueryParams();
  return (
    <div className="flex items-center gap-1.5">
      <Input
        type="date"
        value={get("from")}
        onChange={(event) => setParams({ from: event.target.value || null })}
        aria-label="From date"
        className="w-[9.5rem] text-[13px]"
      />
      <span className="text-[13px] text-muted-foreground">–</span>
      <Input
        type="date"
        value={get("to")}
        onChange={(event) => setParams({ to: event.target.value || null })}
        aria-label="To date"
        className="w-[9.5rem] text-[13px]"
      />
    </div>
  );
}

export function OrdersView() {
  const router = useRouter();
  const { get, getNumber, setParams } = useQueryParams();
  const [exporting, setExporting] = useState(false);
  /** Optimistic overrides applied on top of the fetched page. */
  const [optimistic, setOptimistic] = useState<Record<string, OrderStatus>>({});

  const query: OrderQuery = useMemo(
    () => ({
      search: get("q") || undefined,
      status: (get("status", "all") as OrderStatus | "all") || "all",
      payment: (get("payment", "all") as PaymentMethod | "all") || "all",
      channel: get("channel", "all"),
      from: get("from") || undefined,
      to: get("to") || undefined,
      sort: get("sort", "createdAt"),
      dir: get("dir", "desc") as SortDirection,
      page: getNumber("page", 1),
      pageSize: getNumber("pageSize", 10),
    }),
    [get, getNumber],
  );

  const { data, isLoading, isFetching, error, refetch } = useApiQuery(
    () => getOrders(query),
    [JSON.stringify(query)],
  );

  const rows = useMemo(
    () =>
      data?.rows.map((order) =>
        optimistic[order.id] ? { ...order, status: optimistic[order.id] } : order,
      ),
    [data, optimistic],
  );

  const changeStatus = async (order: Order, status: OrderStatus) => {
    const previous = order.status;
    setOptimistic((current) => ({ ...current, [order.id]: status }));

    try {
      await updateOrderStatus(order.id, status);
      toast.success(`${order.reference} marked ${status}`, {
        description: `Customer ${order.customerName} was notified.`,
      });
      refetch();
    } catch {
      setOptimistic((current) => ({ ...current, [order.id]: previous }));
      toast.error("Could not update the order status");
    }
  };

  const onExport = async () => {
    setExporting(true);
    const promise = exportReport("orders");
    toast.promise(promise, {
      loading: "Preparing export…",
      success: (result) => `${result.file} ready · ${formatNumber(result.rows)} rows`,
      error: "Export failed",
    });
    await promise.catch(() => undefined);
    setExporting(false);
  };

  const columns = useMemo<ColumnDef<Order, unknown>[]>(
    () => [
      {
        id: "reference",
        header: "Order",
        meta: { sortKey: "reference" },
        cell: ({ row }) => (
          <span className="font-mono text-[13px] font-medium text-foreground">
            {row.original.reference}
          </span>
        ),
      },
      {
        id: "customerName",
        header: "Customer",
        meta: { sortKey: "customerName" },
        cell: ({ row }) => (
          <div className="flex items-center gap-2.5">
            <Avatar
              name={row.original.customerName}
              color={row.original.customerAvatarColor}
              size="sm"
            />
            <div className="min-w-0">
              <p className="truncate text-[13px] font-medium text-foreground">
                {row.original.customerName}
              </p>
              <p className="truncate text-[12px] text-muted-foreground">
                {row.original.customerEmail}
              </p>
            </div>
          </div>
        ),
      },
      {
        id: "createdAt",
        header: "Date",
        meta: { sortKey: "createdAt", hideBelow: "md" },
        cell: ({ row }) => (
          <span className="text-[13px] whitespace-nowrap text-muted-foreground">
            {formatDateTime(row.original.createdAt)}
          </span>
        ),
      },
      {
        id: "itemCount",
        header: "Items",
        meta: { sortKey: "itemCount", align: "right", hideBelow: "lg" },
        cell: ({ row }) => (
          <span className="text-[13px] tabular-nums text-muted-foreground">
            {row.original.itemCount}
          </span>
        ),
      },
      {
        id: "paymentMethod",
        header: "Payment",
        meta: { sortKey: "paymentMethod", hideBelow: "xl" },
        cell: ({ row }) => (
          <span className="text-[13px] text-muted-foreground">{row.original.paymentMethod}</span>
        ),
      },
      {
        id: "status",
        header: "Status",
        meta: { sortKey: "status" },
        cell: ({ row }) => <OrderStatusBadge status={row.original.status} />,
      },
      {
        id: "total",
        header: "Total",
        meta: { sortKey: "total", align: "right" },
        cell: ({ row }) => (
          <span className="text-[13px] font-semibold tabular-nums">
            {formatCurrency(row.original.total)}
          </span>
        ),
      },
      {
        id: "actions",
        header: "",
        size: 56,
        cell: ({ row }) => (
          <span onClick={(event) => event.stopPropagation()} className="flex justify-end">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label={`Actions for ${row.original.reference}`}
                >
                  <MoreHorizontal />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem asChild>
                  <Link href={`/orders/${row.original.id}`}>
                    <Eye />
                    View order
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuLabel>Update status</DropdownMenuLabel>
                {NEXT_STATUS.map((option) => (
                  <DropdownMenuItem
                    key={option.status}
                    disabled={row.original.status === option.status}
                    destructive={option.status === "cancelled"}
                    onSelect={() => changeStatus(row.original, option.status)}
                  >
                    <option.icon />
                    {option.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </span>
        ),
      },
    ],
    // changeStatus is stable enough for the demo; recreated per render is fine.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  return (
    <>
      <PageHeader
        title="Orders"
        description={`${data ? formatNumber(data.total) : "…"} orders match the current filters. Status changes update optimistically, then confirm against the API.`}
        actions={
          <Button variant="secondary" onClick={onExport} loading={exporting}>
            <Download />
            Export CSV
          </Button>
        }
      />

      <Card className="overflow-hidden">
        <FilterBar>
          <SearchField placeholder="Search order ID or customer…" />
          <FilterSelect paramKey="status" label="Status" options={STATUS_OPTIONS} width="w-full sm:w-36" />
          <FilterSelect paramKey="payment" label="Payment" options={PAYMENT_OPTIONS} width="w-full sm:w-40" />
          <FilterSelect paramKey="channel" label="Channel" options={CHANNEL_OPTIONS} width="w-full sm:w-40" />
          <DateRangeFields />
        </FilterBar>

        <DataTable
          columns={columns}
          data={rows}
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
          onRowClick={(order) => router.push(`/orders/${order.id}`)}
          emptyState={
            <EmptyState
              icon={SearchX}
              title="No orders found"
              description="No orders match this combination of filters. Widen the date range or clear a filter to see more."
              action={
                <Button
                  variant="secondary"
                  onClick={() =>
                    setParams({ q: null, status: null, payment: null, channel: null, from: null, to: null })
                  }
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
