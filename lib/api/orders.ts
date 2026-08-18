import { ApiError, matches, paginate, respond, sortBy, type ListQuery } from "./client";
import { findOrder, setOrderStatus, store } from "./store";
import type { Order, OrderStatus, Paginated, PaymentMethod } from "@/types";

export interface OrderQuery extends ListQuery {
  status?: OrderStatus | "all";
  payment?: PaymentMethod | "all";
  channel?: string;
  customerId?: string;
  from?: string;
  to?: string;
}

function applyFilters(query: OrderQuery) {
  const from = query.from ? new Date(query.from).getTime() : null;
  const to = query.to ? new Date(query.to).getTime() + 86_400_000 : null;

  return store.orders.filter((order) => {
    if (query.status && query.status !== "all" && order.status !== query.status) return false;
    if (query.payment && query.payment !== "all" && order.paymentMethod !== query.payment)
      return false;
    if (query.channel && query.channel !== "all" && order.channel !== query.channel) return false;
    if (query.customerId && order.customerId !== query.customerId) return false;

    const created = new Date(order.createdAt).getTime();
    if (from && created < from) return false;
    if (to && created > to) return false;

    return matches([order.reference, order.customerName, order.customerEmail], query.search);
  });
}

export async function getOrders(query: OrderQuery = {}): Promise<Paginated<Order>> {
  return respond(() => {
    const filtered = applyFilters(query);
    const sorted = sortBy(filtered, query.sort ?? "createdAt", query.dir ?? "desc");
    return paginate(sorted, query.page ?? 1, query.pageSize ?? 10);
  });
}

export async function getOrder(id: string): Promise<Order> {
  return respond(() => {
    const order = findOrder(id);
    if (!order) throw new ApiError("Order not found", 404);
    return { ...order };
  });
}

export async function getRecentOrders(limit = 6): Promise<Order[]> {
  return respond(() =>
    [...store.orders]
      .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
      .slice(0, limit)
      .map((order) => ({ ...order })),
  );
}

export async function getOrderStatusBreakdown() {
  return respond(() => {
    const counts = new Map<OrderStatus, number>();
    for (const order of store.orders) {
      counts.set(order.status, (counts.get(order.status) ?? 0) + 1);
    }
    const total = store.orders.length;
    return [...counts.entries()]
      .map(([status, count]) => ({
        status,
        count,
        share: Math.round((count / total) * 1000) / 10,
      }))
      .sort((a, b) => b.count - a.count);
  });
}

export async function updateOrderStatus(id: string, status: OrderStatus): Promise<Order> {
  return respond(() => {
    const order = setOrderStatus(id, status);
    if (!order) throw new ApiError("Order not found", 404);
    return { ...order };
  });
}

export async function bulkUpdateOrderStatus(ids: string[], status: OrderStatus) {
  return respond(() => {
    let updated = 0;
    for (const id of ids) {
      if (setOrderStatus(id, status)) updated++;
    }
    return { updated };
  });
}
