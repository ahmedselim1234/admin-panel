"use client";

import { useCallback, useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import {
  Archive,
  LayoutGrid,
  MoreHorizontal,
  Package,
  PackageSearch,
  Pencil,
  Plus,
  Rows3,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { FilterBar, FilterSelect, SearchField } from "@/components/shared/filter-bar";
import { ProductThumb } from "@/components/shared/product-thumb";
import { ProductStatusBadge, StockBadge } from "@/components/shared/status-badge";
import { DataTable } from "@/components/tables/data-table";
import { ProductGrid } from "@/components/products/product-grid";
import { ProductDetailSheet } from "@/components/products/product-detail-sheet";
import { ProductFormDialog } from "@/components/products/product-form-dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { TablePagination } from "@/components/tables/table-pagination";

import { useApiQuery } from "@/lib/hooks/use-api";
import { useQueryParams } from "@/lib/hooks/use-query-params";
import { useUiStore } from "@/store/ui-store";
import {
  bulkUpdateStatus,
  deleteProducts,
  getProducts,
  type ProductQuery,
} from "@/lib/api/products";
import { formatCurrency, formatDate, formatNumber, stockStatus } from "@/lib/utils";
import type { Product, ProductCategory, ProductStatus, SortDirection, StockStatus } from "@/types";

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

const STATUS_OPTIONS = [
  { value: "active", label: "Active" },
  { value: "draft", label: "Draft" },
  { value: "archived", label: "Archived" },
];

export function ProductsView() {
  const { get, getNumber, setParams } = useQueryParams();
  const view = useUiStore((state) => state.productView);
  const setView = useUiStore((state) => state.setProductView);

  const [selected, setSelected] = useState<string[]>([]);
  const [detailId, setDetailId] = useState<string | null>(get("product") || null);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);

  const query: ProductQuery = useMemo(
    () => ({
      search: get("q") || undefined,
      category: (get("category", "all") as ProductCategory | "all") || "all",
      stock: (get("stock", "all") as StockStatus | "all") || "all",
      status: (get("status", "all") as ProductStatus | "all") || "all",
      sort: get("sort", "createdAt"),
      dir: get("dir", "desc") as SortDirection,
      page: getNumber("page", 1),
      pageSize: getNumber("pageSize", view === "grid" ? 12 : 10),
    }),
    [get, getNumber, view],
  );

  const { data, isLoading, isFetching, error, refetch } = useApiQuery(
    () => getProducts(query),
    [JSON.stringify(query)],
  );

  const rows = data?.rows;
  const allSelected = Boolean(rows?.length) && rows!.every((row) => selected.includes(row.id));

  const toggleRow = useCallback((id: string) => {
    setSelected((current) =>
      current.includes(id) ? current.filter((value) => value !== id) : [...current, id],
    );
  }, []);

  const openDetail = useCallback((product: Product) => setDetailId(product.id), []);

  const openEdit = useCallback((product: Product) => {
    setEditing(product);
    setDetailId(null);
    setFormOpen(true);
  }, []);

  const runBulk = async (action: "archive" | "activate" | "delete") => {
    const ids = [...selected];
    if (!ids.length) return;

    if (action === "delete") {
      const promise = deleteProducts(ids);
      toast.promise(promise, {
        loading: `Deleting ${ids.length} product${ids.length > 1 ? "s" : ""}…`,
        success: (result) => `${result.deleted} products deleted`,
        error: "Bulk delete failed",
      });
      await promise.catch(() => undefined);
    } else {
      const status: ProductStatus = action === "archive" ? "archived" : "active";
      const promise = bulkUpdateStatus(ids, status);
      toast.promise(promise, {
        loading: "Updating products…",
        success: (result) => `${result.updated} products marked ${status}`,
        error: "Bulk update failed",
      });
      await promise.catch(() => undefined);
    }

    setSelected([]);
    refetch();
  };

  const columns = useMemo<ColumnDef<Product, unknown>[]>(
    () => [
      {
        id: "select",
        size: 44,
        header: () => (
          <Checkbox
            checked={allSelected}
            onCheckedChange={(checked) =>
              setSelected(checked === true ? (rows?.map((row) => row.id) ?? []) : [])
            }
            aria-label="Select all rows on this page"
          />
        ),
        cell: ({ row }) => (
          <span onClick={(event) => event.stopPropagation()} className="flex">
            <Checkbox
              checked={selected.includes(row.original.id)}
              onCheckedChange={() => toggleRow(row.original.id)}
              aria-label={`Select ${row.original.name}`}
            />
          </span>
        ),
        meta: { headerClassName: "w-11" },
      },
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
        id: "category",
        header: "Category",
        meta: { sortKey: "category", hideBelow: "md" },
        cell: ({ row }) => (
          <span className="text-[13px] text-muted-foreground">{row.original.category}</span>
        ),
      },
      {
        id: "price",
        header: "Price",
        meta: { sortKey: "price", align: "right" },
        cell: ({ row }) => (
          <span className="text-[13px] font-medium tabular-nums">
            {formatCurrency(row.original.price)}
          </span>
        ),
      },
      {
        id: "stock",
        header: "Stock",
        meta: { sortKey: "stock", align: "right" },
        cell: ({ row }) => (
          <div className="flex flex-col items-end gap-1">
            <span className="text-[13px] font-medium tabular-nums">
              {formatNumber(row.original.stock)}
            </span>
            <StockBadge
              status={stockStatus(row.original.stock, row.original.lowStockThreshold)}
            />
          </div>
        ),
      },
      {
        id: "unitsSold",
        header: "Sold",
        meta: { sortKey: "unitsSold", align: "right", hideBelow: "lg" },
        cell: ({ row }) => (
          <span className="text-[13px] tabular-nums text-muted-foreground">
            {formatNumber(row.original.unitsSold)}
          </span>
        ),
      },
      {
        id: "status",
        header: "Status",
        meta: { sortKey: "status", hideBelow: "sm" },
        cell: ({ row }) => <ProductStatusBadge status={row.original.status} />,
      },
      {
        id: "createdAt",
        header: "Added",
        meta: { sortKey: "createdAt", hideBelow: "xl" },
        cell: ({ row }) => (
          <span className="text-[13px] whitespace-nowrap text-muted-foreground">
            {formatDate(row.original.createdAt)}
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
                <Button variant="ghost" size="icon-sm" aria-label={`Actions for ${row.original.name}`}>
                  <MoreHorizontal />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onSelect={() => openDetail(row.original)}>
                  <PackageSearch />
                  View details
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => openEdit(row.original)}>
                  <Pencil />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  destructive
                  onSelect={async () => {
                    const promise = deleteProducts([row.original.id]);
                    toast.promise(promise, {
                      loading: "Deleting…",
                      success: `${row.original.name} deleted`,
                      error: "Delete failed",
                    });
                    await promise.catch(() => undefined);
                    refetch();
                  }}
                >
                  <Trash2 />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </span>
        ),
      },
    ],
    [allSelected, openDetail, openEdit, refetch, rows, selected, toggleRow],
  );

  const emptyState = (
    <EmptyState
      icon={PackageSearch}
      title="No products match these filters"
      description="Try a different search term, or clear the filters to see the full catalogue."
      action={
        <Button variant="secondary" onClick={() => setParams({ q: null, category: null, stock: null, status: null })}>
          Clear filters
        </Button>
      }
    />
  );

  return (
    <>
      <PageHeader
        title="Products"
        description={`${data ? formatNumber(data.total) : "…"} products in the catalogue. Filter, sort and edit — every change is mocked but behaves like the real thing.`}
        actions={
          <Button
            onClick={() => {
              setEditing(null);
              setFormOpen(true);
            }}
          >
            <Plus />
            New product
          </Button>
        }
      />

      <Card className="overflow-hidden">
        <FilterBar
          trailing={
            <div className="flex items-center gap-1 rounded-xl border border-border p-1">
              <Button
                variant={view === "table" ? "soft" : "ghost"}
                size="icon-sm"
                onClick={() => setView("table")}
                aria-label="Table view"
                aria-pressed={view === "table"}
              >
                <Rows3 />
              </Button>
              <Button
                variant={view === "grid" ? "soft" : "ghost"}
                size="icon-sm"
                onClick={() => setView("grid")}
                aria-label="Grid view"
                aria-pressed={view === "grid"}
              >
                <LayoutGrid />
              </Button>
            </div>
          }
        >
          <SearchField placeholder="Search products or SKU…" />
          <FilterSelect paramKey="category" label="Category" options={CATEGORY_OPTIONS} />
          <FilterSelect paramKey="stock" label="Stock" options={STOCK_OPTIONS} width="w-full sm:w-36" />
          <FilterSelect paramKey="status" label="Status" options={STATUS_OPTIONS} width="w-full sm:w-36" />
        </FilterBar>

        {selected.length ? (
          <div className="flex flex-wrap items-center gap-3 border-b border-border bg-brand-50/60 px-5 py-3 dark:bg-brand-900/20">
            <p className="text-[13px] font-medium text-brand-800 dark:text-brand-200">
              {selected.length} selected
            </p>
            <div className="ml-auto flex flex-wrap items-center gap-2">
              <Button variant="secondary" size="sm" onClick={() => runBulk("activate")}>
                <Package />
                Mark active
              </Button>
              <Button variant="secondary" size="sm" onClick={() => runBulk("archive")}>
                <Archive />
                Archive
              </Button>
              <Button variant="danger" size="sm" onClick={() => runBulk("delete")}>
                <Trash2 />
                Delete
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setSelected([])}>
                Cancel
              </Button>
            </div>
          </div>
        ) : null}

        {view === "table" ? (
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
            onRowClick={openDetail}
            emptyState={emptyState}
          />
        ) : (
          <>
            {!isLoading && rows?.length === 0 ? (
              emptyState
            ) : (
              <ProductGrid products={rows} isLoading={isLoading} onSelect={openDetail} />
            )}
            {rows?.length ? (
              <TablePagination
                page={data?.page ?? 1}
                pageSize={data?.pageSize ?? 12}
                pageCount={data?.pageCount ?? 1}
                total={data?.total ?? 0}
                onPageChange={(page) => setParams({ page }, { resetPage: false })}
                onPageSizeChange={(pageSize) => setParams({ pageSize })}
              />
            ) : null}
          </>
        )}
      </Card>

      <ProductDetailSheet
        productId={detailId}
        onOpenChange={(open) => {
          if (!open) {
            setDetailId(null);
            setParams({ product: null }, { resetPage: false });
          }
        }}
        onEdit={openEdit}
      />

      <ProductFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        product={editing}
        onSaved={refetch}
      />
    </>
  );
}
