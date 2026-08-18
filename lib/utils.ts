import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { StockStatus } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formatters are locked to a fixed locale and UTC so the server render and the
 * client hydration always produce the exact same string.
 */
const LOCALE = "en-IE";

const currency = new Intl.NumberFormat(LOCALE, {
  style: "currency",
  currency: "EUR",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const currencyCompact = new Intl.NumberFormat(LOCALE, {
  style: "currency",
  currency: "EUR",
  notation: "compact",
  maximumFractionDigits: 1,
});

const number = new Intl.NumberFormat(LOCALE);
const numberCompact = new Intl.NumberFormat(LOCALE, {
  notation: "compact",
  maximumFractionDigits: 1,
});

const dateShort = new Intl.DateTimeFormat(LOCALE, {
  day: "2-digit",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

const dateTime = new Intl.DateTimeFormat(LOCALE, {
  day: "2-digit",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
  timeZone: "UTC",
});

const dayMonth = new Intl.DateTimeFormat(LOCALE, {
  day: "numeric",
  month: "short",
  timeZone: "UTC",
});

const monthYear = new Intl.DateTimeFormat(LOCALE, {
  month: "short",
  year: "2-digit",
  timeZone: "UTC",
});

export const formatCurrency = (value: number) => currency.format(value);
export const formatCurrencyCompact = (value: number) => currencyCompact.format(value);
export const formatNumber = (value: number) => number.format(value);
export const formatCompact = (value: number) => numberCompact.format(value);
export const formatDate = (value: string | Date) => dateShort.format(new Date(value));
export const formatDateTime = (value: string | Date) => dateTime.format(new Date(value));
export const formatDayMonth = (value: string | Date) => dayMonth.format(new Date(value));
export const formatMonthYear = (value: string | Date) => monthYear.format(new Date(value));

export function formatPercent(value: number, digits = 1) {
  return `${value > 0 ? "+" : ""}${value.toFixed(digits)}%`;
}

/** "3 days ago" style label, computed against the dataset's frozen "today". */
export const DATASET_TODAY = new Date("2025-07-01T09:00:00.000Z");

export function formatRelative(value: string | Date) {
  const diff = DATASET_TODAY.getTime() - new Date(value).getTime();
  const minutes = Math.round(diff / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} h ago`;
  const days = Math.round(hours / 24);
  if (days === 1) return "yesterday";
  if (days < 30) return `${days} days ago`;
  const months = Math.round(days / 30);
  if (months < 12) return `${months} mo ago`;
  return `${Math.round(months / 12)} y ago`;
}

export function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export function stockStatus(stock: number, threshold: number): StockStatus {
  if (stock <= 0) return "out-of-stock";
  if (stock <= threshold) return "low-stock";
  return "in-stock";
}

export function percentChange(current: number, previous: number) {
  if (!previous) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
}

export function sum(values: number[]) {
  return values.reduce((a, b) => a + b, 0);
}

export function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

/** Deterministic hue from any string — used for generated product artwork. */
export function hashHue(seed: string) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) % 360;
  return h;
}

export const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
