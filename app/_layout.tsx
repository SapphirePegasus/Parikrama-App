import { SelectedCityProvider } from "@/context/SelectedCityContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { ActivityIndicator, useColorScheme, View } from "react-native";

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const segments = useSegments();

  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  const [checking, setChecking] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        // one-time onboarding flag (local only)
        const seen = await AsyncStorage.getItem("onboardingSeen_v1");

        if (!seen && segments[0] !== "onboarding") {
          router.replace("/onboarding");
        }
      } catch (err) {
        console.warn("⚠️ Onboarding check failed", err);
      } finally {
        setChecking(false);
      }
    })();
  }, [router, segments]);

  if (!loaded || checking) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <SelectedCityProvider>
      <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
        <Stack screenOptions={{ headerShown: false }} />
        <StatusBar style="auto" />
      </ThemeProvider>
    </SelectedCityProvider>
  );
}
