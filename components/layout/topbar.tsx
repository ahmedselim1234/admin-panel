"use client";

import Link from "next/link";
import {
  Bell,
  CircleUser,
  LifeBuoy,
  LogOut,
  Menu,
  PackageX,
  Settings,
  ShoppingBag,
  Star,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { GlobalSearch } from "./global-search";
import { ThemeToggle } from "./theme-toggle";
import { Logo, SidebarNav } from "./sidebar";
import { useUiStore } from "@/store/ui-store";
import { cn } from "@/lib/utils";

const NOTIFICATIONS = [
  {
    id: "n1",
    icon: ShoppingBag,
    title: "12 new orders",
    body: "Placed in the last hour across Online Store and Mobile App.",
    time: "8 min ago",
    tone: "brand" as const,
  },
  {
    id: "n2",
    icon: PackageX,
    title: "Low stock warning",
    body: "6 SKUs dropped below their reorder threshold.",
    time: "1 h ago",
    tone: "warning" as const,
  },
  {
    id: "n3",
    icon: Star,
    title: "New 5-star review",
    body: "Aurora Wireless Earbuds received a new customer review.",
    time: "3 h ago",
    tone: "success" as const,
  },
];

function NotificationsMenu() {
  const read = useUiStore((state) => state.readNotifications);
  const markRead = useUiStore((state) => state.markNotificationRead);
  const markAllRead = useUiStore((state) => state.markAllNotificationsRead);
  const unread = NOTIFICATIONS.filter((item) => !read.includes(item.id));

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative text-muted-foreground"
          aria-label={`Notifications${unread.length ? ` (${unread.length} unread)` : ""}`}
        >
          <Bell />
          {unread.length ? (
            <span className="absolute top-2 right-2 flex size-2">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-danger opacity-70" />
              <span className="relative inline-flex size-2 rounded-full bg-danger" />
            </span>
          ) : null}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-80 p-0">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <p className="text-[13px] font-semibold text-foreground">Notifications</p>
          {unread.length ? (
            <button
              type="button"
              onClick={() => markAllRead(NOTIFICATIONS.map((item) => item.id))}
              className="text-[12px] font-medium text-primary hover:underline"
            >
              Mark all read
            </button>
          ) : (
            <Badge tone="neutral">All caught up</Badge>
          )}
        </div>

        <div className="max-h-80 overflow-y-auto scrollbar-thin p-1.5">
          {NOTIFICATIONS.map((item) => {
            const isRead = read.includes(item.id);
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => markRead(item.id)}
                className="flex w-full gap-3 rounded-lg p-2.5 text-left transition-colors hover:bg-surface-muted"
              >
                <span
                  className={cn(
                    "mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg",
                    item.tone === "brand" && "bg-brand-50 text-brand-600 dark:bg-brand-900/40 dark:text-brand-300",
                    item.tone === "warning" && "bg-warning-soft text-warning",
                    item.tone === "success" && "bg-success-soft text-success",
                  )}
                >
                  <item.icon className="size-4" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-2">
                    <span
                      className={cn(
                        "truncate text-[13px]",
                        isRead ? "font-medium text-muted-foreground" : "font-semibold text-foreground",
                      )}
                    >
                      {item.title}
                    </span>
                    {!isRead ? <span className="size-1.5 shrink-0 rounded-full bg-primary" /> : null}
                  </span>
                  <span className="mt-0.5 block text-[12px] leading-snug text-muted-foreground">
                    {item.body}
                  </span>
                  <span className="mt-1 block text-[11px] text-muted-foreground/80">{item.time}</span>
                </span>
              </button>
            );
          })}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function UserMenu() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="flex items-center gap-2.5 rounded-xl py-1 pr-2 pl-1 transition-colors hover:bg-surface-muted"
          aria-label="Account menu"
        >
          <Avatar name="Ahmed Selim" color="#2563EB" size="sm" />
          <span className="hidden text-left md:block">
            <span className="block text-[13px] leading-tight font-medium text-foreground">
              Ahmed Selim
            </span>
            <span className="block text-[11px] leading-tight text-muted-foreground">Owner</span>
          </span>
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-56">
        <DropdownMenuLabel>Signed in as</DropdownMenuLabel>
        <div className="px-2.5 pb-2 text-[13px] font-medium text-foreground">
          ahmed@selimcommerce.store
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/settings">
            <CircleUser />
            Profile
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/settings">
            <Settings />
            Store settings
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => toast.info("Support chat is not part of this demo.")}>
          <LifeBuoy />
          Support
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onSelect={() =>
            toast.info("This demo has no authentication — the console is always open.")
          }
        >
          <LogOut />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function Topbar() {
  const mobileNavOpen = useUiStore((state) => state.mobileNavOpen);
  const setMobileNavOpen = useUiStore((state) => state.setMobileNavOpen);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-surface/85 backdrop-blur-md">
      <div className="flex h-16 items-center gap-3 px-4 sm:px-6">
        <Button
          variant="ghost"
          size="icon"
          className="text-muted-foreground lg:hidden"
          onClick={() => setMobileNavOpen(true)}
          aria-label="Open navigation"
        >
          <Menu />
        </Button>

        <div className="lg:hidden">
          <Logo collapsed />
        </div>

        <GlobalSearch className="mx-auto w-full max-w-md lg:mx-0 lg:max-w-sm xl:max-w-md" />

        <div className="ml-auto flex items-center gap-1 sm:gap-1.5">
          <ThemeToggle />
          <NotificationsMenu />
          <div className="mx-1 hidden h-6 w-px bg-border sm:block" />
          <UserMenu />
        </div>
      </div>

      <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
        <SheetContent side="left" width="sm" className="p-0">
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          <div className="flex h-16 shrink-0 items-center border-b border-border px-4">
            <Logo />
          </div>
          <SidebarNav onNavigate={() => setMobileNavOpen(false)} />
        </SheetContent>
      </Sheet>
    </header>
  );
}
