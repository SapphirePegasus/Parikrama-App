import { supabase } from "@/lib/supabase";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

export type AppConfig = Record<string, string>;

const CACHE_KEY = "parikrama_config_v1";

type AppConfigContextValue = {
  config: AppConfig;
  loading: boolean;
  isOffline: boolean;
  refresh: () => Promise<void>;
};

const AppConfigContext = createContext<AppConfigContextValue | undefined>(
  undefined
);

/**
 * Fetches remote app config (theme color overrides, onboarding copy, about
 * screen text, etc.) ONCE for the whole app and shares it via context.
 *
 * This replaces the original design where every component calling
 * useThemeColor independently invoked its own Supabase fetch + AsyncStorage
 * read on mount — with N themed components on screen, that was N redundant
 * network round trips for identical data on every screen render.
 */
export function AppConfigProvider({ children }: { children: React.ReactNode }) {
  const [config, setConfig] = useState<AppConfig>({});
  const [loading, setLoading] = useState(true);
  const [isOffline, setIsOffline] = useState(false);
  const mounted = useRef(true);

  const fetchConfig = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("ParikramaConfig")
        .select("config_name, config_value");

      if (error) throw error;
      if (!data) throw new Error("ParikramaConfig returned no data");

      const mapped: AppConfig = {};
      for (const row of data) {
        mapped[row.config_name] = row.config_value;
      }

      await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(mapped));
      if (!mounted.current) return;

      setConfig(mapped);
      setIsOffline(false);
    } catch (err) {
      console.warn("[AppConfig] Falling back to cached config:", err);

      try {
        const cached = await AsyncStorage.getItem(CACHE_KEY);
        if (!mounted.current) return;

        if (cached) {
          setConfig(JSON.parse(cached) as AppConfig);
          setIsOffline(true);
        } else {
          // No network AND no cache yet (e.g. first ever launch, offline).
          // Fall through to the static default theme — the app should
          // never be unusable just because remote config is unreachable.
          setConfig({});
          setIsOffline(true);
        }
      } catch (cacheErr) {
        console.warn("[AppConfig] Cache read also failed:", cacheErr);
        if (mounted.current) {
          setConfig({});
          setIsOffline(true);
        }
      }
    } finally {
      if (mounted.current) setLoading(false);
    }
  }, []);

  // Public refresh action — explicitly flips loading back to true before
  // refetching, since the user is re-triggering this after initial load.
  const refresh = useCallback(async () => {
    setLoading(true);
    await fetchConfig();
  }, [fetchConfig]);

  useEffect(() => {
    mounted.current = true;
    (async () => {
      await fetchConfig();
    })();
    return () => {
      mounted.current = false;
    };
  }, [fetchConfig]);

  return (
    <AppConfigContext.Provider value={{ config, loading, isOffline, refresh }}>
      {children}
    </AppConfigContext.Provider>
  );
}

export function useAppConfig(): AppConfigContextValue {
  const ctx = useContext(AppConfigContext);
  if (!ctx) {
    throw new Error("useAppConfig must be used within an AppConfigProvider");
  }
  return ctx;
}
