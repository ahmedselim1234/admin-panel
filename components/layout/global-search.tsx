"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Package, Search, ShoppingCart, User } from "lucide-react";
import { globalSearch, type SearchGroup, type SearchHit } from "@/lib/api/search";
import { useApiQuery } from "@/lib/hooks/use-api";
import { useDebouncedValue } from "@/lib/hooks/use-query-params";
import { cn } from "@/lib/utils";

const GROUP_ICON: Record<SearchGroup, typeof Package> = {
  Products: Package,
  Orders: ShoppingCart,
  Customers: User,
};

export function GlobalSearch({ className }: { className?: string }) {
  const router = useRouter();
  const [term, setTerm] = useState("");
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const debounced = useDebouncedValue(term, 280);
  const { data, isFetching } = useApiQuery(
    () => globalSearch(debounced),
    [debounced],
    { enabled: debounced.trim().length >= 2 },
  );

  const hits = useMemo(
    () => (debounced.trim().length >= 2 ? (data ?? []) : []),
    [data, debounced],
  );

  // ⌘K / Ctrl+K focuses the field from anywhere in the app.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        inputRef.current?.focus();
      }
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  useEffect(() => setHighlight(0), [hits]);

  const go = (hit: SearchHit) => {
    setOpen(false);
    setTerm("");
    router.push(hit.href);
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (!hits.length) return;
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setHighlight((index) => (index + 1) % hits.length);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setHighlight((index) => (index - 1 + hits.length) % hits.length);
    } else if (event.key === "Enter") {
      event.preventDefault();
      go(hits[highlight]);
    }
  };

  const grouped = hits.reduce<Record<string, SearchHit[]>>((acc, hit) => {
    (acc[hit.group] ??= []).push(hit);
    return acc;
  }, {});

  const showPanel = open && debounced.trim().length >= 2;

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <div className="relative">
        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <input
          ref={inputRef}
          value={term}
          onChange={(event) => {
            setTerm(event.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          placeholder="Search products, orders, customers…"
          aria-label="Global search"
          className={cn(
            "h-9.5 w-full rounded-xl border border-border bg-surface-muted/70 pr-16 pl-9 text-sm text-foreground",
            "placeholder:text-muted-foreground/80 transition-colors",
            "hover:border-border-strong focus:border-brand-400 focus:bg-surface focus:outline-none focus:ring-4 focus:ring-brand-500/12",
          )}
        />
        <span className="pointer-events-none absolute top-1/2 right-3 flex -translate-y-1/2 items-center gap-1">
          {isFetching ? (
            <Loader2 className="size-3.5 animate-spin text-muted-foreground" />
          ) : (
            <kbd className="rounded border border-border bg-surface px-1.5 py-0.5 font-sans text-[10px] font-medium text-muted-foreground">
              ⌘K
            </kbd>
          )}
        </span>
      </div>

      {showPanel ? (
        <div className="absolute top-full right-0 left-0 z-50 mt-2 max-h-[26rem] overflow-y-auto scrollbar-thin rounded-xl border border-border bg-surface p-1.5 card-shadow-lg anim-content-in">
          {hits.length === 0 ? (
            <p className="px-3 py-6 text-center text-[13px] text-muted-foreground">
              {isFetching ? "Searching…" : `No results for “${debounced}”`}
            </p>
          ) : (
            Object.entries(grouped).map(([group, groupHits]) => (
              <div key={group} className="mb-1 last:mb-0">
                <p className="px-2.5 py-1.5 text-[10px] font-semibold tracking-wide text-muted-foreground uppercase">
                  {group}
                </p>
                {groupHits.map((hit) => {
                  const Icon = GROUP_ICON[hit.group];
                  const index = hits.indexOf(hit);
                  return (
                    <button
                      key={`${hit.group}-${hit.id}`}
                      type="button"
                      onMouseEnter={() => setHighlight(index)}
                      onClick={() => go(hit)}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-left transition-colors",
                        index === highlight ? "bg-surface-muted" : "hover:bg-surface-muted/60",
                      )}
                    >
                      <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600 dark:bg-brand-900/40 dark:text-brand-300">
                        <Icon className="size-4" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[13px] font-medium text-foreground">
                          {hit.title}
                        </span>
                        <span className="block truncate text-[12px] text-muted-foreground">
                          {hit.subtitle}
                        </span>
                      </span>
                    </button>
                  );
                })}
              </div>
            ))
          )}
        </div>
      ) : null}
    </div>
  );
}
