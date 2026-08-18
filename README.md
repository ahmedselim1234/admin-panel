# Selim Commerce — E-commerce Admin Dashboard

A production-grade admin dashboard for an online store: revenue analytics, order
management, a product catalogue, inventory control and a customer CRM.

Everything runs on a **frozen, locally generated dataset** — 3,500+ orders, 900
customers and 96 products — served through a simulated API layer with realistic
network latency, so the app exercises the same loading, empty and error states a
real backend would produce.

> **Portfolio project** by Ahmed Selim — Full Stack Software Engineer.

---

## Highlights

| | |
|---|---|
| **Dashboard** | KPI cards with period-over-period deltas and sparklines, revenue trend chart (7D / 30D / 90D / 12M), orders-by-status donut, sales by category, top sellers, recent orders |
| **Products** | Table ⇄ grid views, debounced search, category / stock / status filters, sortable columns, pagination, detail drawer with variants, create & edit form (React Hook Form + Zod), bulk archive / activate / delete |
| **Orders** | Multi-filter table (status, payment method, channel, date range), full order page with line items, totals breakdown, fulfilment timeline and **optimistic** status updates |
| **Customers** | Segmented list (VIP / active / new / inactive), growth chart, profile page with lifetime value, full order history and internal notes |
| **Inventory** | Stock levels per warehouse, low-stock and out-of-stock badges, reorder thresholds, inline restocking |
| **Analytics** | Revenue by channel and category, traffic sources, best/worst performers, and a weekday × hour sales heatmap |
| **Settings** | Store profile form, payment providers, shipping zones, notification preferences, team members with role management |

Plus: global ⌘K search with async results, light/dark mode, collapsible sidebar,
URL-synced filters (every filtered view is shareable and survives a refresh),
loading skeletons everywhere, designed empty states, and toast feedback on every
mutation.

---

## Tech stack

- **Next.js 16** (App Router) + **React 19**
- **TypeScript** (strict)
- **Tailwind CSS v4** with a token-based design system
- **Radix UI** primitives (shadcn-style components, hand-rolled in `components/ui`)
- **Recharts** for charts, **TanStack Table** for data grids
- **React Hook Form** + **Zod** for forms and validation
- **Zustand** for UI state (sidebar, view mode, read notifications)
- **Sonner** for toasts, **Lucide** for icons
- **@faker-js/faker** at data-generation time only — never shipped to the client

---

## Architecture

```
app/
  (dashboard)/       dashboard, products, orders, customers, inventory,
                     analytics, settings    — shared sidebar + topbar shell
components/
  ui/                Design-system primitives (button, card, dialog, sheet, …)
  layout/            Sidebar, Topbar, global search, theme toggle
  shared/            StatCard, EmptyState, FilterBar, StatusBadge, PageHeader
  charts/            Recharts wrappers + shared palette, tooltip, sparkline
  tables/            Generic DataTable + pagination
  products/          Product grid, detail sheet, create/edit dialog
lib/
  api/               Simulated service layer (the seam to a real backend)
  mock-data/         Frozen JSON + hydration into domain objects
  hooks/             useApiQuery / useApiMutation, URL-state hooks
  utils.ts           Locale-locked formatters and helpers
store/               Zustand UI store
types/               Shared domain types
scripts/             Deterministic data generator
```

### The service layer

Every screen talks to `lib/api/*` — never to the mock data directly:

```ts
const { data, isLoading, error, refetch } = useApiQuery(
  () => getOrders({ status: "shipped", page: 2, sort: "total", dir: "desc" }),
  [queryKey],
);
```

Those functions apply filtering, sorting and pagination, then resolve a Promise
after a randomised 350–750 ms delay. Swapping them for `fetch()` calls against a
real API is a single-directory change — no component knows the difference.

`lib/api/client.ts` also exposes a `FAILURE_RATE` constant: set it above `0` to
make requests fail at random and watch the error and retry states throughout the
app.

### The data

`scripts/generate-data.mjs` is seeded, so the output is byte-identical on every
run and the demo always shows the same numbers. It models the things that make
fake data look fake:

- **Growth, weekday and seasonal shaping** on daily order volume
- **Long-tailed product popularity** — a few hero SKUs carry most of the revenue
- **Skewed purchase frequency** — a loyal core reorders, most customers buy once
- **Status distribution by order age** — recent orders are pending, old ones delivered
- Customer segments, product aggregates and analytics series are all **derived
  from the order history**, so every figure in the UI reconciles with every other

The JSON is stored normalized and compact (line items reference product ids);
`lib/mock-data/index.ts` hydrates it into rich domain objects at load — the same
join a real backend would do.

Regenerate with:

```bash
npm run generate:data
```

---

## Getting started

```bash
npm install
npm run dev      # http://localhost:3000
```

```bash
npm run build && npm start   # production build
```

Node 20+ recommended.

---

## Notes & trade-offs

- **No backend by design.** This project demonstrates frontend architecture, data
  visualisation and UX polish. Mutations persist for the session (in-memory
  store) and reset on reload.
- **No authentication.** The console is deliberately open — a reviewer lands on
  the dashboard immediately, with no sign-in wall between them and the work.
- **Dates are frozen** to the dataset's "today" (30 June 2025) so relative labels
  like "3 days ago" stay meaningful, and all formatters are locked to a fixed
  locale and UTC to guarantee identical server and client rendering.
- **Product imagery is generated** from each product name (gradient + monogram)
  rather than fetched, keeping the demo self-contained and free of layout shift.

---

## License

MIT — free to read, fork and learn from.
