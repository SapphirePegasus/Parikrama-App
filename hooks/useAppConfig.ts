import { supabase } from '@/lib/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';

type AppConfig = Record<string, string>;

const CACHE_KEY = 'parikrama_config';

export function useAppConfig() {
  const [config, setConfig] = useState<AppConfig>({});
  const [loading, setLoading] = useState(true);
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadConfig() {
      setLoading(true);

      try {
        // 1. Try fetching from Supabase
        const { data, error } = await supabase
          .from('ParikramaConfig')
          .select('config_name, config_value');

        if (error || !data) {
          throw error ?? new Error('No data');
        }

        // 2. Map data into key-value
        const mapped: AppConfig = {};
        data.forEach((row) => {
          mapped[row.config_name] = row.config_value;
        });

        // 3. Save to AsyncStorage
        await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(mapped));

        if (isMounted) {
          setConfig(mapped);
          setIsOffline(false);
        }
      } catch (err) {
        console.warn('⚠️ Using cached config due to error:', err);

        // 4. Fallback: Load from cache
        const cached = await AsyncStorage.getItem(CACHE_KEY);
        if (cached && isMounted) {
          setConfig(JSON.parse(cached));
          setIsOffline(true);
        }
      }

      if (isMounted) setLoading(false);
    }

    loadConfig();
    return () => {
      isMounted = false;
    };
  }, []);

  return { config, loading, isOffline };
}
