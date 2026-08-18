"use client";

import * as React from "react";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
  type RowData,
} from "@tanstack/react-table";
import { ArrowDown, ArrowUp, ChevronsUpDown } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/shared/empty-state";
import { TablePagination } from "./table-pagination";
import { cn } from "@/lib/utils";
import type { SortDirection } from "@/types";

/** Extra per-column options this table understands. */
export interface TableColumnMeta {
  sortKey?: string;
  align?: "left" | "right" | "center";
  headerClassName?: string;
  cellClassName?: string;
  /** Hide below the given breakpoint to keep small screens readable. */
  hideBelow?: "sm" | "md" | "lg" | "xl";
}

declare module "@tanstack/react-table" {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface ColumnMeta<TData extends RowData, TValue> extends TableColumnMeta {}
}

const HIDE_CLASS = {
  sm: "hidden sm:table-cell",
  md: "hidden md:table-cell",
  lg: "hidden lg:table-cell",
  xl: "hidden xl:table-cell",
} as const;

export interface DataTableProps<T> {
  columns: ColumnDef<T, unknown>[];
  data: T[] | undefined;
  getRowId: (row: T) => string;

  isLoading?: boolean;
  isFetching?: boolean;
  error?: Error;
  onRetry?: () => void;

  sort?: string;
  dir?: SortDirection;
  onSortChange?: (sort: string, dir: SortDirection) => void;

  page?: number;
  pageSize?: number;
  pageCount?: number;
  total?: number;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;

  onRowClick?: (row: T) => void;
  emptyState?: React.ReactNode;
  skeletonRows?: number;
  className?: string;
}

export function DataTable<T>({
  columns,
  data,
  getRowId,
  isLoading = false,
  isFetching = false,
  error,
  onRetry,
  sort,
  dir = "desc",
  onSortChange,
  page = 1,
  pageSize = 10,
  pageCount = 1,
  total = 0,
  onPageChange,
  onPageSizeChange,
  onRowClick,
  emptyState,
  skeletonRows = 8,
  className,
}: DataTableProps<T>) {
  const table = useReactTable({
    data: data ?? [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualSorting: true,
    manualPagination: true,
    getRowId: (row) => getRowId(row),
  });

  const toggleSort = (key: string) => {
    if (!onSortChange) return;
    onSortChange(key, sort === key && dir === "desc" ? "asc" : "desc");
  };

  const isEmpty = !isLoading && !error && (data?.length ?? 0) === 0;

  return (
    <div className={cn("flex flex-col", className)}>
      <div className="relative overflow-x-auto scrollbar-thin">
        {isFetching && !isLoading ? (
          <div className="absolute inset-x-0 top-0 z-10 h-0.5 overflow-hidden bg-brand-100">
            <div className="h-full w-1/3 animate-[shimmer_1.1s_infinite] bg-primary" />
          </div>
        ) : null}

        <table className="w-full min-w-[46rem] border-collapse text-sm">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id} className="border-b border-border">
                {headerGroup.headers.map((header) => {
                  const meta = (header.column.columnDef.meta ?? {}) as TableColumnMeta;
                  const sortKey = meta.sortKey;
                  const active = sortKey && sort === sortKey;

                  return (
                    <th
                      key={header.id}
                      scope="col"
                      className={cn(
                        "bg-surface-muted/70 px-4 py-2.5 text-left text-[11px] font-semibold tracking-wide text-muted-foreground uppercase",
                        "first:pl-5 last:pr-5",
                        meta.align === "right" && "text-right",
                        meta.align === "center" && "text-center",
                        meta.hideBelow && HIDE_CLASS[meta.hideBelow],
                        meta.headerClassName,
                      )}
                      style={{ width: header.getSize() === 150 ? undefined : header.getSize() }}
                    >
                      {header.isPlaceholder ? null : sortKey && onSortChange ? (
                        <button
                          type="button"
                          onClick={() => toggleSort(sortKey)}
                          className={cn(
                            "-mx-1 inline-flex items-center gap-1 rounded px-1 py-0.5 uppercase transition-colors hover:text-foreground",
                            meta.align === "right" && "flex-row-reverse",
                            active && "text-primary",
                          )}
                        >
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          {active ? (
                            dir === "asc" ? (
                              <ArrowUp className="size-3" />
                            ) : (
                              <ArrowDown className="size-3" />
                            )
                          ) : (
                            <ChevronsUpDown className="size-3 opacity-40" />
                          )}
                        </button>
                      ) : (
                        flexRender(header.column.columnDef.header, header.getContext())
                      )}
                    </th>
                  );
                })}
              </tr>
            ))}
          </thead>

          <tbody>
            {isLoading
              ? Array.from({ length: skeletonRows }).map((_, rowIndex) => (
                  <tr key={rowIndex} className="border-b border-border last:border-0">
                    {columns.map((column, cellIndex) => {
                      const meta = (column.meta ?? {}) as TableColumnMeta;
                      return (
                        <td
                          key={cellIndex}
                          className={cn(
                            "px-4 py-3.5 first:pl-5 last:pr-5",
                            meta.hideBelow && HIDE_CLASS[meta.hideBelow],
                          )}
                        >
                          <Skeleton
                            className={cn(
                              "h-4",
                              cellIndex === 0 ? "w-40" : "w-20",
                              meta.align === "right" && "ml-auto",
                            )}
                          />
                        </td>
                      );
                    })}
                  </tr>
                ))
              : table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    onClick={onRowClick ? () => onRowClick(row.original) : undefined}
                    className={cn(
                      "border-b border-border transition-colors last:border-0",
                      onRowClick && "cursor-pointer hover:bg-surface-muted/60",
                    )}
                  >
                    {row.getVisibleCells().map((cell) => {
                      const meta = (cell.column.columnDef.meta ?? {}) as TableColumnMeta;
                      return (
                        <td
                          key={cell.id}
                          className={cn(
                            "px-4 py-3 align-middle text-foreground first:pl-5 last:pr-5",
                            meta.align === "right" && "text-right",
                            meta.align === "center" && "text-center",
                            meta.hideBelow && HIDE_CLASS[meta.hideBelow],
                            meta.cellClassName,
                          )}
                        >
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                      );
                    })}
                  </tr>
                ))}
          </tbody>
        </table>
      </div>

      {error ? <ErrorState message={error.message} onRetry={onRetry} /> : null}
      {isEmpty ? emptyState : null}

      {!error && !isEmpty && onPageChange ? (
        <TablePagination
          page={page}
          pageSize={pageSize}
          pageCount={pageCount}
          total={total}
          onPageChange={onPageChange}
          onPageSizeChange={onPageSizeChange}
        />
      ) : null}
    </div>
  );
}
