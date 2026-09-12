import { useCachedQuery } from "@/hooks/useCachedQuery";
import { useThemeColor } from "@/hooks/useThemeColor";
import { openInMaps } from "@/lib/maps";
import { LinearGradient } from "expo-linear-gradient";
import React, { useMemo } from "react";
import {
  Dimensions,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

const { width } = Dimensions.get("window");
const TILE_SIZE = Math.floor((width - 64) / 2);

type Utility = {
  id: number | string;
  name: string;
  map_query?: string;
  image?: string | null;
};

export default function UtilitiesScreen() {
  const bg = useThemeColor({}, "background");
  const text = useThemeColor({}, "text");

  const { data: items = [] } = useCachedQuery<Utility>(
    "utilities_cache",
    "ParikramaUtilities",
    "id, name, map_query, image"
  );

  const sortedItems = useMemo(
    () => [...items].sort((a, b) => Number(a.id) - Number(b.id)),
    [items]
  );

  return (
    <View style={[styles.root, { backgroundColor: bg }]}>
      <Text style={[styles.label, { color: text }]}>Find Near Me</Text>

      <FlatList
        data={sortedItems}
        numColumns={2}
        keyExtractor={(it) => String(it.id)}
        contentContainerStyle={{ padding: 16 }}
        renderItem={({ item }) => (
          <Pressable
            style={[styles.tile, { width: TILE_SIZE, height: TILE_SIZE }]}
            onPress={() => openInMaps(item.map_query ?? item.name)}
            accessibilityRole="button"
            accessibilityLabel={`Open ${item.name} in Maps`}
          >
            {item.image ? (
              <Image source={{ uri: item.image }} style={styles.tileImage} />
            ) : (
              <View style={[styles.tileImage, styles.tilePlaceholder]}>
                <Text style={{ color: "#fff", fontWeight: "700" }}>
                  {item.name?.[0] ?? "…"}
                </Text>
              </View>
            )}

            <LinearGradient
              colors={["transparent", "rgba(0,0,0,0.9)"]}
              style={[StyleSheet.absoluteFill, styles.gradient]}
            >
              <Text style={styles.tileText} numberOfLines={2}>
                {item.name}
              </Text>
            </LinearGradient>
          </Pressable>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, paddingTop: 40 },
  label: { fontSize: 18, fontWeight: "700", marginLeft: 16, marginBottom: 8 },
  tile: {
    margin: 8,
    borderRadius: 12,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },
  tileImage: { width: "100%", height: "100%" },
  tilePlaceholder: {
    backgroundColor: "#2b3948",
    justifyContent: "center",
    alignItems: "center",
  },
  gradient: {
    justifyContent: "flex-end",
    padding: 8,
  },
  tileText: { fontSize: 18, fontWeight: "700", color: "#fff" },
});
