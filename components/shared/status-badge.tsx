import { Badge, type BadgeProps } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { CustomerStatus, OrderStatus, ProductStatus, StockStatus, TeamRole } from "@/types";

type Tone = NonNullable<BadgeProps["tone"]>;

const ORDER: Record<OrderStatus, { label: string; tone: Tone; dot: string }> = {
  pending: { label: "Pending", tone: "warning", dot: "bg-warning" },
  processing: { label: "Processing", tone: "info", dot: "bg-info" },
  shipped: { label: "Shipped", tone: "brand", dot: "bg-brand-500" },
  delivered: { label: "Delivered", tone: "success", dot: "bg-success" },
  cancelled: { label: "Cancelled", tone: "neutral", dot: "bg-muted-foreground" },
  refunded: { label: "Refunded", tone: "danger", dot: "bg-danger" },
};

const PRODUCT: Record<ProductStatus, { label: string; tone: Tone }> = {
  active: { label: "Active", tone: "success" },
  draft: { label: "Draft", tone: "neutral" },
  archived: { label: "Archived", tone: "outline" },
};

const STOCK: Record<StockStatus, { label: string; tone: Tone }> = {
  "in-stock": { label: "In stock", tone: "success" },
  "low-stock": { label: "Low stock", tone: "warning" },
  "out-of-stock": { label: "Out of stock", tone: "danger" },
};

const CUSTOMER: Record<CustomerStatus, { label: string; tone: Tone }> = {
  vip: { label: "VIP", tone: "brand" },
  active: { label: "Active", tone: "success" },
  new: { label: "New", tone: "info" },
  inactive: { label: "Inactive", tone: "neutral" },
};

const ROLE: Record<TeamRole, { label: string; tone: Tone }> = {
  admin: { label: "Admin", tone: "brand" },
  editor: { label: "Editor", tone: "info" },
  viewer: { label: "Viewer", tone: "neutral" },
};

export function OrderStatusBadge({ status, className }: { status: OrderStatus; className?: string }) {
  const config = ORDER[status];
  return (
    <Badge tone={config.tone} className={className}>
      <span className={cn("size-1.5 rounded-full", config.dot)} />
      {config.label}
    </Badge>
  );
}

export function ProductStatusBadge({ status }: { status: ProductStatus }) {
  return <Badge tone={PRODUCT[status].tone}>{PRODUCT[status].label}</Badge>;
}

export function StockBadge({ status }: { status: StockStatus }) {
  return <Badge tone={STOCK[status].tone}>{STOCK[status].label}</Badge>;
}

export function CustomerStatusBadge({ status }: { status: CustomerStatus }) {
  return <Badge tone={CUSTOMER[status].tone}>{CUSTOMER[status].label}</Badge>;
}

export function RoleBadge({ role }: { role: TeamRole }) {
  return <Badge tone={ROLE[role].tone}>{ROLE[role].label}</Badge>;
}

export const ORDER_STATUS_META = ORDER;
