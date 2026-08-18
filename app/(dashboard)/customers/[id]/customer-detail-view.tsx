"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Mail, MapPin, NotebookPen, Phone, Receipt, Send } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/shared/page-header";
import { EmptyState, ErrorState } from "@/components/shared/empty-state";
import { OrderStatusBadge, CustomerStatusBadge } from "@/components/shared/status-badge";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/input";

import { useApiQuery } from "@/lib/hooks/use-api";
import { addCustomerNote, getCustomer } from "@/lib/api/customers";
import { formatCurrency, formatDate, formatDateTime, formatNumber, formatRelative } from "@/lib/utils";

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border p-4">
      <p className="text-[12px] text-muted-foreground">{label}</p>
      <p className="mt-1 text-lg font-semibold tabular-nums text-foreground">{value}</p>
    </div>
  );
}

export function CustomerDetailView({ customerId }: { customerId: string }) {
  const { data, isLoading, error, refetch } = useApiQuery(
    () => getCustomer(customerId),
    [customerId],
  );
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);

  if (error) {
    return (
      <Card>
        <ErrorState message={error.message} onRetry={refetch} />
      </Card>
    );
  }

  if (isLoading || !data) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-9 w-64" />
        <div className="grid gap-4 lg:grid-cols-3">
          <Skeleton className="h-80 rounded-xl" />
          <Skeleton className="h-80 rounded-xl lg:col-span-2" />
        </div>
      </div>
    );
  }

  const { customer, orders } = data;

  const submitNote = async () => {
    if (note.trim().length < 3) {
      toast.error("Write a slightly longer note before saving.");
      return;
    }
    setSaving(true);
    try {
      await addCustomerNote(customer.id, note.trim());
      setNote("");
      toast.success("Note added to the customer profile");
      refetch();
    } catch {
      toast.error("Could not save the note");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div>
        <Button variant="ghost" size="sm" asChild className="-ml-2 mb-3">
          <Link href="/customers">
            <ArrowLeft />
            Back to customers
          </Link>
        </Button>

        <PageHeader
          title={customer.name}
          description={`Customer since ${formatDate(customer.joinedAt)} · ${formatNumber(customer.orders)} orders`}
          actions={
            <Button
              variant="secondary"
              onClick={() => toast.success(`Email drafted to ${customer.email}`)}
            >
              <Mail />
              Email customer
            </Button>
          }
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-4">
          <Card>
            <CardContent className="pt-5">
              <div className="flex items-center gap-4">
                <Avatar name={customer.name} color={customer.avatarColor} size="xl" />
                <div className="min-w-0">
                  <p className="truncate text-[15px] font-semibold text-foreground">
                    {customer.name}
                  </p>
                  <div className="mt-1.5">
                    <CustomerStatusBadge status={customer.status} />
                  </div>
                </div>
              </div>

              <dl className="mt-5 space-y-3 text-[13px]">
                <div className="flex items-center gap-2.5 text-muted-foreground">
                  <Mail className="size-4 shrink-0" />
                  <span className="truncate text-foreground">{customer.email}</span>
                </div>
                <div className="flex items-center gap-2.5 text-muted-foreground">
                  <Phone className="size-4 shrink-0" />
                  <span className="text-foreground">{customer.phone}</span>
                </div>
                <div className="flex items-start gap-2.5 text-muted-foreground">
                  <MapPin className="mt-0.5 size-4 shrink-0" />
                  <span className="text-foreground">
                    {customer.address.line1}
                    <br />
                    {customer.address.postalCode} {customer.address.city}
                    <br />
                    {customer.address.country}
                  </span>
                </div>
              </dl>
            </CardContent>
          </Card>

          <div className="grid grid-cols-2 gap-3">
            <Stat label="Lifetime value" value={formatCurrency(customer.totalSpent)} />
            <Stat label="Orders" value={formatNumber(customer.orders)} />
            <Stat label="Avg. order" value={formatCurrency(customer.averageOrderValue)} />
            <Stat
              label="Last order"
              value={customer.orders ? formatRelative(customer.lastOrderAt) : "—"}
            />
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <NotebookPen className="size-4 text-muted-foreground" />
                Internal notes
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <Textarea
                  value={note}
                  onChange={(event) => setNote(event.target.value)}
                  placeholder="Add a note visible to your team…"
                  className="min-h-20 text-[13px]"
                />
                <Button size="sm" onClick={submitNote} loading={saving} className="w-full">
                  <Send />
                  Save note
                </Button>
              </div>

              {customer.notes.length ? (
                <ul className="space-y-3 border-t border-border pt-3">
                  {customer.notes.map((entry) => (
                    <li key={entry.id} className="rounded-xl bg-surface-muted p-3">
                      <p className="text-[13px] leading-relaxed text-foreground">{entry.body}</p>
                      <p className="mt-1.5 text-[11.5px] text-muted-foreground">
                        {entry.author} · {formatRelative(entry.at)}
                      </p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="border-t border-border pt-3 text-[12.5px] text-muted-foreground">
                  No notes yet. Anything you add here stays internal.
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Receipt className="size-4 text-muted-foreground" />
              Order history
            </CardTitle>
          </CardHeader>
          <CardContent className="px-0 pb-0">
            {orders.length === 0 ? (
              <EmptyState
                icon={Receipt}
                title="No orders yet"
                description="This customer has an account but has not completed a purchase."
                compact
              />
            ) : (
              <ul className="max-h-[42rem] divide-y divide-border overflow-y-auto scrollbar-thin border-t border-border">
                {orders.map((order) => (
                  <li key={order.id}>
                    <Link
                      href={`/orders/${order.id}`}
                      className="flex flex-wrap items-center gap-3 px-5 py-3.5 transition-colors hover:bg-surface-muted/60"
                    >
                      <span className="w-28 shrink-0 font-mono text-[13px] font-medium text-foreground">
                        {order.reference}
                      </span>
                      <span className="w-36 shrink-0 text-[12.5px] text-muted-foreground">
                        {formatDateTime(order.createdAt)}
                      </span>
                      <span className="flex-1 truncate text-[12.5px] text-muted-foreground">
                        {order.items.map((item) => item.name).join(", ")}
                      </span>
                      <OrderStatusBadge status={order.status} />
                      <span className="w-24 shrink-0 text-right text-[13px] font-semibold tabular-nums text-foreground">
                        {formatCurrency(order.total)}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
