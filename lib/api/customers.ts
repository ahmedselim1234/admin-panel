import { ApiError, matches, paginate, respond, sortBy, type ListQuery } from "./client";
import { findCustomer, nextId, store } from "./store";
import type { Customer, CustomerStatus, Order, Paginated } from "@/types";

export interface CustomerQuery extends ListQuery {
  status?: CustomerStatus | "all";
  country?: string;
}

export async function getCustomers(query: CustomerQuery = {}): Promise<Paginated<Customer>> {
  return respond(() => {
    const filtered = store.customers.filter((customer) => {
      if (query.status && query.status !== "all" && customer.status !== query.status) return false;
      if (query.country && query.country !== "all" && customer.address.country !== query.country)
        return false;
      return matches(
        [customer.name, customer.email, customer.address.city, customer.address.country],
        query.search,
      );
    });
    const sorted = sortBy(filtered, query.sort ?? "totalSpent", query.dir ?? "desc");
    return paginate(sorted, query.page ?? 1, query.pageSize ?? 10);
  });
}

export async function getCustomer(id: string): Promise<{ customer: Customer; orders: Order[] }> {
  return respond(() => {
    const customer = findCustomer(id);
    if (!customer) throw new ApiError("Customer not found", 404);
    return {
      customer: { ...customer },
      orders: store.orders
        .filter((order) => order.customerId === id)
        .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1)),
    };
  });
}

export async function getCustomerFacets() {
  return respond(
    () => ({
      countries: [...new Set(store.customers.map((c) => c.address.country))].sort(),
    }),
    { delay: 120 },
  );
}

/** New customers per month, derived from join dates — powers the growth chart. */
export async function getCustomerGrowth(months = 12) {
  return respond(() => {
    const buckets = new Map<string, { month: string; customers: number; cumulative: number }>();
    const sorted = [...store.customers].sort((a, b) => (a.joinedAt < b.joinedAt ? -1 : 1));

    for (const customer of sorted) {
      const key = customer.joinedAt.slice(0, 7);
      const bucket = buckets.get(key) ?? { month: key, customers: 0, cumulative: 0 };
      bucket.customers += 1;
      buckets.set(key, bucket);
    }

    let running = 0;
    const rows = [...buckets.values()].map((bucket) => {
      running += bucket.customers;
      return { ...bucket, cumulative: running };
    });

    return rows.slice(-months);
  });
}

export async function getCustomerSummary() {
  return respond(() => {
    const byStatus = (status: CustomerStatus) =>
      store.customers.filter((c) => c.status === status).length;
    const spend = store.customers.reduce((total, c) => total + c.totalSpent, 0);
    return {
      total: store.customers.length,
      vip: byStatus("vip"),
      active: byStatus("active"),
      new: byStatus("new"),
      inactive: byStatus("inactive"),
      lifetimeValue: store.customers.length ? spend / store.customers.length : 0,
    };
  });
}

export async function addCustomerNote(id: string, body: string): Promise<Customer> {
  return respond(() => {
    const customer = findCustomer(id);
    if (!customer) throw new ApiError("Customer not found", 404);
    customer.notes = [
      {
        id: nextId("note"),
        author: "Ahmed Selim",
        body,
        at: new Date().toISOString(),
      },
      ...customer.notes,
    ];
    return { ...customer };
  });
}
