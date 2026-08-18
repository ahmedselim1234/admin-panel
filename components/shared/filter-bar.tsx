"use client";

import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useDebouncedParam, useQueryParams } from "@/lib/hooks/use-query-params";
import { cn } from "@/lib/utils";

export function SearchField({
  placeholder = "Search…",
  className,
}: {
  placeholder?: string;
  className?: string;
}) {
  const [value, setValue] = useDebouncedParam("q");

  return (
    <div className={cn("relative min-w-0 flex-1 sm:max-w-xs", className)}>
      <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
      <input
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        className={cn(
          "h-9.5 w-full rounded-xl border border-border bg-surface pr-8 pl-9 text-sm text-foreground",
          "placeholder:text-muted-foreground/80 transition-colors",
          "hover:border-border-strong focus:border-brand-400 focus:outline-none focus:ring-4 focus:ring-brand-500/12",
        )}
      />
      {value ? (
        <button
          type="button"
          onClick={() => setValue("")}
          aria-label="Clear search"
          className="absolute top-1/2 right-2.5 -translate-y-1/2 rounded p-0.5 text-muted-foreground transition-colors hover:text-foreground"
        >
          <X className="size-3.5" />
        </button>
      ) : null}
    </div>
  );
}

export function FilterSelect({
  paramKey,
  label,
  options,
  className,
  width = "w-full sm:w-40",
}: {
  paramKey: string;
  label: string;
  options: { value: string; label: string }[];
  className?: string;
  width?: string;
}) {
  const { get, setParams } = useQueryParams();
  const value = get(paramKey, "all");

  return (
    <Select value={value} onValueChange={(next) => setParams({ [paramKey]: next })}>
      <SelectTrigger className={cn(width, className)} aria-label={label}>
        <SelectValue placeholder={label} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">{label}: All</SelectItem>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export function FilterBar({
  children,
  className,
  trailing,
}: {
  children: React.ReactNode;
  className?: string;
  trailing?: React.ReactNode;
}) {
  const { activeCount, reset } = useQueryParams();

  return (
    <div
      className={cn(
        "flex flex-col gap-3 border-b border-border px-5 py-4 lg:flex-row lg:items-center",
        className,
      )}
    >
      <div className="flex flex-1 flex-wrap items-center gap-2">{children}</div>

      <div className="flex items-center gap-2">
        {activeCount > 0 ? (
          <Button variant="ghost" size="sm" onClick={reset}>
            <X />
            Clear
            <Badge tone="brand" className="ml-0.5">
              {activeCount}
            </Badge>
          </Button>
        ) : null}
        {trailing}
      </div>
    </div>
  );
}
