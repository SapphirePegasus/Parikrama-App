import { Colors } from "@/context/Colors";
import { useAppConfig } from "@/hooks/useAppConfig";
import { useColorScheme } from "react-native";

export function useThemeColor(
  props: { light?: string; dark?: string },
  colorName: keyof typeof Colors.light & keyof typeof Colors.dark
) {
  const theme = useColorScheme() ?? "light";
  const { config } = useAppConfig();

  const dbColor =
    theme === "light"
      ? config[`${colorName}Light`] ?? null
      : config[`${colorName}Dark`] ?? null;

  if (dbColor) return dbColor;
  if (props[theme]) return props[theme];

  return Colors[theme][colorName];
}
