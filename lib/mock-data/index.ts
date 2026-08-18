/**
 * In-memory "database".
 *
 * The frozen JSON files are stored in a normalized, compact shape (line items
 * reference product ids, orders reference customer ids). This module hydrates
 * them once into the rich domain objects the UI works with — the same job a
 * real backend would do with joins.
 */
import type {
  Customer,
  Order,
  OrderEvent,
  OrderStatus,
  Product,
  TeamMember,
  CategorySales,
  ChannelSales,
  HeatmapCell,
  RevenuePoint,
  TrafficSource,
} from "@/types";

import productsRaw from "./products.json";
import customersRaw from "./customers.json";
import ordersRaw from "./orders.json";
import teamRaw from "./team.json";
import analyticsRaw from "./analytics.json";

interface RawOrder {
  id: string;
  reference: string;
  customerId: string;
  createdAt: string;
  status: OrderStatus;
  paymentMethod: string;
  channel: string;
  items: { p: string; q: number; u: number }[];
  subtotal: number;
  shipping: number;
  tax: number;
  discount: number;
  total: number;
}

export const products = productsRaw as unknown as Product[];
export const customers = customersRaw as unknown as Customer[];
export const team = teamRaw as unknown as TeamMember[];

export const analytics = analyticsRaw as unknown as {
  revenueSeries: RevenuePoint[];
  categorySales: CategorySales[];
  channelSales: ChannelSales[];
  trafficSources: TrafficSource[];
  heatmap: HeatmapCell[];
};

const productById = new Map(products.map((p) => [p.id, p]));
const customerById = new Map(customers.map((c) => [c.id, c]));

const STAGES = [
  { label: "Order placed", description: "Payment authorised and the order was created." },
  { label: "Processing", description: "Items picked and packed at the warehouse." },
  { label: "Shipped", description: "Handed over to the carrier." },
  { label: "Delivered", description: "Parcel delivered to the customer." },
] as const;

const REACHED: Record<OrderStatus, number> = {
  pending: 0,
  processing: 1,
  shipped: 2,
  delivered: 3,
  cancelled: 1,
  refunded: 3,
};

const HOUR = 3600_000;

/** Rebuilds the fulfilment timeline from the order status — no need to store it. */
export function buildTimeline(createdAt: string, status: OrderStatus): OrderEvent[] {
  const start = new Date(createdAt).getTime();
  const reached = REACHED[status];
  const events: OrderEvent[] = STAGES.map((stage, index) => ({
    label: stage.label,
    description: stage.description,
    at: new Date(start + index * 22 * HOUR).toISOString(),
    done: index <= reached,
  }));

  if (status === "cancelled") {
    return [
      ...events.slice(0, reached + 1),
      {
        label: "Cancelled",
        description: "Order cancelled and the payment authorisation was released.",
        at: new Date(start + 26 * HOUR).toISOString(),
        done: true,
      },
    ];
  }

  if (status === "refunded") {
    events.push({
      label: "Refunded",
      description: "Return received — refund issued to the original payment method.",
      at: new Date(start + 132 * HOUR).toISOString(),
      done: true,
    });
  }

  return events;
}

function hydrate(raw: RawOrder): Order {
  const customer = customerById.get(raw.customerId);
  const items = raw.items.map((item) => {
    const product = productById.get(item.p);
    return {
      productId: item.p,
      name: product?.name ?? "Discontinued product",
      sku: product?.sku ?? "—",
      image: product?.image ?? "unknown",
      quantity: item.q,
      price: item.u,
    };
  });

  return {
    id: raw.id,
    reference: raw.reference,
    customerId: raw.customerId,
    customerName: customer?.name ?? "Guest checkout",
    customerEmail: customer?.email ?? "guest@northwind.store",
    customerAvatarColor: customer?.avatarColor ?? "#2563EB",
    createdAt: raw.createdAt,
    updatedAt: new Date(new Date(raw.createdAt).getTime() + 36 * HOUR).toISOString(),
    status: raw.status,
    paymentMethod: raw.paymentMethod as Order["paymentMethod"],
    channel: raw.channel as Order["channel"],
    items,
    itemCount: items.reduce((total, item) => total + item.quantity, 0),
    subtotal: raw.subtotal,
    shipping: raw.shipping,
    tax: raw.tax,
    discount: raw.discount,
    total: raw.total,
    shippingAddress: customer?.address ?? {
      line1: "—",
      city: "—",
      postalCode: "—",
      country: "—",
    },
    timeline: buildTimeline(raw.createdAt, raw.status),
  };
}

export const orders: Order[] = (ordersRaw as unknown as RawOrder[]).map(hydrate);

export const db = { products, customers, orders, team, analytics };
