// app/utilities.tsx
import { useCachedQuery } from "@/hooks/useCachedQuery";
import { useThemeColor } from "@/hooks/useThemeColor";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import {
  Dimensions,
  FlatList,
  Image,
  Linking,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

const { width } = Dimensions.get("window");
const TILE_SIZE = Math.floor((width - 64) / 2); // padding & gap

export default function UtilitiesScreen() {
  const bg = useThemeColor({}, "background");
  const text = useThemeColor({}, "text");

  const { data: items = [], loading } = useCachedQuery<any>(
    "utilities_cache",
    "ParikramaUtilities",
    "id, name, map_query, image"
  );

  const sortedItems = [...items].sort((a, b) => a.id - b.id);

  const openMap = (query?: string, name?: string) => {
    const q = query ?? name ?? "";
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      q
    )}`;
    Linking.openURL(url);
  };

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
            onPress={() => openMap(item.map_query, item.name)}
          >
            {item.image ? (
              <Image source={{ uri: item.image }} style={styles.tileImage} />
            ) : (
              <View style={[styles.tileImage, styles.tilePlaceholder]}>
                <Text style={{ color: "#fff", fontWeight: "700" }}>
                  {item.name?.[0] ?? "..."}
                </Text>
              </View>
            )}

            {/* Gradient overlay */}
            <LinearGradient
              colors={["transparent", "rgba(0,0,0,0.9)"]}
              style={styles.gradient}
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
  label: {
    fontSize: 18,
    fontWeight: "700",
    marginLeft: 16,
    marginBottom: 8,
  },
  tile: {
    margin: 8,
    padding: 0,
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
    ...StyleSheet.absoluteFillObject,
    justifyContent: "flex-end",
    padding: 8,
  },
  tileText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#fff",
  },
});
