"use client";

import { Star } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ProductThumb } from "@/components/shared/product-thumb";
import { ProductStatusBadge, StockBadge } from "@/components/shared/status-badge";
import { formatCurrency, formatNumber, stockStatus } from "@/lib/utils";
import type { Product } from "@/types";

export function ProductGrid({
  products,
  isLoading,
  onSelect,
}: {
  products: Product[] | undefined;
  isLoading: boolean;
  onSelect: (product: Product) => void;
}) {
  if (isLoading) {
    return (
      <div className="grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <Card key={index} className="overflow-hidden p-4">
            <Skeleton className="aspect-[4/3] w-full rounded-xl" />
            <Skeleton className="mt-3 h-4 w-3/4" />
            <Skeleton className="mt-2 h-3 w-1/2" />
            <Skeleton className="mt-3 h-5 w-1/3" />
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
      {products?.map((product) => (
        <Card
          key={product.id}
          role="button"
          tabIndex={0}
          onClick={() => onSelect(product)}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              onSelect(product);
            }
          }}
          className="group cursor-pointer overflow-hidden p-4 transition-all hover:-translate-y-0.5 hover:card-shadow-lg focus-visible:-translate-y-0.5"
        >
          <div className="relative aspect-[4/3] overflow-hidden rounded-xl">
            <ProductThumb
              name={product.name}
              seed={product.id}
              size="xl"
              className="transition-transform duration-300 group-hover:scale-[1.04]"
            />
            <span className="absolute top-2 left-2">
              <StockBadge status={stockStatus(product.stock, product.lowStockThreshold)} />
            </span>
            {product.compareAtPrice ? (
              <span className="absolute top-2 right-2 rounded-full bg-danger px-2 py-0.5 text-[11px] font-semibold text-white">
                -{Math.round((1 - product.price / product.compareAtPrice) * 100)}%
              </span>
            ) : null}
          </div>

          <div className="mt-3 space-y-1">
            <div className="flex items-start justify-between gap-2">
              <p className="line-clamp-1 text-[13.5px] font-semibold text-foreground">
                {product.name}
              </p>
              <ProductStatusBadge status={product.status} />
            </div>
            <p className="text-[12px] text-muted-foreground">
              {product.category} · {product.sku}
            </p>
          </div>

          <div className="mt-3 flex items-end justify-between">
            <div>
              <p className="text-[15px] font-semibold tabular-nums text-foreground">
                {formatCurrency(product.price)}
              </p>
              <p className="mt-0.5 flex items-center gap-1 text-[12px] text-muted-foreground">
                <Star className="size-3 fill-warning text-warning" />
                {product.rating.toFixed(1)} · {formatNumber(product.unitsSold)} sold
              </p>
            </div>
            <p className="text-[12px] text-muted-foreground tabular-nums">
              {formatNumber(product.stock)} in stock
            </p>
          </div>
        </Card>
      ))}
    </div>
  );
}
