import FestivalCard, { Festival } from "@/components/FestivalCard";
import HomeHeader from "@/components/HomeHeader";
import HomeUtilities from "@/components/HomeUtilities";
import SearchBar from "@/components/SearchBar";
import { useSelectedCity } from "@/context/SelectedCityContext";
import { useCachedQuery } from "@/hooks/useCachedQuery";
import { useThemeColor } from "@/hooks/useThemeColor";
import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  View,
} from "react-native";

export default function HomeScreen() {
  const router = useRouter();
  const bg = useThemeColor({}, "background");
  const text = useThemeColor({}, "text");

  const { selectedCity } = useSelectedCity();

  const {
    data: rawFestivals = [],
    loading,
    isOffline,
  } = useCachedQuery<Festival>(
    "festivals_cache",
    "ParikramaFestivals",
    "id,name,subtitle,description,when_to_go,city_name,images,start_date,end_date"
  );

  const [query, setQuery] = useState("");

  const festivals = useMemo(() => {
    let arr = rawFestivals;

    if (selectedCity) {
      const target = selectedCity.toLowerCase();
      arr = arr.filter((f) => f.city_name?.toLowerCase() === target);
    }

    if (query) {
      const q = query.toLowerCase();
      arr = arr.filter(
        (f) =>
          f.name?.toLowerCase().includes(q) ||
          f.subtitle?.toLowerCase().includes(q) ||
          f.city_name?.toLowerCase().includes(q)
      );
    }

    return [...arr].sort((a, b) => Number(a.id) - Number(b.id));
  }, [rawFestivals, selectedCity, query]);

  if (loading) {
    return (
      <View style={[styles.loaderContainer, { backgroundColor: bg }]}>
        <ActivityIndicator size="large" color={text} />
        <Text style={[styles.loaderText, { color: text, marginTop: 12 }]}>
          Loading...
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: bg }]}>
      <HomeHeader />
      <View style={styles.content}>
        <SearchBar value={query} onChangeText={setQuery} />
        <HomeUtilities />
        <FlatList
          data={festivals}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => (
            <FestivalCard
              item={item}
              onPress={() =>
                router.push({
                  pathname: "/festival/[id]",
                  params: { id: String(item.id) },
                })
              }
            />
          )}
          contentContainerStyle={{ padding: 16, paddingBottom: 48 }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={{ color: text }}>No festivals found</Text>
              {isOffline && (
                <Text style={{ color: text, marginTop: 6 }}>
                  You are offline; showing cached data.
                </Text>
              )}
            </View>
          }
        />
      </View>

      {isOffline && (
        <View style={styles.offlineBanner}>
          <Text style={{ color: "#2b2b2b", fontWeight: "600" }}>
            Offline mode
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 24 },
  content: { flex: 1 },
  loaderContainer: { flex: 1, alignItems: "center", justifyContent: "center" },
  loaderText: { fontSize: 16 },
  empty: { padding: 24, alignItems: "center" },
  offlineBanner: {
    position: "absolute",
    bottom: 24,
    alignSelf: "center",
    backgroundColor: "#FFD54F",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
  },
});
