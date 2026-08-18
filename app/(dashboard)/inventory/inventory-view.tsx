"use client";

import { useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { AlertTriangle, Boxes, PackagePlus, PackageX, Warehouse } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { EmptyState } from "@/components/shared/empty-state";
import { FilterBar, FilterSelect, SearchField } from "@/components/shared/filter-bar";
import { ProductThumb } from "@/components/shared/product-thumb";
import { StockBadge } from "@/components/shared/status-badge";
import { DataTable } from "@/components/tables/data-table";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { useApiQuery } from "@/lib/hooks/use-api";
import { useQueryParams } from "@/lib/hooks/use-query-params";
import {
  getInventory,
  getInventorySummary,
  restock,
  type InventoryQuery,
} from "@/lib/api/products";
import { clamp, formatCurrency, formatNumber, stockStatus } from "@/lib/utils";
import type { Product, ProductCategory, SortDirection, StockStatus } from "@/types";

const CATEGORY_OPTIONS = [
  "Electronics",
  "Apparel",
  "Home & Living",
  "Beauty",
  "Sports",
  "Accessories",
].map((value) => ({ value, label: value }));

const STOCK_OPTIONS = [
  { value: "in-stock", label: "In stock" },
  { value: "low-stock", label: "Low stock" },
  { value: "out-of-stock", label: "Out of stock" },
];

function RestockButton({ product, onDone }: { product: Product; onDone: () => void }) {
  const [open, setOpen] = useState(false);
  const [quantity, setQuantity] = useState(50);
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    setSaving(true);
    try {
      await restock(product.id, quantity);
      toast.success(`Restocked ${product.name}`, {
        description: `+${formatNumber(quantity)} units · now ${formatNumber(product.stock + quantity)} on hand`,
      });
      setOpen(false);
      onDone();
    } catch {
      toast.error("Restock failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="secondary" size="sm" onClick={(event) => event.stopPropagation()}>
          <PackagePlus />
          Restock
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" onClick={(event) => event.stopPropagation()}>
        <p className="text-[13px] font-semibold text-foreground">Restock {product.sku}</p>
        <p className="mt-0.5 text-[12px] text-muted-foreground">
          Currently {formatNumber(product.stock)} units at {product.warehouse}.
        </p>

        <Label className="mt-3 mb-1.5 block">Units to add</Label>
        <Input
          type="number"
          min={1}
          value={quantity}
          onChange={(event) => setQuantity(Math.max(1, Number(event.target.value) || 0))}
        />

        <div className="mt-2 flex gap-1.5">
          {[25, 50, 100, 250].map((amount) => (
            <Button
              key={amount}
              variant="ghost"
              size="sm"
              className="flex-1 px-0"
              onClick={() => setQuantity(amount)}
            >
              +{amount}
            </Button>
          ))}
        </div>

        <Button className="mt-3 w-full" onClick={submit} loading={saving}>
          Confirm restock
        </Button>
      </PopoverContent>
    </Popover>
  );
}

export function InventoryView() {
  const { get, getNumber, setParams } = useQueryParams();

  const query: InventoryQuery = useMemo(
    () => ({
      search: get("q") || undefined,
      category: (get("category", "all") as ProductCategory | "all") || "all",
      warehouse: get("warehouse", "all"),
      stock: (get("stock", "all") as StockStatus | "all") || "all",
      sort: get("sort", "stock"),
      dir: get("dir", "asc") as SortDirection,
      page: getNumber("page", 1),
      pageSize: getNumber("pageSize", 10),
    }),
    [get, getNumber],
  );

  const { data, isLoading, isFetching, error, refetch } = useApiQuery(
    () => getInventory(query),
    [JSON.stringify(query)],
  );
  const summary = useApiQuery(() => getInventorySummary(), []);

  const columns = useMemo<ColumnDef<Product, unknown>[]>(
    () => [
      {
        id: "name",
        header: "Product",
        meta: { sortKey: "name" },
        cell: ({ row }) => (
          <div className="flex items-center gap-3">
            <ProductThumb name={row.original.name} seed={row.original.id} />
            <div className="min-w-0">
              <p className="truncate text-[13.5px] font-medium text-foreground">
                {row.original.name}
              </p>
              <p className="truncate font-mono text-[12px] text-muted-foreground">
                {row.original.sku}
              </p>
            </div>
          </div>
        ),
      },
      {
        id: "warehouse",
        header: "Warehouse",
        meta: { sortKey: "warehouse", hideBelow: "md" },
        cell: ({ row }) => (
          <span className="flex items-center gap-1.5 text-[13px] text-muted-foreground">
            <Warehouse className="size-3.5" />
            {row.original.warehouse}
          </span>
        ),
      },
      {
        id: "level",
        header: "Level",
        meta: { hideBelow: "lg" },
        cell: ({ row }) => {
          const ratio = clamp(
            (row.original.stock / Math.max(row.original.lowStockThreshold * 6, 1)) * 100,
            0,
            100,
          );
          return (
            <div className="w-32">
              <Progress
                value={ratio}
                barClassName={
                  row.original.stock === 0
                    ? "bg-danger"
                    : row.original.stock <= row.original.lowStockThreshold
                      ? "bg-warning"
                      : "bg-success"
                }
              />
              <p className="mt-1 text-[11.5px] text-muted-foreground">
                reorder at {row.original.lowStockThreshold}
              </p>
            </div>
          );
        },
      },
      {
        id: "stock",
        header: "On hand",
        meta: { sortKey: "stock", align: "right" },
        cell: ({ row }) => (
          <div className="flex flex-col items-end gap-1">
            <span className="text-[13px] font-semibold tabular-nums">
              {formatNumber(row.original.stock)}
            </span>
            <StockBadge status={stockStatus(row.original.stock, row.original.lowStockThreshold)} />
          </div>
        ),
      },
      {
        id: "value",
        header: "Stock value",
        meta: { align: "right", hideBelow: "xl" },
        cell: ({ row }) => (
          <span className="text-[13px] tabular-nums text-muted-foreground">
            {formatCurrency(row.original.stock * row.original.cost)}
          </span>
        ),
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => (
          <span className="flex justify-end">
            <RestockButton product={row.original} onDone={() => { refetch(); summary.refetch(); }} />
          </span>
        ),
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  return (
    <>
      <PageHeader
        title="Inventory"
        description="Stock levels across every warehouse, with reorder thresholds and one-click restocking."
        actions={
          <Button
            variant="secondary"
            onClick={() => setParams({ stock: "low-stock", page: null })}
          >
            <AlertTriangle />
            Show low stock
          </Button>
        }
      />

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="SKUs tracked"
          value={summary.data ? formatNumber(summary.data.skus) : "—"}
          icon={Boxes}
          isLoading={summary.isLoading}
        />
        <StatCard
          label="Units on hand"
          value={summary.data ? formatNumber(summary.data.units) : "—"}
          icon={Warehouse}
          isLoading={summary.isLoading}
        />
        <StatCard
          label="Low stock"
          value={summary.data ? formatNumber(summary.data.lowStock) : "—"}
          comparison="Below reorder threshold"
          icon={AlertTriangle}
          isLoading={summary.isLoading}
        />
        <StatCard
          label="Out of stock"
          value={summary.data ? formatNumber(summary.data.outOfStock) : "—"}
          comparison={
            summary.data ? `Inventory value ${formatCurrency(summary.data.value)}` : undefined
          }
          icon={PackageX}
          isLoading={summary.isLoading}
        />
      </section>

      <Card className="overflow-hidden">
        <FilterBar>
          <SearchField placeholder="Search product or SKU…" />
          <FilterSelect paramKey="category" label="Category" options={CATEGORY_OPTIONS} />
          <FilterSelect
            paramKey="warehouse"
            label="Warehouse"
            options={(summary.data?.warehouses ?? []).map((warehouse) => ({
              value: warehouse,
              label: warehouse,
            }))}
            width="w-full sm:w-44"
          />
          <FilterSelect paramKey="stock" label="Stock" options={STOCK_OPTIONS} width="w-full sm:w-36" />
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
          emptyState={
            <EmptyState
              icon={Boxes}
              title="Nothing to restock here"
              description="No inventory matches these filters — which is usually good news."
              action={
                <Button
                  variant="secondary"
                  onClick={() => setParams({ q: null, category: null, warehouse: null, stock: null })}
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
