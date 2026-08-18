# E-Commerce Admin Dashboard — Project Plan

**Purpose:** Portfolio project for Upwork profile
**Owner:** Ahmed Selim — Full Stack Software Engineer
**Stack:** Next.js (Frontend-only, fully mocked data — built like a real full-stack app)
**Theme:** Blue & White, modern, clean, professional
**Language:** English (UI)

---

## 1. Project Goal

Build a visually strong, fully interactive E-commerce Admin Dashboard to showcase on Upwork. It must **look and behave like a production SaaS product** — real-feeling data, working filters, search, sorting, pagination, and charts — even though everything runs on local mock data (no real backend). The goal is to prove frontend architecture skills, UI/UX polish, and attention to detail to potential clients browsing the profile.

**Success criteria:**
- Looks like a paid SaaS product, not a template clone
- Fully responsive (desktop, tablet, mobile)
- Feels "real": loading states, empty states, working interactions
- Clean, scalable code structure a client can trust to hire for real work

---

## 2. Tech Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 14+ (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Components | shadcn/ui (Radix-based, matches blue/white theme easily) |
| State | Redux Toolkit (or Zustand if lighter state is preferred) |
| Charts | Recharts (clean, composable, good for admin dashboards) |
| Tables | TanStack Table (sorting, filtering, pagination built-in) |
| Icons | Lucide React |
| Forms | React Hook Form + Zod validation |
| Mock Data | Local JSON / TS mock modules + simulated API delay (setTimeout) to mimic real network calls |
| Animations | Framer Motion (subtle transitions only) |
| Deployment | Vercel (free, instant live demo link for Upwork profile) |

> Note: Even though there's no real backend, the app will be structured with a `services/` / `api/` layer that *simulates* fetch calls (with delay + loading states). This makes the codebase look and behave exactly like a full-stack app, and makes it trivial to swap in a real API later — a nice talking point in client calls.

---

## 3. Design System

**Color Palette (Blue & White)**

- Primary Blue: `#2563EB` (actions, active states, links)
- Deep Blue: `#1E3A8A` (headers, sidebar active, emphasis text)
- Sky Accent: `#60A5FA` (charts, secondary highlights)
- Background: `#F8FAFC` (app background)
- Surface/Cards: `#FFFFFF` with soft shadow
- Border: `#E2E8F0`
- Text Primary: `#0F172A`
- Text Secondary: `#64748B`
- Success: `#16A34A` | Warning: `#F59E0B` | Danger: `#DC2626`

**Typography:** Inter or Geist Sans — clean, modern, highly legible for data-dense screens.

**UI Principles**
- Generous white space, soft shadows instead of heavy borders
- Rounded corners (`rounded-xl`) for cards, buttons, inputs
- Consistent 8px spacing grid
- Sidebar navigation (collapsible) + top bar with search, notifications, profile
- Micro-interactions on hover/click (subtle scale/opacity via Framer Motion)
- Dark mode: optional stretch goal (nice extra to mention in the Upwork listing, not required for v1)

---

## 4. Information Architecture (Pages/Screens)

1. **Dashboard (Overview)**
   - KPI stat cards: Total Revenue, Total Orders, New Customers, Conversion Rate (with % change vs last period)
   - Revenue trend line/area chart (with date range filter: 7d / 30d / 90d / custom)
   - Orders by status donut/pie chart
   - Top selling products (mini table/list with thumbnails)
   - Recent orders table (last 5–10, link to full Orders page)
   - Sales by category bar chart

2. **Products**
   - Product grid/table toggle view
   - Filters: category, stock status, price range
   - Search bar (debounced)
   - Sort: price, stock, name, date added
   - Pagination
   - Product detail drawer/modal (images, variants, stock, price, description)
   - Add/Edit product form (mock create/update, toast confirmation)
   - Bulk actions (delete, change status) — mocked

3. **Orders**
   - Orders table: ID, customer, date, items, total, status, payment method
   - Filters: status (pending/shipped/delivered/cancelled), date range, payment method
   - Search by order ID or customer name
   - Order detail page/modal: items breakdown, shipping info, timeline/status stepper
   - Status update action (mocked, with toast + optimistic UI update)

4. **Customers**
   - Customer list table: name, email, total orders, total spent, join date, status
   - Search + filter (VIP, new, inactive)
   - Customer profile page: order history, lifetime value, contact info, notes
   - Simple "customer growth" mini chart

5. **Inventory**
   - Stock levels table with low-stock warning badges
   - Filter by category/warehouse (mocked)
   - Restock quick-action (mocked)

6. **Analytics**
   - Deeper charts: revenue by channel, best/worst performing products, traffic sources (mocked), sales heatmap by day/hour
   - Export button (mocked — triggers a "generating report" toast)

7. **Settings**
   - Store profile, payment methods, shipping zones, notification preferences (static/mock forms)
   - Team members table with roles (admin/editor/viewer)

8. **Auth Screens** (for portfolio completeness)
   - Login, Forgot Password — styled, mocked auth (no real backend)

---

## 5. Core Interactive Features (the "feels full-stack" part)

- Global search (top bar) with debounce + mock async results dropdown
- All tables: client-side sorting, multi-filter, search, pagination — via TanStack Table
- Loading skeletons on every data-fetching section (simulated latency ~400–800ms)
- Empty states designed (not just "No data" text — icon + helper text)
- Toast notifications (success/error) for every mocked action (create, update, delete, status change)
- Optimistic UI updates for order status changes and product edits
- Responsive sidebar (collapses to icons on tablet, drawer on mobile)
- URL-synced filters/query params (so filtered views are shareable/bookmarkable — a nice technical detail to highlight to clients)
- Dark/light mode toggle (stretch goal)

---

## 6. Mock Data Layer

- `lib/mock-data/` — TS files exporting typed arrays: `products.ts`, `orders.ts`, `customers.ts`, `analytics.ts`
- `lib/api/` — functions like `getOrders(filters)`, `getProducts(params)` that internally read mock data, apply filtering/sorting/pagination logic, and return a `Promise` with an artificial delay — so components call them exactly like real API calls (easy to swap for real endpoints later)
- Use realistic data: real-sounding product names, categories, prices, generated customer names, staggered dates — avoid obviously fake "Product 1, Product 2" naming (use a library like `@faker-js/faker` at data-generation time, then freeze the output into static JSON so the demo is consistent every load)

---

## 7. Folder Structure (proposed)

```
app/
  (auth)/login/
  (dashboard)/
    dashboard/
    products/
    orders/
    customers/
    inventory/
    analytics/
    settings/
components/
  ui/            -> shadcn primitives
  charts/
  tables/
  layout/        -> Sidebar, Topbar, Shell
  shared/        -> StatCard, EmptyState, LoadingSkeleton, StatusBadge
lib/
  mock-data/
  api/
  utils/
  hooks/
store/            -> Redux Toolkit slices (or zustand stores)
types/
```

---

## 8. Milestones / Timeline (suggested)

| Phase | Scope | Est. Time |
|---|---|---|
| 1 | Project setup, design system, layout shell (sidebar/topbar), theme | 1–2 days |
| 2 | Mock data layer + API simulation functions | 1 day |
| 3 | Dashboard Overview page (KPIs + charts) | 1–2 days |
| 4 | Products page (table, filters, detail, form) | 2 days |
| 5 | Orders page (table, filters, detail, status flow) | 1–2 days |
| 6 | Customers + Inventory pages | 1–2 days |
| 7 | Analytics page (advanced charts) | 1 day |
| 8 | Settings + Auth screens | 1 day |
| 9 | Responsive polish, empty/loading states, micro-interactions | 1–2 days |
| 10 | Deploy to Vercel, record demo GIF/video, write Upwork portfolio description | 0.5 day |

**Total estimate:** ~10–14 working days for a polished v1 (can compress if scope is trimmed).

---

## 9. Upwork Portfolio Presentation Checklist

- [ ] Live demo link (Vercel) — must load fast, no console errors
- [ ] 4–6 high-quality screenshots (desktop) covering Dashboard, Products, Orders, a chart-heavy view
- [ ] 1 mobile screenshot showing responsiveness
- [ ] Short screen-recording GIF (10–15s) showing a filter/search/interaction in action
- [ ] Portfolio description: name, tech stack used, 2–3 sentence summary of what it demonstrates (frontend architecture, data viz, UX polish, TypeScript, responsive design)
- [ ] GitHub repo (public, clean commit history, good README with setup instructions + screenshots)

---

## 10. Next Steps

Once this plan is approved, next session should move into implementation:
1. Scaffold the Next.js + TypeScript + Tailwind + shadcn/ui project
2. Build the design tokens/theme first (colors, typography, spacing)
3. Build layout shell (Sidebar + Topbar) before any page content
4. Build mock-data + API simulation layer
5. Implement pages in the milestone order above

*This document is a planning artifact only — no code has been written yet, per request.*
