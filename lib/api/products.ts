import { ApiError, matches, paginate, respond, sortBy, type ListQuery } from "./client";
import { findProduct, nextId, store } from "./store";
import { stockStatus } from "@/lib/utils";
import type { Paginated, Product, ProductCategory, ProductStatus, StockStatus } from "@/types";

export interface ProductQuery extends ListQuery {
  category?: ProductCategory | "all";
  stock?: StockStatus | "all";
  status?: ProductStatus | "all";
  minPrice?: number;
  maxPrice?: number;
}

export interface ProductInput {
  name: string;
  sku: string;
  description: string;
  category: ProductCategory;
  price: number;
  cost: number;
  stock: number;
  lowStockThreshold: number;
  status: ProductStatus;
}

function applyFilters(query: ProductQuery) {
  return store.products.filter((product) => {
    if (query.category && query.category !== "all" && product.category !== query.category)
      return false;
    if (query.status && query.status !== "all" && product.status !== query.status) return false;
    if (
      query.stock &&
      query.stock !== "all" &&
      stockStatus(product.stock, product.lowStockThreshold) !== query.stock
    )
      return false;
    if (query.minPrice != null && product.price < query.minPrice) return false;
    if (query.maxPrice != null && product.price > query.maxPrice) return false;
    return matches([product.name, product.sku, product.category, ...product.tags], query.search);
  });
}

export async function getProducts(query: ProductQuery = {}): Promise<Paginated<Product>> {
  return respond(() => {
    const filtered = applyFilters(query);
    const sorted = sortBy(filtered, query.sort ?? "createdAt", query.dir ?? "desc");
    return paginate(sorted, query.page ?? 1, query.pageSize ?? 10);
  });
}

export async function getProduct(id: string): Promise<Product> {
  return respond(() => {
    const product = findProduct(id);
    if (!product) throw new ApiError("Product not found", 404);
    return { ...product };
  });
}

export async function getProductFacets() {
  return respond(() => {
    const priceValues = store.products.map((p) => p.price);
    return {
      total: store.products.length,
      categories: [...new Set(store.products.map((p) => p.category))].sort(),
      minPrice: Math.floor(Math.min(...priceValues)),
      maxPrice: Math.ceil(Math.max(...priceValues)),
    };
  }, { delay: 120 });
}

export async function getTopProducts(limit = 5): Promise<Product[]> {
  return respond(() =>
    [...store.products].sort((a, b) => b.revenue - a.revenue).slice(0, limit),
  );
}

export async function createProduct(input: ProductInput): Promise<Product> {
  return respond(() => {
    const now = new Date().toISOString();
    const product: Product = {
      ...input,
      id: nextId("prd"),
      compareAtPrice: null,
      rating: 0,
      reviews: 0,
      unitsSold: 0,
      revenue: 0,
      warehouse: "Berlin DC",
      tags: ["new"],
      variants: [],
      image: input.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      createdAt: now,
      updatedAt: now,
    };
    store.products.unshift(product);
    return product;
  });
}

export async function updateProduct(id: string, input: Partial<ProductInput>): Promise<Product> {
  return respond(() => {
    const product = findProduct(id);
    if (!product) throw new ApiError("Product not found", 404);
    Object.assign(product, input, { updatedAt: new Date().toISOString() });
    return { ...product };
  });
}

export async function deleteProducts(ids: string[]): Promise<{ deleted: number }> {
  return respond(() => {
    const set = new Set(ids);
    const before = store.products.length;
    store.products = store.products.filter((product) => !set.has(product.id));
    return { deleted: before - store.products.length };
  });
}

export async function bulkUpdateStatus(
  ids: string[],
  status: ProductStatus,
): Promise<{ updated: number }> {
  return respond(() => {
    const set = new Set(ids);
    let updated = 0;
    for (const product of store.products) {
      if (!set.has(product.id)) continue;
      product.status = status;
      product.updatedAt = new Date().toISOString();
      updated++;
    }
    return { updated };
  });
}

/* -------------------------------- Inventory ------------------------------ */

export interface InventoryQuery extends ListQuery {
  category?: ProductCategory | "all";
  warehouse?: string;
  stock?: StockStatus | "all";
}

export async function getInventory(query: InventoryQuery = {}): Promise<Paginated<Product>> {
  return respond(() => {
    const filtered = store.products.filter((product) => {
      if (query.category && query.category !== "all" && product.category !== query.category)
        return false;
      if (query.warehouse && query.warehouse !== "all" && product.warehouse !== query.warehouse)
        return false;
      if (
        query.stock &&
        query.stock !== "all" &&
        stockStatus(product.stock, product.lowStockThreshold) !== query.stock
      )
        return false;
      return matches([product.name, product.sku, product.warehouse], query.search);
    });
    const sorted = sortBy(filtered, query.sort ?? "stock", query.dir ?? "asc");
    return paginate(sorted, query.page ?? 1, query.pageSize ?? 10);
  });
}

export async function getInventorySummary() {
  return respond(() => {
    const low = store.products.filter(
      (p) => stockStatus(p.stock, p.lowStockThreshold) === "low-stock",
    );
    const out = store.products.filter((p) => p.stock === 0);
    const units = store.products.reduce((total, p) => total + p.stock, 0);
    const value = store.products.reduce((total, p) => total + p.stock * p.cost, 0);
    return {
      skus: store.products.length,
      units,
      value,
      lowStock: low.length,
      outOfStock: out.length,
      warehouses: [...new Set(store.products.map((p) => p.warehouse))].sort(),
    };
  });
}

export async function restock(id: string, quantity: number): Promise<Product> {
  return respond(() => {
    const product = findProduct(id);
    if (!product) throw new ApiError("Product not found", 404);
    product.stock += quantity;
    product.updatedAt = new Date().toISOString();
    return { ...product };
  });
}
