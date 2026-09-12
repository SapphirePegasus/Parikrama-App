import { AppConfigProvider } from "@/context/AppConfigContext";
import { SelectedCityProvider } from "@/context/SelectedCityContext";
import { initSentry } from "@/lib/sentry";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "expo-router/react-navigation";
import { useFonts } from "expo-font";
import { Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { ActivityIndicator, useColorScheme, View } from "react-native";

initSentry();

const ONBOARDING_STORAGE_KEY = "onboardingSeen_v1";

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const segments = useSegments();

  const [fontsLoaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  const [checkingOnboarding, setCheckingOnboarding] = useState(true);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const seen = await AsyncStorage.getItem(ONBOARDING_STORAGE_KEY);
        if (cancelled) return;

        if (!seen && segments[0] !== "onboarding") {
          router.replace("/onboarding");
        }
      } catch (err) {
        console.warn("[RootLayout] Onboarding check failed:", err);
      } finally {
        if (!cancelled) setCheckingOnboarding(false);
      }
    })();

    return () => {
      cancelled = true;
    };
    // Intentionally only re-checked on mount, not on every segment change —
    // this is a one-time "have they ever seen onboarding" gate, not a
    // route guard that should re-run on navigation.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!fontsLoaded || checkingOnboarding) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <AppConfigProvider>
      <SelectedCityProvider>
        <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
          <Stack screenOptions={{ headerShown: false }} />
          <StatusBar style="auto" />
        </ThemeProvider>
      </SelectedCityProvider>
    </AppConfigProvider>
  );
}
