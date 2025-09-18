// hooks/useCachedQuery.ts
import { supabase } from "@/lib/supabase";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useRef, useState } from "react";

export type UseCachedQueryResult<T> = {
  data: T[];
  loading: boolean;
  isOffline: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
};

export function useCachedQuery<T = any>(
  cacheKey: string,
  table: string,
  select: string = "*"
): UseCachedQueryResult<T> {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOffline, setIsOffline] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const mounted = useRef(true);

  async function fetchAndCache() {
    setLoading(true);
    setError(null);

    try {
      const { data: rows, error } = await supabase.from(table).select(select);
      if (error) throw error;
      if (!rows) throw new Error("No data");

      // Save cache
      await AsyncStorage.setItem(cacheKey, JSON.stringify(rows));
      if (!mounted.current) return;

      setData(rows as T[]);
      setIsOffline(false);
      setLoading(false);
    } catch (err: any) {
      // On error -> try load cache
      try {
        const cached = await AsyncStorage.getItem(cacheKey);
        if (cached) {
          const parsed = JSON.parse(cached) as T[];
          if (!mounted.current) return;
          setData(parsed);
          setIsOffline(true);
          setError(null);
        } else {
          if (!mounted.current) return;
          setData([]);
          setError(err instanceof Error ? err : new Error(String(err)));
        }
      } catch (cacheErr) {
        if (!mounted.current) return;
        setError(
          cacheErr instanceof Error ? cacheErr : new Error(String(cacheErr))
        );
        setData([]);
      } finally {
        if (mounted.current) setLoading(false);
      }
    }
  }

  useEffect(() => {
    mounted.current = true;
    fetchAndCache();
    return () => {
      mounted.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cacheKey, table, select]);

  return {
    data,
    loading,
    isOffline,
    error,
    refresh: fetchAndCache,
  };
}
