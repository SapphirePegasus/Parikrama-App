// components/MenuItem.tsx
import { useThemeColor } from "@/hooks/useThemeColor";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

type Props = {
  icon?: React.ComponentProps<typeof Ionicons>["name"];
  title: string;
  subtitle?: string;
  onPress?: () => void;
};

export default function MenuItem({
  icon = "chevron-forward",
  title,
  subtitle,
  onPress,
}: Props) {
  const bg = useThemeColor({}, "background");
  const text = useThemeColor({}, "text");
  const accent = useThemeColor({}, "tint");

  return (
    <Pressable style={[styles.row]} onPress={onPress}>
      <View style={styles.left}>
        <Ionicons name={icon as any} size={22} color={text} />
        <View style={{ marginLeft: 12 }}>
          <Text style={[styles.title, { color: text }]}>{title}</Text>
          {subtitle ? (
            <Text style={[styles.subtitle, { color: text }]}>{subtitle}</Text>
          ) : null}
        </View>
      </View>
      <Ionicons name="chevron-forward" size={20} color={text} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(255,255,255,0.04)",
  },
  left: { flexDirection: "row", alignItems: "center" },
  title: { fontSize: 16, fontWeight: "700" },
  subtitle: { fontSize: 12, marginTop: 2, opacity: 0.8 },
});
