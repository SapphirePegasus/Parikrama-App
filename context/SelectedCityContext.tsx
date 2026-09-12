import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

const SELECTED_CITY_KEY = "parikrama_selected_city";

type SelectedCityContextValue = {
  selectedCity: string | null;
  setSelectedCity: (city: string | null) => void;
};

const SelectedCityContext = createContext<SelectedCityContextValue | undefined>(
  undefined
);

export function SelectedCityProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [selectedCity, setSelectedCityState] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const raw = await AsyncStorage.getItem(SELECTED_CITY_KEY);
        if (!cancelled && raw) setSelectedCityState(raw);
      } catch (err) {
        console.warn("[SelectedCity] Failed to read cached city:", err);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const setSelectedCity = useCallback((city: string | null) => {
    setSelectedCityState(city);

    (async () => {
      try {
        if (city) {
          await AsyncStorage.setItem(SELECTED_CITY_KEY, city);
        } else {
          await AsyncStorage.removeItem(SELECTED_CITY_KEY);
        }
      } catch (err) {
        console.warn("[SelectedCity] Failed to persist city selection:", err);
      }
    })();
  }, []);

  return (
    <SelectedCityContext.Provider value={{ selectedCity, setSelectedCity }}>
      {children}
    </SelectedCityContext.Provider>
  );
}

export function useSelectedCity(): SelectedCityContextValue {
  const ctx = useContext(SelectedCityContext);
  if (!ctx) {
    throw new Error("useSelectedCity must be used within a SelectedCityProvider");
  }
  return ctx;
}
