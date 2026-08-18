/**
 * Mutable working copy of the seeded dataset.
 *
 * Mocked writes (create / update / delete / status changes) mutate this store,
 * so the app behaves like a real one for the whole session instead of snapping
 * back to the seed data after every action.
 */
import { customers, orders, products, team, analytics, buildTimeline } from "@/lib/mock-data";
import type { Customer, Order, OrderStatus, Product, TeamMember } from "@/types";

export const store = {
  products: products.map((p) => ({ ...p })) as Product[],
  customers: customers.map((c) => ({ ...c })) as Customer[],
  orders: orders.map((o) => ({ ...o })) as Order[],
  team: team.map((t) => ({ ...t })) as TeamMember[],
  analytics,
};

let sequence = 1;
export const nextId = (prefix: string) =>
  `${prefix}_new_${Date.now().toString(36)}${(sequence++).toString(36)}`;

export function setOrderStatus(id: string, status: OrderStatus) {
  const order = store.orders.find((o) => o.id === id);
  if (!order) return undefined;
  order.status = status;
  order.updatedAt = new Date().toISOString();
  order.timeline = buildTimeline(order.createdAt, status);
  return order;
}

export function findProduct(id: string) {
  return store.products.find((p) => p.id === id);
}

export function findCustomer(id: string) {
  return store.customers.find((c) => c.id === id);
}

export function findOrder(id: string) {
  return store.orders.find((o) => o.id === id);
}
