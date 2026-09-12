import { supabase } from "@/lib/supabase";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useEffect, useRef, useState } from "react";

export type UseCachedQueryResult<T> = {
  data: T[];
  loading: boolean;
  isOffline: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
};

/**
 * Fetches rows from a Supabase table, caching the result in AsyncStorage
 * and falling back to that cache when the network/query fails — this is a
 * read-only app that displays Supabase data, so staying usable offline
 * with the last-known-good data matters more than always being fresh.
 */
export function useCachedQuery<T = unknown>(
  cacheKey: string,
  table: string,
  select: string = "*"
): UseCachedQueryResult<T> {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOffline, setIsOffline] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const mounted = useRef(true);
  // Guards against a slow, stale request resolving after a newer one and
  // overwriting fresher state — matters here because cacheKey/table/select
  // can change (e.g. switching selected city triggers new area queries).
  const requestId = useRef(0);

  const fetchAndCache = useCallback(async () => {
    const thisRequestId = ++requestId.current;
    setError(null);

    try {
      const { data: rows, error: queryError } = await supabase
        .from(table)
        .select(select);

      if (queryError) throw queryError;
      if (!rows) throw new Error(`"${table}" query returned no data`);

      await AsyncStorage.setItem(cacheKey, JSON.stringify(rows));

      if (!mounted.current || thisRequestId !== requestId.current) return;
      setData(rows as T[]);
      setIsOffline(false);
      setLoading(false);
    } catch (err) {
      try {
        const cached = await AsyncStorage.getItem(cacheKey);
        if (!mounted.current || thisRequestId !== requestId.current) return;

        if (cached) {
          setData(JSON.parse(cached) as T[]);
          setIsOffline(true);
          setError(null);
        } else {
          setData([]);
          setError(err instanceof Error ? err : new Error(String(err)));
        }
      } catch (cacheErr) {
        if (!mounted.current || thisRequestId !== requestId.current) return;
        setError(
          cacheErr instanceof Error ? cacheErr : new Error(String(cacheErr))
        );
        setData([]);
      } finally {
        if (mounted.current && thisRequestId === requestId.current) {
          setLoading(false);
        }
      }
    }
  }, [cacheKey, table, select]);

  // Public refresh action — explicitly flips loading back to true, since
  // the initial mount already starts with loading=true via useState.
  const refresh = useCallback(async () => {
    setLoading(true);
    await fetchAndCache();
  }, [fetchAndCache]);

  useEffect(() => {
    mounted.current = true;
    (async () => {
      await fetchAndCache();
    })();
    return () => {
      mounted.current = false;
    };
  }, [fetchAndCache]);

  return { data, loading, isOffline, error, refresh };
}
