export type ID = string;

/* ------------------------------- Products ------------------------------- */

export type ProductStatus = "active" | "draft" | "archived";

export type ProductCategory =
  | "Electronics"
  | "Apparel"
  | "Home & Living"
  | "Beauty"
  | "Sports"
  | "Accessories";

export interface ProductVariant {
  id: ID;
  name: string;
  sku: string;
  stock: number;
  price: number;
}

export interface Product {
  id: ID;
  name: string;
  sku: string;
  description: string;
  category: ProductCategory;
  price: number;
  compareAtPrice: number | null;
  cost: number;
  stock: number;
  lowStockThreshold: number;
  status: ProductStatus;
  rating: number;
  reviews: number;
  unitsSold: number;
  revenue: number;
  warehouse: Warehouse;
  tags: string[];
  variants: ProductVariant[];
  image: string;
  createdAt: string;
  updatedAt: string;
}

export type StockStatus = "in-stock" | "low-stock" | "out-of-stock";

export type Warehouse =
  | "Berlin DC"
  | "Rotterdam DC"
  | "Madrid DC"
  | "Warsaw DC";

/* -------------------------------- Orders -------------------------------- */

export type OrderStatus =
  | "pending"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "refunded";

export type PaymentMethod =
  | "Credit Card"
  | "PayPal"
  | "Apple Pay"
  | "Bank Transfer"
  | "Klarna";

export interface OrderItem {
  productId: ID;
  name: string;
  sku: string;
  image: string;
  quantity: number;
  price: number;
}

export interface OrderEvent {
  label: string;
  description: string;
  at: string;
  done: boolean;
}

export interface Order {
  id: ID;
  reference: string;
  customerId: ID;
  customerName: string;
  customerEmail: string;
  customerAvatarColor: string;
  createdAt: string;
  updatedAt: string;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  items: OrderItem[];
  itemCount: number;
  subtotal: number;
  shipping: number;
  tax: number;
  discount: number;
  total: number;
  shippingAddress: Address;
  timeline: OrderEvent[];
  channel: SalesChannel;
}

export interface Address {
  line1: string;
  city: string;
  postalCode: string;
  country: string;
}

export type SalesChannel =
  | "Online Store"
  | "Mobile App"
  | "Marketplace"
  | "Social"
  | "Retail POS";

/* ------------------------------- Customers ------------------------------ */

export type CustomerStatus = "vip" | "active" | "new" | "inactive";

export interface CustomerNote {
  id: ID;
  author: string;
  body: string;
  at: string;
}

export interface Customer {
  id: ID;
  name: string;
  email: string;
  phone: string;
  avatarColor: string;
  status: CustomerStatus;
  orders: number;
  totalSpent: number;
  averageOrderValue: number;
  joinedAt: string;
  lastOrderAt: string;
  address: Address;
  notes: CustomerNote[];
}

/* ------------------------------- Analytics ------------------------------ */

export interface RevenuePoint {
  date: string;
  revenue: number;
  orders: number;
  visitors: number;
}

export interface CategorySales {
  category: ProductCategory;
  revenue: number;
  units: number;
}

export interface ChannelSales {
  channel: SalesChannel;
  revenue: number;
  share: number;
}

export interface TrafficSource {
  source: string;
  visitors: number;
  conversion: number;
}

export interface HeatmapCell {
  day: number;
  hour: number;
  value: number;
}

export interface KpiSummary {
  revenue: MetricValue;
  orders: MetricValue;
  customers: MetricValue;
  conversion: MetricValue;
}

export interface MetricValue {
  value: number;
  previous: number;
  change: number;
  trend: number[];
}

/* --------------------------------- Team --------------------------------- */

export type TeamRole = "admin" | "editor" | "viewer";

export interface TeamMember {
  id: ID;
  name: string;
  email: string;
  role: TeamRole;
  avatarColor: string;
  lastActive: string;
  status: "active" | "invited";
}

/* --------------------------------- Query -------------------------------- */

export type SortDirection = "asc" | "desc";

export interface Paginated<T> {
  rows: T[];
  total: number;
  page: number;
  pageSize: number;
  pageCount: number;
}

export type DateRangeKey = "7d" | "30d" | "90d" | "12m";
