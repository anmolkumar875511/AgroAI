import { useState, useEffect, useCallback, useRef } from 'react';

interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useApi<T>(
  fetcher: () => Promise<T>,
  deps: unknown[] = [],
): UseApiState<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  const dataRef = useRef<T | null>(null);
  dataRef.current = data;

  const fetch = useCallback(async () => {
    // Only show full loading state on first load when no data exists.
    // Keeps previous data visible during location changes to prevent layout flicker.
    setLoading(dataRef.current === null);
    setError(null);
    try {
      const result = await fetcherRef.current();
      setData(result);
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, deps);

  useEffect(() => { fetch(); }, [fetch]);

  return { data, loading, error, refetch: fetch };
}

/** Skeleton loading helper — returns true while loading */
export function useApiOnce<T>(fetcher: () => Promise<T>): UseApiState<T> {
  return useApi(fetcher, []);
}
