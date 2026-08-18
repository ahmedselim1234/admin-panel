"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export interface QueryState<T> {
  data: T | undefined;
  error: Error | undefined;
  isLoading: boolean;
  isFetching: boolean;
  refetch: () => void;
}

/**
 * Minimal data-fetching hook over the simulated API layer.
 *
 * Handles the parts that matter for the UI: loading vs background refetching,
 * error surfacing, stale-response discarding and manual refetch. Replacing it
 * with TanStack Query or SWR later is a one-file change.
 */
export function useApiQuery<T>(
  fetcher: () => Promise<T>,
  deps: readonly unknown[],
  options: { keepPreviousData?: boolean; enabled?: boolean } = {},
): QueryState<T> {
  const { keepPreviousData = true, enabled = true } = options;

  const [data, setData] = useState<T>();
  const [error, setError] = useState<Error>();
  const [isFetching, setIsFetching] = useState(enabled);
  const [nonce, setNonce] = useState(0);

  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  const requestId = useRef(0);

  useEffect(() => {
    if (!enabled) return;

    const id = ++requestId.current;
    setIsFetching(true);
    if (!keepPreviousData) setData(undefined);

    fetcherRef
      .current()
      .then((result) => {
        if (id !== requestId.current) return; // a newer request already won
        setData(result);
        setError(undefined);
      })
      .catch((err: unknown) => {
        if (id !== requestId.current) return;
        setError(err instanceof Error ? err : new Error("Something went wrong"));
      })
      .finally(() => {
        if (id === requestId.current) setIsFetching(false);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, nonce, enabled]);

  const refetch = useCallback(() => setNonce((n) => n + 1), []);

  return {
    data,
    error,
    isLoading: isFetching && data === undefined,
    isFetching,
    refetch,
  };
}

export interface MutationState<TInput, TResult> {
  mutate: (input: TInput) => Promise<TResult | undefined>;
  isPending: boolean;
  error: Error | undefined;
}

export function useApiMutation<TInput, TResult>(
  action: (input: TInput) => Promise<TResult>,
  options: {
    onSuccess?: (result: TResult, input: TInput) => void;
    onError?: (error: Error, input: TInput) => void;
  } = {},
): MutationState<TInput, TResult> {
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<Error>();

  const actionRef = useRef(action);
  actionRef.current = action;
  const optionsRef = useRef(options);
  optionsRef.current = options;

  const mutate = useCallback(async (input: TInput) => {
    setIsPending(true);
    setError(undefined);
    try {
      const result = await actionRef.current(input);
      optionsRef.current.onSuccess?.(result, input);
      return result;
    } catch (err: unknown) {
      const normalized = err instanceof Error ? err : new Error("Something went wrong");
      setError(normalized);
      optionsRef.current.onError?.(normalized, input);
      return undefined;
    } finally {
      setIsPending(false);
    }
  }, []);

  return { mutate, isPending, error };
}
