"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Check,
  CreditCard,
  Mail,
  MapPin,
  Printer,
  ShoppingBag,
  Truck,
  User,
} from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/shared/page-header";
import { ErrorState } from "@/components/shared/empty-state";
import { ProductThumb } from "@/components/shared/product-thumb";
import { OrderStatusBadge } from "@/components/shared/status-badge";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { useApiQuery } from "@/lib/hooks/use-api";
import { getOrder, updateOrderStatus } from "@/lib/api/orders";
import { formatCurrency, formatDateTime, formatRelative } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { Order, OrderStatus } from "@/types";

const STATUSES: OrderStatus[] = [
  "pending",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
  "refunded",
];

function SummaryRow({
  label,
  value,
  strong,
}: {
  label: string;
  value: string;
  strong?: boolean;
}) {
  return (
    <div className="flex items-center justify-between py-1.5">
      <span className={cn("text-[13px]", strong ? "font-semibold text-foreground" : "text-muted-foreground")}>
        {label}
      </span>
      <span
        className={cn(
          "tabular-nums",
          strong ? "text-[15px] font-semibold text-foreground" : "text-[13px] text-foreground",
        )}
      >
        {value}
      </span>
    </div>
  );
}

function Timeline({ order }: { order: Order }) {
  return (
    <ol className="relative space-y-6 pl-7">
      <span className="absolute top-2 bottom-2 left-[0.5625rem] w-px bg-border" aria-hidden />
      {order.timeline.map((event) => (
        <li key={event.label} className="relative">
          <span
            className={cn(
              "absolute top-0.5 -left-7 flex size-[1.125rem] items-center justify-center rounded-full ring-4 ring-surface",
              event.done ? "bg-primary text-white" : "bg-surface-muted text-muted-foreground",
            )}
            aria-hidden
          >
            {event.done ? <Check className="size-2.5" strokeWidth={3.5} /> : null}
          </span>
          <p
            className={cn(
              "text-[13px] font-semibold",
              event.done ? "text-foreground" : "text-muted-foreground",
            )}
          >
            {event.label}
          </p>
          <p className="mt-0.5 text-[12.5px] leading-relaxed text-muted-foreground">
            {event.description}
          </p>
          {event.done ? (
            <p className="mt-1 text-[11.5px] text-muted-foreground/80">
              {formatDateTime(event.at)}
            </p>
          ) : null}
        </li>
      ))}
    </ol>
  );
}

export function OrderDetailView({ orderId }: { orderId: string }) {
  const { data, isLoading, error, refetch } = useApiQuery(() => getOrder(orderId), [orderId]);
  const [status, setStatus] = useState<OrderStatus | null>(null);
  const [saving, setSaving] = useState(false);

  const order = data && status ? { ...data, status } : data;

  const onStatusChange = async (next: OrderStatus) => {
    if (!data) return;
    const previous = order?.status ?? data.status;
    setStatus(next);
    setSaving(true);
    try {
      await updateOrderStatus(data.id, next);
      toast.success(`Status updated to ${next}`, {
        description: `${data.reference} · ${data.customerName}`,
      });
      refetch();
    } catch {
      setStatus(previous);
      toast.error("Could not update the order status");
    } finally {
      setSaving(false);
    }
  };

  if (error) {
    return (
      <Card>
        <ErrorState message={error.message} onRetry={refetch} />
      </Card>
    );
  }

  if (isLoading || !order) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-9 w-64" />
        <div className="grid gap-4 lg:grid-cols-3">
          <Skeleton className="h-96 rounded-xl lg:col-span-2" />
          <Skeleton className="h-96 rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <>
      <div>
        <Button variant="ghost" size="sm" asChild className="-ml-2 mb-3">
          <Link href="/orders">
            <ArrowLeft />
            Back to orders
          </Link>
        </Button>

        <PageHeader
          title={order.reference}
          description={`Placed ${formatDateTime(order.createdAt)} · ${formatRelative(order.createdAt)} · ${order.channel}`}
          actions={
            <>
              <OrderStatusBadge status={order.status} className="h-9.5 px-3" />
              <Select
                value={order.status}
                onValueChange={(value) => onStatusChange(value as OrderStatus)}
                disabled={saving}
              >
                <SelectTrigger className="w-40" aria-label="Update order status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUSES.map((value) => (
                    <SelectItem key={value} value={value} className="capitalize">
                      {value}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                variant="secondary"
                onClick={() => toast.info("Packing slip sent to the printer queue.")}
              >
                <Printer />
                <span className="hidden sm:inline">Print</span>
              </Button>
            </>
          }
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingBag className="size-4 text-muted-foreground" />
                Items ({order.itemCount})
              </CardTitle>
            </CardHeader>
            <CardContent className="px-0 pb-0">
              <ul className="divide-y divide-border border-t border-border">
                {order.items.map((item) => (
                  <li key={item.productId} className="flex items-center gap-3 px-5 py-3.5">
                    <ProductThumb name={item.name} seed={item.productId} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13.5px] font-medium text-foreground">
                        {item.name}
                      </p>
                      <p className="truncate font-mono text-[12px] text-muted-foreground">
                        {item.sku}
                      </p>
                    </div>
                    <p className="w-24 text-right text-[13px] text-muted-foreground tabular-nums">
                      {formatCurrency(item.price)} × {item.quantity}
                    </p>
                    <p className="w-24 text-right text-[13px] font-semibold tabular-nums text-foreground">
                      {formatCurrency(item.price * item.quantity)}
                    </p>
                  </li>
                ))}
              </ul>

              <div className="border-t border-border px-5 py-4">
                <div className="ml-auto max-w-xs">
                  <SummaryRow label="Subtotal" value={formatCurrency(order.subtotal)} />
                  {order.discount > 0 ? (
                    <SummaryRow label="Discount" value={`−${formatCurrency(order.discount)}`} />
                  ) : null}
                  <SummaryRow
                    label="Shipping"
                    value={order.shipping === 0 ? "Free" : formatCurrency(order.shipping)}
                  />
                  <SummaryRow label="VAT (19%)" value={formatCurrency(order.tax)} />
                  <div className="my-1.5 h-px bg-border" />
                  <SummaryRow label="Total" value={formatCurrency(order.total)} strong />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Truck className="size-4 text-muted-foreground" />
                Fulfilment timeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Timeline order={order} />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="size-4 text-muted-foreground" />
                Customer
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Link
                href={`/customers/${order.customerId}`}
                className="-mx-2 flex items-center gap-3 rounded-xl p-2 transition-colors hover:bg-surface-muted"
              >
                <Avatar name={order.customerName} color={order.customerAvatarColor} size="lg" />
                <div className="min-w-0">
                  <p className="truncate text-[14px] font-semibold text-foreground">
                    {order.customerName}
                  </p>
                  <p className="truncate text-[12.5px] text-muted-foreground">
                    {order.customerEmail}
                  </p>
                </div>
              </Link>

              <Button
                variant="secondary"
                className="w-full"
                onClick={() => toast.success(`Message drafted to ${order.customerEmail}`)}
              >
                <Mail />
                Contact customer
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="size-4 text-muted-foreground" />
                Shipping address
              </CardTitle>
            </CardHeader>
            <CardContent>
              <address className="text-[13px] leading-relaxed text-muted-foreground not-italic">
                <span className="block font-medium text-foreground">{order.customerName}</span>
                {order.shippingAddress.line1}
                <br />
                {order.shippingAddress.postalCode} {order.shippingAddress.city}
                <br />
                {order.shippingAddress.country}
              </address>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="size-4 text-muted-foreground" />
                Payment
              </CardTitle>
            </CardHeader>
            <CardContent>
              <SummaryRow label="Method" value={order.paymentMethod} />
              <SummaryRow label="Channel" value={order.channel} />
              <SummaryRow label="Charged" value={formatCurrency(order.total)} />
              <SummaryRow label="Last update" value={formatRelative(order.updatedAt)} />
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
