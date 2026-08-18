/**
 * Deterministic mock-data generator.
 *
 * Run with `npm run generate:data`. Output is frozen into JSON under
 * lib/mock-data so the demo renders identical data on every load / deploy.
 */
import { faker } from "@faker-js/faker";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = resolve(__dirname, "../lib/mock-data");
mkdirSync(OUT, { recursive: true });

faker.seed(20240517);

const TODAY = new Date("2025-06-30T12:00:00.000Z");
const DAYS = 420;

const iso = (d) => new Date(d).toISOString();
const daysAgo = (n) => new Date(TODAY.getTime() - n * 86400000);
const round = (n, p = 2) => Math.round(n * 10 ** p) / 10 ** p;
const pick = (arr) => faker.helpers.arrayElement(arr);
const weighted = (pairs) => faker.helpers.weightedArrayElement(pairs);

/** Short, stable, human-readable ids keep the frozen JSON small. */
const counters = {};
const nextId = (prefix) => {
  counters[prefix] = (counters[prefix] ?? 0) + 1;
  return `${prefix}_${String(counters[prefix]).padStart(4, "0")}`;
};

const AVATAR_COLORS = [
  "#2563EB", "#1E3A8A", "#60A5FA", "#0EA5E9", "#6366F1",
  "#0891B2", "#7C3AED", "#DB2777", "#059669", "#F59E0B",
];

const CATEGORIES = [
  "Electronics", "Apparel", "Home & Living", "Beauty", "Sports", "Accessories",
];

const WAREHOUSES = ["Berlin DC", "Rotterdam DC", "Madrid DC", "Warsaw DC"];

const CHANNELS = ["Online Store", "Mobile App", "Marketplace", "Social", "Retail POS"];

/* ------------------------------- Products -------------------------------- */

const PRODUCT_BLUEPRINTS = {
  Electronics: {
    prefix: ["Aurora", "Nimbus", "Vertex", "Halo", "Pulse", "Lumen", "Orbit", "Nova"],
    noun: [
      "Wireless Earbuds", "Noise-Cancelling Headphones", "Mechanical Keyboard",
      "4K Webcam", "Portable SSD 1TB", "Smart Speaker", "USB-C Hub",
      "Bluetooth Tracker", "Desk Microphone", "Fast Charger 65W",
      "Fitness Watch", "E-Reader 7in",
    ],
    price: [39, 349],
  },
  Apparel: {
    prefix: ["Northline", "Kestrel", "Atlas", "Everly", "Ridge", "Solace"],
    noun: [
      "Merino Crew Sweater", "Oversized Hoodie", "Linen Shirt", "Tailored Chinos",
      "Rain Shell Jacket", "Cotton Tee", "Wool Overcoat", "Knit Cardigan",
      "Performance Joggers", "Denim Jacket",
    ],
    price: [24, 289],
  },
  "Home & Living": {
    prefix: ["Loom", "Terra", "Hearth", "Cedar", "Sable", "Alcove"],
    noun: [
      "Ceramic Vase Set", "Linen Duvet Cover", "Oak Side Table", "Scented Candle Trio",
      "Stoneware Mug Set", "Woven Throw Blanket", "Floor Lamp", "Espresso Kettle",
      "Bamboo Cutting Board", "Storage Basket",
    ],
    price: [18, 429],
  },
  Beauty: {
    prefix: ["Lumiere", "Botanic", "Dewpoint", "Elara", "Verve"],
    noun: [
      "Vitamin C Serum", "Hydrating Cleanser", "Retinol Night Cream", "Lip Balm Duo",
      "Mineral Sunscreen SPF50", "Repair Hair Mask", "Facial Roller", "Body Oil",
      "Clay Mask", "Eye Contour Gel",
    ],
    price: [12, 96],
  },
  Sports: {
    prefix: ["Apex", "Trailhead", "Vantage", "Summit", "Kinetic"],
    noun: [
      "Yoga Mat Pro", "Adjustable Dumbbell", "Running Vest", "Insulated Bottle 1L",
      "Resistance Band Set", "Trail Backpack 24L", "Cycling Gloves", "Foam Roller",
      "Jump Rope", "Training Shorts",
    ],
    price: [16, 249],
  },
  Accessories: {
    prefix: ["Marlow", "Corso", "Bexley", "Aster", "Wren"],
    noun: [
      "Leather Cardholder", "Canvas Weekender", "Minimalist Watch", "Sunglasses",
      "Silk Scarf", "Laptop Sleeve 14in", "Woven Belt", "Travel Wallet",
      "Beanie", "Keyring Set",
    ],
    price: [14, 219],
  },
};

const usedNames = new Set();

function productName(category) {
  const bp = PRODUCT_BLUEPRINTS[category];
  for (let i = 0; i < 50; i++) {
    const name = `${pick(bp.prefix)} ${pick(bp.noun)}`;
    if (!usedNames.has(name)) {
      usedNames.add(name);
      return name;
    }
  }
  const fallback = `${pick(bp.prefix)} ${pick(bp.noun)} ${usedNames.size}`;
  usedNames.add(fallback);
  return fallback;
}

const skuCounter = { n: 1000 };

function makeProduct(category) {
  const bp = PRODUCT_BLUEPRINTS[category];
  const name = productName(category);
  const price = round(faker.number.float({ min: bp.price[0], max: bp.price[1] }) - 0.01);
  const hasDiscount = faker.datatype.boolean({ probability: 0.28 });
  const status = weighted([
    { value: "active", weight: 82 },
    { value: "draft", weight: 10 },
    { value: "archived", weight: 8 },
  ]);
  const stock = weighted([
    { value: 0, weight: 6 },
    { value: faker.number.int({ min: 1, max: 12 }), weight: 14 },
    { value: faker.number.int({ min: 13, max: 120 }), weight: 50 },
    { value: faker.number.int({ min: 121, max: 640 }), weight: 30 },
  ]);
  const createdAt = daysAgo(faker.number.int({ min: 20, max: DAYS }));
  const sku = `${category.slice(0, 2).toUpperCase()}-${skuCounter.n++}`;

  const variantAxis = {
    Apparel: ["XS", "S", "M", "L", "XL"],
    Accessories: ["One Size", "Small", "Large"],
    Electronics: ["Midnight", "Silver", "Sand"],
    Beauty: ["30 ml", "50 ml", "100 ml"],
    Sports: ["Standard", "Pro"],
    "Home & Living": ["Natural", "Charcoal", "Ivory"],
  }[category];

  const variants = faker.helpers
    .arrayElements(variantAxis, faker.number.int({ min: 2, max: Math.min(4, variantAxis.length) }))
    .map((v, i) => ({
      id: `${sku}-V${i + 1}`,
      name: v,
      sku: `${sku}-${v.replace(/\s|\./g, "").toUpperCase().slice(0, 4)}`,
      stock: Math.max(
        0,
        Math.round(stock / variantAxis.length) + faker.number.int({ min: -4, max: 9 }),
      ),
      price: round(price + faker.number.int({ min: 0, max: 3 }) * 5),
    }));

  return {
    id: nextId("prd"),
    name,
    sku,
    description: `${name} - ${faker.commerce.productDescription()}`,
    category,
    price,
    compareAtPrice: hasDiscount
      ? round(price * faker.number.float({ min: 1.15, max: 1.45 }))
      : null,
    cost: round(price * faker.number.float({ min: 0.35, max: 0.62 })),
    stock,
    lowStockThreshold: faker.helpers.arrayElement([10, 15, 20, 25]),
    status,
    rating: round(faker.number.float({ min: 3.2, max: 5 }), 1),
    reviews: faker.number.int({ min: 3, max: 940 }),
    unitsSold: 0,
    revenue: 0,
    warehouse: pick(WAREHOUSES),
    tags: faker.helpers.arrayElements(
      ["bestseller", "new", "limited", "eco", "bundle", "seasonal", "clearance"],
      faker.number.int({ min: 1, max: 3 }),
    ),
    variants,
    image: name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    createdAt: iso(createdAt),
    updatedAt: iso(daysAgo(faker.number.int({ min: 0, max: 18 }))),
  };
}

const products = [];
for (let i = 0; i < 96; i++) {
  products.push(makeProduct(CATEGORIES[i % CATEGORIES.length]));
}
products.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));

/* ------------------------------- Customers ------------------------------- */

const COUNTRIES = [
  ["Germany", "Berlin"], ["Netherlands", "Amsterdam"], ["Spain", "Madrid"],
  ["France", "Lyon"], ["Poland", "Krakow"], ["Italy", "Milan"],
  ["Sweden", "Stockholm"], ["Portugal", "Porto"], ["Ireland", "Dublin"],
  ["United Kingdom", "Manchester"],
];

function makeCustomer() {
  const first = faker.person.firstName();
  const last = faker.person.lastName();
  const [country, city] = pick(COUNTRIES);
  const joinedAt = daysAgo(faker.number.int({ min: 1, max: DAYS }));
  return {
    id: nextId("cus"),
    name: `${first} ${last}`,
    email: faker.internet
      .email({
        firstName: first,
        lastName: last,
        provider: pick(["gmail.com", "outlook.com", "proton.me", "fastmail.com", "icloud.com"]),
      })
      .toLowerCase(),
    phone: faker.phone.number({ style: "international" }),
    avatarColor: pick(AVATAR_COLORS),
    status: "new",
    orders: 0,
    totalSpent: 0,
    averageOrderValue: 0,
    joinedAt: iso(joinedAt),
    lastOrderAt: iso(joinedAt),
    address: {
      line1: faker.location.streetAddress(),
      city,
      postalCode: faker.location.zipCode("####"),
      country,
    },
    notes: [],
  };
}

const customers = Array.from({ length: 900 }, makeCustomer);

/**
 * Purchase frequency is heavily skewed in retail: a small loyal core orders
 * again and again, while most shoppers buy once or twice. Weighting the
 * customer draw gives the VIP / active / inactive segments real meaning.
 */
const customerLottery = faker.helpers
  .shuffle([...customers])
  .map((customer, rank) => ({ value: customer, weight: rank < 60 ? 90 : rank < 240 ? 18 : 4 }));

/* -------------------------------- Orders --------------------------------- */

/** Growth + weekday + seasonal shaping so the revenue chart tells a story. */
function dayWeight(dayIndex) {
  const t = (DAYS - dayIndex) / DAYS; // 0 (oldest) -> 1 (today)
  const growth = 0.62 + t * 0.75;
  const date = daysAgo(dayIndex);
  const dow = date.getUTCDay();
  const weekend = dow === 0 || dow === 6 ? 0.78 : 1;
  const monday = dow === 1 ? 1.12 : 1;
  const seasonal = 1 + 0.18 * Math.sin((date.getUTCMonth() / 12) * Math.PI * 2 + 1.2);
  return growth * weekend * monday * seasonal;
}

const activeProducts = products.filter((p) => p.status !== "archived");

/**
 * Real catalogues are long-tailed: a handful of hero SKUs carry most of the
 * volume. Weight each product with a Zipf-style score and draw line items from
 * that distribution so "best sellers" and "underperformers" are far apart.
 */
const popularity = faker.helpers
  .shuffle([...activeProducts])
  .map((product, rank) => ({ value: product, weight: Math.round(2400 / (rank + 2)) }));

function drawProducts(count) {
  const picked = [];
  for (let attempt = 0; attempt < count * 6 && picked.length < count; attempt++) {
    const product = weighted(popularity);
    if (!picked.includes(product)) picked.push(product);
  }
  return picked;
}
const orders = [];
let orderNo = 10241;

for (let d = DAYS; d >= 0; d--) {
  const base = 9 * dayWeight(d);
  const count = Math.max(1, Math.round(faker.number.float({ min: base * 0.7, max: base * 1.3 })));

  for (let i = 0; i < count; i++) {
    const created = daysAgo(d);
    created.setUTCHours(
      faker.number.int({ min: 7, max: 22 }),
      faker.number.int({ min: 0, max: 59 }),
      0,
      0,
    );

    const customer = weighted(customerLottery);
    const lineCount = weighted([
      { value: 1, weight: 46 }, { value: 2, weight: 28 },
      { value: 3, weight: 16 }, { value: 4, weight: 10 },
    ]);
    // Line items stay normalized (product id + qty + unit price); names, SKUs and
    // images are joined back on read by the data layer to keep the payload small.
    const items = drawProducts(lineCount).map((p) => ({
      p: p.id,
      q: weighted([
        { value: 1, weight: 68 }, { value: 2, weight: 20 },
        { value: 3, weight: 8 }, { value: 4, weight: 4 },
      ]),
      u: p.price,
    }));

    const subtotal = round(items.reduce((s, it) => s + it.u * it.q, 0));
    const discount = faker.datatype.boolean({ probability: 0.22 })
      ? round(subtotal * faker.helpers.arrayElement([0.05, 0.1, 0.15]))
      : 0;
    const shipping = subtotal > 120 ? 0 : faker.helpers.arrayElement([4.9, 6.9, 9.9]);
    const tax = round((subtotal - discount) * 0.19);
    const total = round(subtotal - discount + shipping + tax);

    let status;
    if (d > 14) {
      status = weighted([
        { value: "delivered", weight: 84 }, { value: "cancelled", weight: 8 },
        { value: "refunded", weight: 8 },
      ]);
    } else if (d > 6) {
      status = weighted([
        { value: "delivered", weight: 58 }, { value: "shipped", weight: 26 },
        { value: "cancelled", weight: 8 }, { value: "refunded", weight: 8 },
      ]);
    } else if (d > 2) {
      status = weighted([
        { value: "shipped", weight: 48 }, { value: "processing", weight: 26 },
        { value: "delivered", weight: 18 }, { value: "cancelled", weight: 8 },
      ]);
    } else {
      status = weighted([
        { value: "pending", weight: 44 }, { value: "processing", weight: 36 },
        { value: "shipped", weight: 16 }, { value: "cancelled", weight: 4 },
      ]);
    }

    orders.push({
      id: nextId("ord"),
      reference: `#ORD-${orderNo++}`,
      customerId: customer.id,
      createdAt: iso(created),
      status,
      paymentMethod: weighted([
        { value: "Credit Card", weight: 44 }, { value: "PayPal", weight: 24 },
        { value: "Apple Pay", weight: 14 }, { value: "Klarna", weight: 11 },
        { value: "Bank Transfer", weight: 7 },
      ]),
      channel: weighted([
        { value: "Online Store", weight: 46 }, { value: "Mobile App", weight: 24 },
        { value: "Marketplace", weight: 14 }, { value: "Social", weight: 9 },
        { value: "Retail POS", weight: 7 },
      ]),
      items,
      subtotal,
      shipping,
      tax,
      discount,
      total,
    });
  }
}

orders.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));

/* ---------------------- Derive customer aggregates ----------------------- */

const byCustomer = new Map();
for (const o of orders) {
  if (o.status === "cancelled") continue;
  const agg = byCustomer.get(o.customerId) ?? { orders: 0, spent: 0, last: o.createdAt };
  agg.orders += 1;
  agg.spent += o.status === "refunded" ? 0 : o.total;
  if (o.createdAt > agg.last) agg.last = o.createdAt;
  byCustomer.set(o.customerId, agg);
}

const NOTE_BODIES = [
  "Called about a delayed delivery - carrier confirmed reroute, customer happy.",
  "Requested an invoice with VAT number for a company purchase.",
  "Prefers email over phone. Interested in the loyalty programme.",
  "Returned one item due to sizing; exchange handled without issue.",
  "High-value repeat buyer - flagged for the early-access campaign.",
];
const AGENTS = ["Ahmed Selim", "Lena Fischer", "Marco Rossi", "Sofia Novak"];

for (const c of customers) {
  const agg = byCustomer.get(c.id) ?? { orders: 0, spent: 0, last: c.joinedAt };
  c.orders = agg.orders;
  c.totalSpent = round(agg.spent);
  c.averageOrderValue = agg.orders ? round(agg.spent / agg.orders) : 0;
  c.lastOrderAt = agg.last;


  if (faker.datatype.boolean({ probability: 0.35 })) {
    c.notes = faker.helpers
      .arrayElements(NOTE_BODIES, faker.number.int({ min: 1, max: 2 }))
      .map((body) => ({
        id: nextId("note"),
        author: pick(AGENTS),
        body,
        at: iso(daysAgo(faker.number.int({ min: 2, max: 200 }))),
      }));
  }
}

customers.sort((a, b) => b.totalSpent - a.totalSpent);

// Segments are relative to the whole book of customers, not fixed euro amounts.
const vipCutoff = Math.round(customers.length * 0.07);
customers.forEach((c, rank) => {
  const daysSinceOrder = (TODAY - new Date(c.lastOrderAt)) / 86400000;
  const daysSinceJoin = (TODAY - new Date(c.joinedAt)) / 86400000;
  if (rank < vipCutoff && c.orders >= 6) c.status = "vip";
  else if (c.orders > 0 && daysSinceOrder > 150) c.status = "inactive";
  else if (daysSinceJoin < 45) c.status = "new";
  else if (c.orders === 0) c.status = "inactive";
  else c.status = "active";
});

/* ----------------------- Derive product aggregates ----------------------- */

const productStats = new Map();
for (const o of orders) {
  if (o.status === "cancelled" || o.status === "refunded") continue;
  for (const it of o.items) {
    const s = productStats.get(it.p) ?? { units: 0, revenue: 0 };
    s.units += it.q;
    s.revenue += it.q * it.u;
    productStats.set(it.p, s);
  }
}
for (const p of products) {
  const s = productStats.get(p.id) ?? { units: 0, revenue: 0 };
  p.unitsSold = s.units;
  p.revenue = round(s.revenue);
}

/* ------------------------------- Analytics ------------------------------- */

const dailyMap = new Map();
for (let d = DAYS; d >= 0; d--) {
  const key = daysAgo(d).toISOString().slice(0, 10);
  dailyMap.set(key, { date: key, revenue: 0, orders: 0, visitors: 0 });
}
for (const o of orders) {
  const row = dailyMap.get(o.createdAt.slice(0, 10));
  if (!row) continue;
  row.orders += 1;
  if (o.status !== "cancelled" && o.status !== "refunded") row.revenue += o.total;
}
const revenueSeries = [...dailyMap.values()].map((row) => ({
  date: row.date,
  revenue: round(row.revenue),
  orders: row.orders,
  visitors: Math.round(row.orders / faker.number.float({ min: 0.021, max: 0.041 })),
}));

const categoryMap = new Map(CATEGORIES.map((c) => [c, { category: c, revenue: 0, units: 0 }]));
const channelMap = new Map(CHANNELS.map((c) => [c, { channel: c, revenue: 0, share: 0 }]));
const productById = new Map(products.map((p) => [p.id, p]));

for (const o of orders) {
  if (o.status === "cancelled" || o.status === "refunded") continue;
  channelMap.get(o.channel).revenue += o.total;
  for (const it of o.items) {
    const p = productById.get(it.p);
    if (!p) continue;
    const c = categoryMap.get(p.category);
    c.revenue += it.q * it.u;
    c.units += it.q;
  }
}

const categorySales = [...categoryMap.values()]
  .map((c) => ({ ...c, revenue: round(c.revenue) }))
  .sort((a, b) => b.revenue - a.revenue);

const channelTotal = [...channelMap.values()].reduce((s, c) => s + c.revenue, 0);
const channelSales = [...channelMap.values()]
  .map((c) => ({
    ...c,
    revenue: round(c.revenue),
    share: round((c.revenue / channelTotal) * 100, 1),
  }))
  .sort((a, b) => b.revenue - a.revenue);

const trafficSources = [
  ["Organic Search", 38], ["Direct", 22], ["Paid Social", 16],
  ["Email", 12], ["Referral", 7], ["Affiliates", 5],
].map(([source, share]) => ({
  source,
  visitors: Math.round((share / 100) * 486000),
  conversion: round(faker.number.float({ min: 1.4, max: 4.6 }), 2),
}));

const heatmap = [];
for (let day = 0; day < 7; day++) {
  for (let hour = 0; hour < 24; hour++) {
    const dayFactor = day === 5 || day === 6 ? 0.72 : 1;
    const peak =
      Math.exp(-((hour - 13) ** 2) / 26) + 0.75 * Math.exp(-((hour - 20) ** 2) / 12);
    heatmap.push({
      day,
      hour,
      value: Math.round(peak * dayFactor * faker.number.float({ min: 780, max: 1180 })),
    });
  }
}

/* --------------------------------- Team ---------------------------------- */

const team = [
  ["Ahmed Selim", "admin", "active"],
  ["Lena Fischer", "admin", "active"],
  ["Marco Rossi", "editor", "active"],
  ["Sofia Novak", "editor", "active"],
  ["Tomas Ferreira", "viewer", "active"],
  ["Julia Bergman", "viewer", "invited"],
  ["Yuki Tanaka", "editor", "invited"],
].map(([name, role, status]) => ({
  id: nextId("usr"),
  name,
  email: `${name.toLowerCase().replace(/ /g, ".")}@selimcommerce.store`,
  role,
  status,
  avatarColor: pick(AVATAR_COLORS),
  lastActive: iso(daysAgo(faker.number.int({ min: 0, max: 30 }))),
}));

/* --------------------------------- Write --------------------------------- */

const write = (file, data) => {
  writeFileSync(resolve(OUT, file), JSON.stringify(data));
  console.log(`  ${file.padEnd(16)} ${Array.isArray(data) ? data.length + " records" : "ok"}`);
};

console.log("Generating frozen mock data...");
write("products.json", products);
write("customers.json", customers);
write("orders.json", orders);
write("team.json", team);
write("analytics.json", { revenueSeries, categorySales, channelSales, trafficSources, heatmap });
console.log("Done.");
