"use client";

import { Package, Pencil, Star, Warehouse } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Sheet,
  SheetBody,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { ProductThumb } from "@/components/shared/product-thumb";
import { ProductStatusBadge, StockBadge } from "@/components/shared/status-badge";
import { useApiQuery } from "@/lib/hooks/use-api";
import { getProduct } from "@/lib/api/products";
import { clamp, formatCurrency, formatDate, formatNumber, stockStatus } from "@/lib/utils";
import type { Product } from "@/types";

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-2">
      <dt className="text-[13px] text-muted-foreground">{label}</dt>
      <dd className="text-[13px] font-medium text-foreground tabular-nums">{value}</dd>
    </div>
  );
}

export function ProductDetailSheet({
  productId,
  onOpenChange,
  onEdit,
}: {
  productId: string | null;
  onOpenChange: (open: boolean) => void;
  onEdit: (product: Product) => void;
}) {
  const { data, isLoading, error } = useApiQuery(
    () => getProduct(productId as string),
    [productId],
    { enabled: Boolean(productId), keepPreviousData: false },
  );

  const product = data;
  const margin = product && product.price > 0 ? ((product.price - product.cost) / product.price) * 100 : 0;

  return (
    <Sheet open={Boolean(productId)} onOpenChange={onOpenChange}>
      <SheetContent width="lg">
        <SheetHeader>
          <SheetTitle>{product?.name ?? "Product details"}</SheetTitle>
          <SheetDescription>
            {product ? `${product.sku} · ${product.category}` : "Loading catalogue entry…"}
          </SheetDescription>
        </SheetHeader>

        <SheetBody className="space-y-6">
          {error ? (
            <p className="text-[13px] text-danger">{error.message}</p>
          ) : isLoading || !product ? (
            <div className="space-y-4">
              <Skeleton className="h-40 w-full rounded-2xl" />
              <Skeleton className="h-5 w-1/2" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-32 w-full" />
            </div>
          ) : (
            <>
              <div className="flex gap-4">
                <div className="h-32 w-32 shrink-0">
                  <ProductThumb name={product.name} seed={product.id} size="xl" />
                </div>
                <div className="min-w-0 flex-1 space-y-2.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <ProductStatusBadge status={product.status} />
                    <StockBadge status={stockStatus(product.stock, product.lowStockThreshold)} />
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-semibold tracking-tight text-foreground">
                      {formatCurrency(product.price)}
                    </span>
                    {product.compareAtPrice ? (
                      <span className="text-[13px] text-muted-foreground line-through">
                        {formatCurrency(product.compareAtPrice)}
                      </span>
                    ) : null}
                  </div>
                  <div className="flex items-center gap-1.5 text-[13px] text-muted-foreground">
                    <Star className="size-3.5 fill-warning text-warning" />
                    <span className="font-medium text-foreground">{product.rating.toFixed(1)}</span>
                    <span>({formatNumber(product.reviews)} reviews)</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {product.tags?.map((tag) => (
                      <Badge key={tag} tone="outline">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              <p className="text-[13px] leading-relaxed text-muted-foreground">
                {product.description}
              </p>

              <section className="rounded-xl border border-border p-4">
                <div className="mb-3 flex items-center justify-between">
                  <p className="flex items-center gap-2 text-[13px] font-semibold text-foreground">
                    <Package className="size-4 text-muted-foreground" />
                    Stock level
                  </p>
                  <span className="text-[13px] font-medium tabular-nums text-foreground">
                    {formatNumber(product.stock)} units
                  </span>
                </div>
                <Progress
                  value={clamp((product.stock / Math.max(product.lowStockThreshold * 6, 1)) * 100, 2, 100)}
                  barClassName={
                    product.stock === 0
                      ? "bg-danger"
                      : product.stock <= product.lowStockThreshold
                        ? "bg-warning"
                        : "bg-success"
                  }
                />
                <p className="mt-2 flex items-center gap-1.5 text-[12px] text-muted-foreground">
                  <Warehouse className="size-3.5" />
                  {product.warehouse} · reorder at {product.lowStockThreshold} units
                </p>
              </section>

              {product.variants?.length ? (
                <section>
                  <p className="mb-2 text-[13px] font-semibold text-foreground">Variants</p>
                  <div className="overflow-hidden rounded-xl border border-border">
                    <table className="w-full text-[13px]">
                      <thead>
                        <tr className="border-b border-border bg-surface-muted/70 text-[11px] tracking-wide text-muted-foreground uppercase">
                          <th className="px-3 py-2 text-left font-semibold">Variant</th>
                          <th className="px-3 py-2 text-left font-semibold">SKU</th>
                          <th className="px-3 py-2 text-right font-semibold">Stock</th>
                          <th className="px-3 py-2 text-right font-semibold">Price</th>
                        </tr>
                      </thead>
                      <tbody>
                        {product.variants.map((variant) => (
                          <tr key={variant.id} className="border-b border-border last:border-0">
                            <td className="px-3 py-2 font-medium text-foreground">{variant.name}</td>
                            <td className="px-3 py-2 font-mono text-[12px] text-muted-foreground">
                              {variant.sku}
                            </td>
                            <td className="px-3 py-2 text-right tabular-nums">{variant.stock}</td>
                            <td className="px-3 py-2 text-right tabular-nums">
                              {formatCurrency(variant.price)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>
              ) : null}

              <section className="rounded-xl border border-border p-4">
                <p className="mb-1 text-[13px] font-semibold text-foreground">Performance</p>
                <dl className="divide-y divide-border">
                  <Row label="Units sold" value={formatNumber(product.unitsSold)} />
                  <Row label="Lifetime revenue" value={formatCurrency(product.revenue)} />
                  <Row label="Unit cost" value={formatCurrency(product.cost)} />
                  <Row label="Gross margin" value={`${margin.toFixed(1)}%`} />
                  <Row label="Added" value={formatDate(product.createdAt)} />
                  <Row label="Last updated" value={formatDate(product.updatedAt)} />
                </dl>
              </section>
            </>
          )}
        </SheetBody>

        <SheetFooter className="justify-end">
          <Button variant="secondary" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Button disabled={!product} onClick={() => product && onEdit(product)}>
            <Pencil />
            Edit product
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
