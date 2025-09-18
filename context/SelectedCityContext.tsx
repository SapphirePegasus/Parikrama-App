// context/SelectedCityContext.tsx
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState } from "react";

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
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(SELECTED_CITY_KEY);
        if (raw) setSelectedCityState(raw);
      } catch (err) {
        // ignore
      }
    })();
  }, []);

  const setSelectedCity = async (city: string | null) => {
    try {
      if (city) await AsyncStorage.setItem(SELECTED_CITY_KEY, city);
      else await AsyncStorage.removeItem(SELECTED_CITY_KEY);
    } catch (err) {
      // ignore
    }
    setSelectedCityState(city);
  };

  return (
    <SelectedCityContext.Provider value={{ selectedCity, setSelectedCity }}>
      {children}
    </SelectedCityContext.Provider>
  );
}

export function useSelectedCity() {
  const ctx = useContext(SelectedCityContext);
  if (!ctx)
    throw new Error("useSelectedCity must be used within SelectedCityProvider");
  return ctx;
}
