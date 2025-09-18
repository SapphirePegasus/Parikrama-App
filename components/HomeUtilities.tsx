// components/HomeUtilities.tsx
import { useCachedQuery } from "@/hooks/useCachedQuery";
import { useThemeColor } from "@/hooks/useThemeColor";
import { useRouter } from "expo-router";
import React, { useCallback } from "react";
import {
  FlatList,
  Image,
  Linking,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

type Utility = {
  id: number | string;
  name: string;
  map_query?: string;
  image?: string | null;
};

export default function HomeUtilities() {
  const router = useRouter();
  const bg = useThemeColor({}, "background");
  const text = useThemeColor({}, "text");
  const tint = useThemeColor({}, "tint");

  const { data: items = [], loading } = useCachedQuery<any>(
    "utilities_cache",
    "ParikramaUtilities",
    "id, name, map_query, image"
  );

  const sortedItems = [...items].sort((a, b) => a.id - b.id);

  const openMap = useCallback((query?: string, name?: string) => {
    const q = query ?? name ?? "";
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      q
    )}`;
    Linking.openURL(url);
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: bg }]}>
      <View style={styles.headerRow}>
        <Text style={[styles.title, { color: text }]}>Find Near Me</Text>
        <Pressable onPress={() => router.push("/utilities")}>
          <Text style={{ color: tint, fontWeight: "600" }}>View All</Text>
        </Pressable>
      </View>

      <FlatList
        horizontal
        data={sortedItems}
        keyExtractor={(it) => String(it.id)}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingLeft: 8, paddingRight: 8 }}
        renderItem={({ item }) => {
          const imageUri = item.image || null;
          return (
            <Pressable
              style={styles.item}
              onPress={() => openMap(item.map_query, item.name)}
            >
              {imageUri ? (
                <Image source={{ uri: imageUri }} style={styles.avatar} />
              ) : (
                <View style={[styles.avatar, styles.avatarPlaceholder]}>
                  <Text style={{ color: "#fff" }}>{item.name?.[0] ?? "?"}</Text>
                </View>
              )}
              <Text style={[styles.name, { color: text }]} numberOfLines={1}>
                {item.name}
              </Text>
            </Pressable>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 12, marginTop: 12 },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginHorizontal: 16,
    marginBottom: 8,
  },
  title: { fontSize: 14, fontWeight: "600" },
  item: { width: 84, marginRight: 8, alignItems: "center" },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 999,
    marginBottom: 6,
  },
  avatarPlaceholder: {
    backgroundColor: "#2b3948",
    justifyContent: "center",
    alignItems: "center",
  },
  name: { fontSize: 12, textAlign: "center" },
});
