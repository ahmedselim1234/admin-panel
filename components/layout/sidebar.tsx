"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronsLeft, Sparkles } from "lucide-react";
import { BRAND, BrandMark } from "./brand";
import { NAVIGATION, isActivePath } from "@/lib/navigation";
import { useUiStore } from "@/store/ui-store";
import { Tooltip } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export function Logo({ collapsed = false }: { collapsed?: boolean }) {
  return (
    <Link
      href="/dashboard"
      className="flex items-center gap-2.5 rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-brand-400"
    >
      <BrandMark />
      {!collapsed ? (
        <span className="min-w-0">
          <span className="block truncate text-[15px] leading-tight font-semibold text-foreground">
            {BRAND.name}
          </span>
          <span className="block truncate text-[11px] leading-tight text-muted-foreground">
            {BRAND.subtitle}
          </span>
        </span>
      ) : null}
    </Link>
  );
}

export function SidebarNav({
  collapsed = false,
  onNavigate,
}: {
  collapsed?: boolean;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();

  return (
    <nav className="flex-1 space-y-6 overflow-y-auto scrollbar-thin px-3 py-4" aria-label="Main">
      {NAVIGATION.map((section) => (
        <div key={section.label} className="space-y-1">
          {!collapsed ? (
            <p className="px-3 pb-1 text-[10px] font-semibold tracking-[0.09em] text-muted-foreground/80 uppercase">
              {section.label}
            </p>
          ) : (
            <div className="mx-3 mb-2 h-px bg-border first:hidden" />
          )}

          {section.items.map((item) => {
            const active = isActivePath(pathname, item.href);
            const link = (
              <Link
                key={item.href}
                href={item.href}
                onClick={onNavigate}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13.5px] font-medium transition-all duration-150",
                  collapsed && "justify-center px-0",
                  active
                    ? "bg-brand-50 text-brand-700 dark:bg-brand-900/40 dark:text-brand-200"
                    : "text-muted-foreground hover:bg-surface-muted hover:text-foreground",
                )}
              >
                {active ? (
                  <span className="absolute top-1/2 -left-3 h-6 w-1 -translate-y-1/2 rounded-r-full bg-primary" />
                ) : null}
                <item.icon
                  className={cn(
                    "size-[18px] shrink-0 transition-transform group-hover:scale-105",
                    active ? "text-primary" : "text-muted-foreground",
                  )}
                />
                {!collapsed ? <span className="truncate">{item.label}</span> : null}
              </Link>
            );

            return collapsed ? (
              <Tooltip key={item.href} content={item.label} side="right">
                {link}
              </Tooltip>
            ) : (
              link
            );
          })}
        </div>
      ))}
    </nav>
  );
}

function UpgradeCard() {
  return (
    <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-brand-600 to-brand-900 p-4 text-white">
      <div
        className="pointer-events-none absolute -top-8 -right-6 size-24 rounded-full bg-white/10 blur-xl"
        aria-hidden
      />
      <Sparkles className="size-4" />
      <p className="mt-2 text-[13px] font-semibold">Demo dataset</p>
      <p className="mt-1 text-[11.5px] leading-relaxed text-white/80">
        3,500+ orders across 96 products — all generated locally, no backend required.
      </p>
    </div>
  );
}

export function Sidebar() {
  const collapsed = useUiStore((state) => state.sidebarCollapsed);
  const toggle = useUiStore((state) => state.toggleSidebar);

  return (
    <aside
      className={cn(
        "sticky top-0 hidden h-dvh shrink-0 flex-col border-r border-border bg-surface transition-[width] duration-200 lg:flex",
        collapsed ? "w-[4.75rem]" : "w-64",
      )}
    >
      <div className={cn("flex h-16 shrink-0 items-center px-4", collapsed && "justify-center px-0")}>
        <Logo collapsed={collapsed} />
      </div>

      <SidebarNav collapsed={collapsed} />

      <div className="shrink-0 space-y-3 p-3">
        {!collapsed ? <UpgradeCard /> : null}
        <button
          type="button"
          onClick={toggle}
          className={cn(
            "flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-[13px] font-medium text-muted-foreground transition-colors hover:bg-surface-muted hover:text-foreground",
            collapsed && "justify-center px-0",
          )}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <ChevronsLeft
            className={cn("size-4 transition-transform duration-200", collapsed && "rotate-180")}
          />
          {!collapsed ? "Collapse" : null}
        </button>
      </div>
    </aside>
  );
}
