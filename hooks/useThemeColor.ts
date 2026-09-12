import { Colors, ThemeColorName } from "@/context/Colors";
import { useAppConfig } from "@/context/AppConfigContext";
import { useColorScheme } from "react-native";

/**
 * React Native's useColorScheme() can return "light" | "dark" | "unspecified"
 * (Android added "unspecified" for devices/contexts with no explicit
 * preference) in addition to null/undefined. This app only ships light and
 * dark themes, so anything else falls back to light.
 */
function normalizeScheme(scheme: string | null | undefined): "light" | "dark" {
  return scheme === "dark" ? "dark" : "light";
}

export function useThemeColor(
  props: { light?: string; dark?: string },
  colorName: ThemeColorName
): string {
  const theme = normalizeScheme(useColorScheme());
  const { config } = useAppConfig();

  const remoteOverride =
    theme === "light"
      ? config[`${colorName}Light`]
      : config[`${colorName}Dark`];

  if (remoteOverride) return remoteOverride;
  if (props[theme]) return props[theme] as string;

  return Colors[theme][colorName];
}
