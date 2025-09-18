import SearchBar from "@/components/SearchBar"; // ✅ use the shared search bar
import { useCachedQuery } from "@/hooks/useCachedQuery";
import { useThemeColor } from "@/hooks/useThemeColor";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  FlatList,
  LayoutAnimation,
  Linking,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  UIManager,
  View,
} from "react-native";

// enable LayoutAnimation on Android
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
  city_name: string;
  festival_id: number;
  festival_name: string;
  area_id: number;
  area_name: string;
}

export default function CelebrationsScreen() {
  const {
    id: areaId,
    cityId,
    festivalId,
  } = useLocalSearchParams<{
    id: string;
    cityId: string;
    festivalId: string;
  }>();
  const router = useRouter();
  const bg = useThemeColor({}, "background");
  const text = useThemeColor({}, "text");
  const btnCol = useThemeColor({}, "tint");

  const [searchQuery, setSearchQuery] = useState("");

  // fetch celebrations cached
  const { data: allCelebrations = [], loading } = useCachedQuery<Celebration>(
    `celebrations_cache_${areaId}`,
    "ParikramaCelebrations"
  );

  // filter by area, city, festival and search
  const filteredCelebrations = useMemo(() => {
    return (allCelebrations || [])
      .filter((c) => String(c.area_id) === String(areaId))
      .filter((c) => String(c.city_id) === String(cityId))
      .filter((c) => String(c.festival_id) === String(festivalId))
      .filter(
        (c) =>
          !searchQuery ||
          c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (c.address &&
            c.address.toLowerCase().includes(searchQuery.toLowerCase()))
      )
      .sort((a, b) => a.id - b.id);
  }, [allCelebrations, areaId, cityId, festivalId, searchQuery]);

  // pick one for header
  const headerFestival = filteredCelebrations[0]?.festival_name || "";
  const headerArea = filteredCelebrations[0]?.area_name || "";

  // group by metroStation
  const grouped = useMemo(() => {
    const groups: Record<string, Celebration[]> = {};
    filteredCelebrations.forEach((c) => {
      const key = c.metroStation || "Others";
      if (!groups[key]) groups[key] = [];
      groups[key].push(c);
    });
    return groups;
  }, [filteredCelebrations]);

  // collapse state
  const [collapsedStations, setCollapsedStations] = useState<
    Record<string, boolean>
  >({});

  const toggleCollapse = (station: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setCollapsedStations((prev) => ({
      ...prev,
      [station]: !prev[station],
    }));
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
      {/* Header 
      <Text style={[styles.header, { color: text }]}>
        {headerFestival ? `${headerFestival} in ${headerArea}` : "Celebrations"}
      </Text>*/}

      {/* SearchBar */}
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
                  onPress={() =>
                    c.address &&
                    Linking.openURL(
                      `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                        c.name
                      )}`
                    )
                  }
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
  header: {
    fontSize: 18,
    fontWeight: "800",
    marginHorizontal: 16,
    marginBottom: 8,
  },
  group: { marginBottom: 8 },
  groupHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  groupTitle: { fontSize: 18, fontWeight: "700" },
  itemCard: {
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderRadius: 12,
  },
  itemContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  itemName: { fontSize: 16, fontWeight: "600" },
  itemAddress: { fontSize: 14, marginTop: 2 },
  itemDistance: { fontSize: 12, marginTop: 2, fontStyle: "italic" },
});
