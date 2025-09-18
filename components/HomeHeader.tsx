// components/Header.tsx
import { useSelectedCity } from "@/context/SelectedCityContext";
import { useCachedQuery } from "@/hooks/useCachedQuery";
import { useThemeColor } from "@/hooks/useThemeColor";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, useColorScheme, View } from "react-native";
import CitySelectorModal from "./CitySelectorModal";

export default function Header() {
  const router = useRouter();
  const { data: cities = [], loading } = useCachedQuery<{
    id: number;
    city: string;
    state?: string;
    country?: string;
  }>("cities_cache", "ParikramaLocations", "id, city, state, country");

  const scheme = useColorScheme() ?? "light";
  const bg = useThemeColor({}, "background");
  const text = useThemeColor({}, "text");

  const { selectedCity, setSelectedCity } = useSelectedCity();
  const [modalVisible, setModalVisible] = useState(false);

  // If we have cities and no selected city set yet, set default to first city
  useEffect(() => {
    if (!loading && cities.length && !selectedCity) {
      setSelectedCity(cities[0].city);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, cities]);

  const displayCity =
    selectedCity ?? (cities.length ? cities[0].city : "Kolkata");

  return (
    <View style={[styles.container, { backgroundColor: bg }]}>
      <Pressable
        style={styles.left}
        onPress={() => setModalVisible(true)}
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
        accessibilityLabel="Open Menu"
      >
        <Ionicons name="menu" size={28} color={text} />
      </Pressable>

      {/*<Pressable
        style={styles.right}
        onPress={() => router.push("/profile")}
        accessibilityLabel="Open profile"
      >
        <Ionicons name="person-circle-outline" size={32} color={text} />
      </Pressable> */}

      <CitySelectorModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        cities={cities}
        selectedCity={displayCity}
        onSelect={(city) => {
          setSelectedCity(city.city);
        }}
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
