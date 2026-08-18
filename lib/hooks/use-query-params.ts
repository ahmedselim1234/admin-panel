"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

export type ParamValue = string | number | null | undefined;

/**
 * Keeps table state (search, filters, sort, page) in the URL so every view is
 * shareable, bookmarkable and survives a refresh or a back-button press.
 */
export function useQueryParams() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const get = useCallback(
    (key: string, fallback = "") => searchParams.get(key) ?? fallback,
    [searchParams],
  );

  const getNumber = useCallback(
    (key: string, fallback: number) => {
      const raw = searchParams.get(key);
      const parsed = raw == null ? NaN : Number(raw);
      return Number.isFinite(parsed) ? parsed : fallback;
    },
    [searchParams],
  );

  const setParams = useCallback(
    (patch: Record<string, ParamValue>, options: { resetPage?: boolean } = {}) => {
      const next = new URLSearchParams(searchParams.toString());

      for (const [key, value] of Object.entries(patch)) {
        if (value == null || value === "" || value === "all") next.delete(key);
        else next.set(key, String(value));
      }

      if (options.resetPage !== false && !("page" in patch)) next.delete("page");

      const query = next.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  const reset = useCallback(() => router.replace(pathname, { scroll: false }), [pathname, router]);

  const activeCount = useMemo(
    () => [...searchParams.keys()].filter((key) => key !== "page").length,
    [searchParams],
  );

  return { get, getNumber, setParams, reset, activeCount, searchParams };
}

/** Debounced local mirror of a URL param — keeps typing snappy. */
export function useDebouncedParam(key: string, delay = 350) {
  const { get, setParams } = useQueryParams();
  const urlValue = get(key);
  const [value, setValue] = useState(urlValue);
  const touched = useRef(false);

  useEffect(() => {
    if (!touched.current) setValue(urlValue);
  }, [urlValue]);

  useEffect(() => {
    if (!touched.current || value === urlValue) return;
    const timer = setTimeout(() => setParams({ [key]: value || null }), delay);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, delay, key]);

  const onChange = useCallback((next: string) => {
    touched.current = true;
    setValue(next);
  }, []);

  return [value, onChange] as const;
}

export function useDebouncedValue<T>(value: T, delay = 300) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

export function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const list = window.matchMedia(query);
    const update = () => setMatches(list.matches);
    update();
    list.addEventListener("change", update);
    return () => list.removeEventListener("change", update);
  }, [query]);

  return matches;
}
