/**
 * The seam between the UI and "the backend".
 *
 * Every function in `lib/api` returns a Promise and resolves after a small,
 * randomised delay so the app exercises the same loading / error paths a real
 * network layer would. Swapping these implementations for `fetch()` calls
 * against a real API is a drop-in change — no component has to know.
 */
import { sleep } from "@/lib/utils";

export const LATENCY = { min: 350, max: 750 };

/** Set to a value between 0 and 1 to exercise error states in the UI. */
export const FAILURE_RATE = 0;

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status = 500,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export async function respond<T>(data: T | (() => T), options?: { delay?: number }): Promise<T> {
  const delay =
    options?.delay ??
    Math.round(LATENCY.min + Math.random() * (LATENCY.max - LATENCY.min));
  await sleep(delay);

  if (FAILURE_RATE > 0 && Math.random() < FAILURE_RATE) {
    throw new ApiError("The server is taking too long to respond. Please retry.", 503);
  }

  return typeof data === "function" ? (data as () => T)() : data;
}

/* --------------------------- Query helpers ------------------------------- */

export interface ListQuery {
  search?: string;
  sort?: string;
  dir?: "asc" | "desc";
  page?: number;
  pageSize?: number;
}

export function paginate<T>(rows: T[], page = 1, pageSize = 10) {
  const total = rows.length;
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const current = Math.min(Math.max(1, page), pageCount);
  return {
    rows: rows.slice((current - 1) * pageSize, current * pageSize),
    total,
    page: current,
    pageSize,
    pageCount,
  };
}

export function sortBy<T>(rows: T[], key: keyof T | string, dir: "asc" | "desc" = "asc") {
  const factor = dir === "asc" ? 1 : -1;
  return [...rows].sort((a, b) => {
    const left = (a as Record<string, unknown>)[key as string];
    const right = (b as Record<string, unknown>)[key as string];
    if (typeof left === "number" && typeof right === "number") return (left - right) * factor;
    return String(left ?? "").localeCompare(String(right ?? "")) * factor;
  });
}

export function matches(haystack: Array<string | undefined>, needle?: string) {
  if (!needle?.trim()) return true;
  const query = needle.trim().toLowerCase();
  return haystack.some((value) => value?.toLowerCase().includes(query));
}
