import SearchBar from "@/components/SearchBar";
import { useCachedQuery } from "@/hooks/useCachedQuery";
import { useThemeColor } from "@/hooks/useThemeColor";
import { openInMaps } from "@/lib/maps";
import Ionicons from "@react-native-vector-icons/ionicons/static";
import { useLocalSearchParams } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  FlatList,
  LayoutAnimation,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  UIManager,
  View,
} from "react-native";

if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface Celebration {
  id: number;
  name: string;
  address: string;
  metroStation: string;
  distanceFromMetro: string;
  description: string;
  city_id: number;
  festival_id: number;
  area_id: number;
}

export default function CelebrationsScreen() {
  const {
    id: areaId,
    cityId,
    festivalId,
  } = useLocalSearchParams<{ id: string; cityId: string; festivalId: string }>();

  const bg = useThemeColor({}, "background");
  const text = useThemeColor({}, "text");

  const [searchQuery, setSearchQuery] = useState("");

  const { data: allCelebrations = [], loading } = useCachedQuery<Celebration>(
    `celebrations_cache_${areaId}`,
    "ParikramaCelebrations"
  );

  const filteredCelebrations = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return allCelebrations
      .filter((c) => String(c.area_id) === String(areaId))
      .filter((c) => String(c.city_id) === String(cityId))
      .filter((c) => String(c.festival_id) === String(festivalId))
      .filter(
        (c) =>
          !searchQuery ||
          c.name.toLowerCase().includes(q) ||
          c.address?.toLowerCase().includes(q)
      )
      .sort((a, b) => a.id - b.id);
  }, [allCelebrations, areaId, cityId, festivalId, searchQuery]);

  const grouped = useMemo(() => {
    const groups: Record<string, Celebration[]> = {};
    for (const c of filteredCelebrations) {
      const key = c.metroStation || "Others";
      (groups[key] ??= []).push(c);
    }
    return groups;
  }, [filteredCelebrations]);

  const [collapsedStations, setCollapsedStations] = useState<
    Record<string, boolean>
  >({});

  const toggleCollapse = (station: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setCollapsedStations((prev) => ({ ...prev, [station]: !prev[station] }));
  };

  if (loading) {
    return (
      <View style={[styles.loader, { backgroundColor: bg }]}>
        <Text style={{ color: text }}>Loading celebrations...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: bg }]}>
      <SearchBar
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholder="Search celebrations..."
      />

      {filteredCelebrations.length === 0 && (
        <View style={{ padding: 24, alignItems: "center" }}>
          <Text style={{ color: text, fontSize: 16, fontStyle: "italic" }}>
            No results found
          </Text>
        </View>
      )}

      <FlatList
        data={Object.keys(grouped)}
        keyExtractor={(station) => station}
        renderItem={({ item: station }) => (
          <View style={styles.group}>
            <Pressable
              style={styles.groupHeader}
              onPress={() => toggleCollapse(station)}
              accessibilityRole="button"
            >
              <Text style={[styles.groupTitle, { color: text }]}>
                {station} ({grouped[station].length})
              </Text>
              <Ionicons
                name={
                  collapsedStations[station]
                    ? "chevron-down-outline"
                    : "chevron-up-outline"
                }
                size={20}
                color={text}
              />
            </Pressable>

            {!collapsedStations[station] &&
              grouped[station].map((c) => (
                <Pressable
                  key={c.id}
                  style={[styles.itemCard, { borderColor: text + "40" }]}
                  onPress={() => c.address && openInMaps(c.name)}
                  accessibilityRole="button"
                  accessibilityLabel={`Open ${c.name} in Maps`}
                >
                  <View style={styles.itemContent}>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.itemName, { color: text }]}>
                        {c.name}
                      </Text>
                      {c.address ? (
                        <Text style={[styles.itemAddress, { color: text }]}>
                          {c.address}
                        </Text>
                      ) : null}
                      {c.distanceFromMetro ? (
                        <Text style={[styles.itemDistance, { color: text }]}>
                          Tap to View On Map
                        </Text>
                      ) : null}
                    </View>

                    <Ionicons
                      name="location-sharp"
                      size={24}
                      color={text}
                      style={{ marginRight: 12 }}
                    />
                  </View>
                </Pressable>
              ))}
          </View>
        )}
        contentContainerStyle={{ padding: 16 }}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 40 },
  loader: { flex: 1, alignItems: "center", justifyContent: "center" },
  group: { marginBottom: 8 },
  groupHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  groupTitle: { fontSize: 18, fontWeight: "700" },
  itemCard: { padding: 12, marginBottom: 8, borderWidth: 1, borderRadius: 12 },
  itemContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  itemName: { fontSize: 16, fontWeight: "600" },
  itemAddress: { fontSize: 14, marginTop: 2 },
  itemDistance: { fontSize: 12, marginTop: 2, fontStyle: "italic" },
});
