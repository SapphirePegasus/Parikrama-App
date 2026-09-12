import { useThemeColor } from "@/hooks/useThemeColor";
import { Image } from "expo-image";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

export type Festival = {
  id: number | string;
  city_id: number;
  name: string;
  subtitle?: string | null;
  description?: string | null;
  when_to_go?: string | null;
  city_name?: string;
  images?: string | null; // semicolon-separated URLs
};

type Props = {
  item: Festival;
  onPress?: () => void;
};

function getFirstImage(images?: string | null): string | undefined {
  if (!images) return undefined;
  const parts = images
    .split(";")
    .map((p) => p.trim())
    .filter(Boolean);
  return parts[0];
}

export default function FestivalCard({ item, onPress }: Props) {
  const cardBg = useThemeColor({}, "tabIconDefault");
  const text = useThemeColor({}, "text");
  const accent = useThemeColor({}, "tint");

  const thumbnail = getFirstImage(item.images);

  return (
    <Pressable
      onPress={onPress}
      style={[styles.card, { backgroundColor: cardBg }]}
    >
      {thumbnail ? (
        <Image source={thumbnail} style={styles.image} contentFit="cover" />
      ) : (
        <View style={styles.imagePlaceholder}>
          <Text>No Image</Text>
        </View>
      )}

      <View style={styles.body}>
        <Text style={[styles.name, { color: text }]} numberOfLines={1}>
          {item.name}
        </Text>
        {item.subtitle ? (
          <Text style={[styles.subtitle, { color: text }]} numberOfLines={2}>
            {item.subtitle}
          </Text>
        ) : null}
        {item.when_to_go ? (
          <Text style={[styles.when, { color: accent }]} numberOfLines={1}>
            {item.when_to_go}
          </Text>
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 14,
    overflow: "hidden",
    marginBottom: 14,
    elevation: 2,
  },
  image: { width: "100%", height: 180 },
  imagePlaceholder: {
    width: "100%",
    height: 180,
    justifyContent: "center",
    alignItems: "center",
  },
  body: { padding: 12 },
  name: { fontSize: 18, fontWeight: "800", marginBottom: 4 },
  subtitle: { fontSize: 13, marginBottom: 8 },
  when: { fontSize: 12, fontWeight: "600" },
});
