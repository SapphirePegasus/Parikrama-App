import { useSelectedCity } from "@/context/SelectedCityContext";
import { useCachedQuery } from "@/hooks/useCachedQuery";
import { useThemeColor } from "@/hooks/useThemeColor";
import Ionicons from "@react-native-vector-icons/ionicons/static";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import CitySelectorModal from "./CitySelectorModal";

type City = {
  id: number;
  city: string;
  state?: string;
  country?: string;
};

export default function HomeHeader() {
  const router = useRouter();
  const { data: cities = [], loading } = useCachedQuery<City>(
    "cities_cache",
    "ParikramaLocations",
    "id, city, state, country"
  );

  const bg = useThemeColor({}, "background");
  const text = useThemeColor({}, "text");

  const { selectedCity, setSelectedCity } = useSelectedCity();
  const [modalVisible, setModalVisible] = useState(false);

  // Default to the first city once cities have loaded, but only if the
  // user hasn't already picked one (including on a previous session, via
  // the persisted SelectedCityContext).
  const hasDefaultedRef = React.useRef(false);
  useEffect(() => {
    if (loading || hasDefaultedRef.current || selectedCity) return;
    if (cities.length > 0) {
      hasDefaultedRef.current = true;
      setSelectedCity(cities[0].city);
    }
  }, [loading, cities, selectedCity, setSelectedCity]);

  const displayCity = selectedCity ?? (cities.length ? cities[0].city : "—");

  return (
    <View style={[styles.container, { backgroundColor: bg }]}>
      <Pressable
        style={styles.left}
        onPress={() => setModalVisible(true)}
        accessibilityRole="button"
        accessibilityLabel="Open city selector"
      >
        <Ionicons name="location-outline" size={24} color={text} />
        <Text style={[styles.cityText, { color: text }]} numberOfLines={1}>
          {loading ? "Loading..." : displayCity} ▾
        </Text>
      </Pressable>

      <Pressable
        style={styles.right}
        onPress={() => router.push("/menu")}
        accessibilityRole="button"
        accessibilityLabel="Open menu"
      >
        <Ionicons name="menu" size={28} color={text} />
      </Pressable>

      <CitySelectorModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        cities={cities}
        selectedCity={displayCity}
        onSelect={(city) => setSelectedCity(city.city)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 64,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  left: { flexDirection: "row", alignItems: "center", flex: 1 },
  cityText: { marginLeft: 10, fontSize: 16, fontWeight: "600", flexShrink: 1 },
  right: { paddingLeft: 12 },
});
