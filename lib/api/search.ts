import { respond } from "./client";
import { store } from "./store";

export type SearchGroup = "Products" | "Orders" | "Customers";

export interface SearchHit {
  id: string;
  group: SearchGroup;
  title: string;
  subtitle: string;
  href: string;
}

export async function globalSearch(term: string): Promise<SearchHit[]> {
  return respond(
    () => {
      const query = term.trim().toLowerCase();
      if (query.length < 2) return [];

      const products = store.products
        .filter((p) => `${p.name} ${p.sku}`.toLowerCase().includes(query))
        .slice(0, 4)
        .map<SearchHit>((p) => ({
          id: p.id,
          group: "Products",
          title: p.name,
          subtitle: `${p.sku} · ${p.category}`,
          href: `/products?product=${p.id}`,
        }));

      const orders = store.orders
        .filter((o) => `${o.reference} ${o.customerName}`.toLowerCase().includes(query))
        .slice(0, 4)
        .map<SearchHit>((o) => ({
          id: o.id,
          group: "Orders",
          title: o.reference,
          subtitle: `${o.customerName} · ${o.status}`,
          href: `/orders/${o.id}`,
        }));

      const customers = store.customers
        .filter((c) => `${c.name} ${c.email}`.toLowerCase().includes(query))
        .slice(0, 4)
        .map<SearchHit>((c) => ({
          id: c.id,
          group: "Customers",
          title: c.name,
          subtitle: c.email,
          href: `/customers/${c.id}`,
        }));

      return [...products, ...orders, ...customers];
    },
    { delay: 260 },
  );
}
