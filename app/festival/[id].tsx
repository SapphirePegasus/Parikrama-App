import { useCachedQuery } from "@/hooks/useCachedQuery";
import { useThemeColor } from "@/hooks/useThemeColor";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Image,
  LayoutAnimation,
  Platform,
  Pressable,
  ScrollView,
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

const { width: SCREEN_WIDTH } = Dimensions.get("window");

type FestivalDetail = {
  id: number | string;
  name: string;
  subtitle?: string;
  description?: string;
  when_to_go?: string;
  tips?: string;
  what_to_wear?: string;
  images?: string;
  city_id: number;
};

type Area = {
  id: number;
  area: string;
  city_id: number;
  "Related Festivals"?: string;
};

export default function FestivalDetails() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const bg = useThemeColor({}, "background");
  const text = useThemeColor({}, "text");
  const btnCol = useThemeColor({}, "tint");
  const btnTxt = useThemeColor({}, "tintText");

  const { data: festivals, loading } = useCachedQuery<FestivalDetail>(
    "festivals_cache",
    "ParikramaFestivals",
    "id,name,subtitle,description,when_to_go,tips,what_to_wear,images,city_id,city_name"
  );

  const festival = useMemo(
    () => festivals.find((f) => String(f.id) === String(id)),
    [festivals, id]
  );

  const { data: allAreas = [] } = useCachedQuery<Area>(
    `areas_cache_${festival?.city_id ?? "pending"}`,
    "ParikramaAreas"
  );

  const areas = useMemo(() => {
    if (!festival) return [];
    return allAreas
      .filter((a) => {
        const sameCity = String(a.city_id) === String(festival.city_id);
        const related = (a["Related Festivals"] ?? "")
          .split(";")
          .map((v) => v.trim());
        return sameCity && related.includes(String(festival.id));
      })
      .sort((a, b) => Number(a.id) - Number(b.id));
  }, [allAreas, festival]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const images = festival?.images ? festival.images.split(";") : [];

  useEffect(() => {
    if (images.length === 0) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => {
        const nextIndex = (prev + 1) % images.length;
        flatListRef.current?.scrollToIndex({ index: nextIndex, animated: true });
        return nextIndex;
      });
    }, 5000);
    return () => clearInterval(interval);
  }, [images.length]);

  const onScroll = (e: any) => {
    const index = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
    setCurrentIndex(index);
  };

  const [expanded, setExpanded] = useState(false);
  const toggleExpand = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded((prev) => !prev);
  };

  if (loading || !festival) {
    return (
      <View style={[styles.loader, { backgroundColor: bg }]}>
        <ActivityIndicator size="large" color={text} />
        <Text style={{ color: text, marginTop: 8 }}>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: bg }]}>
      <View>
        <FlatList
          ref={flatListRef}
          data={images}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          keyExtractor={(_, idx) => String(idx)}
          renderItem={({ item }) => (
            <Image source={{ uri: item }} style={styles.carouselImage} />
          )}
          onScroll={onScroll}
          scrollEventThrottle={16}
        />
        <View style={styles.dotsContainer}>
          {images.map((_, idx) => (
            <View
              key={idx}
              style={[styles.dot, idx === currentIndex && styles.activeDot]}
            />
          ))}
        </View>
      </View>

      <View style={styles.content}>
        <Text style={[styles.name, { color: text }]}>{festival.name}</Text>
        {festival.subtitle ? (
          <Text style={[styles.subtitle, { color: text }]}>
            {festival.subtitle}
          </Text>
        ) : null}
        {festival.when_to_go ? (
          <View style={styles.metaLine}>
            <Text style={[styles.when, { color: text }]}>
              🗓️ {festival.when_to_go}
            </Text>
          </View>
        ) : null}

        <View style={styles.expandable}>
          {expanded ? (
            <>
              {festival.description ? (
                <Text style={[styles.desc, { color: text }]}>
                  {festival.description}
                </Text>
              ) : null}
              {festival.tips ? (
                <Text style={[styles.desc, { color: text }]}>
                  💡 Tips: {festival.tips}
                </Text>
              ) : null}
              {festival.what_to_wear ? (
                <Text style={[styles.desc, { color: text }]}>
                  👕 What to Wear: {festival.what_to_wear}
                </Text>
              ) : null}
            </>
          ) : (
            <Text
              style={[styles.desc, { color: text }]}
              numberOfLines={3}
              ellipsizeMode="tail"
            >
              {festival.description}
            </Text>
          )}

          <Pressable onPress={toggleExpand} style={styles.showMoreBtn}>
            <Text style={{ color: "#007AFF", fontWeight: "600" }}>
              {expanded ? "Show less" : "Show more"}
            </Text>
          </Pressable>
        </View>

        <View style={styles.grid}>
          {areas.map((a) => (
            <Pressable
              key={a.id}
              style={[styles.areaCard, { backgroundColor: btnCol }]}
              onPress={() =>
                router.push({
                  pathname: "/celebrations/[id]",
                  params: {
                    id: String(a.id),
                    cityId: String(festival.city_id),
                    festivalId: String(festival.id),
                  },
                })
              }
            >
              <Text style={{ color: btnTxt, fontWeight: "600" }}>{a.area}</Text>
            </Pressable>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loader: { flex: 1, alignItems: "center", justifyContent: "center" },
  carouselImage: { width: SCREEN_WIDTH, height: 280, resizeMode: "cover" },
  dotsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginVertical: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(146, 146, 146, 0.5)",
    marginHorizontal: 4,
  },
  activeDot: { backgroundColor: "#007AFF" },
  content: { padding: 16 },
  name: { fontSize: 22, fontWeight: "700" },
  subtitle: { fontSize: 16, marginTop: 4 },
  when: { fontSize: 14, marginLeft: 4 },
  metaLine: { flexDirection: "row", alignItems: "center", marginTop: 4 },
  expandable: { marginTop: 12 },
  desc: { fontSize: 14, lineHeight: 20, marginBottom: 6 },
  showMoreBtn: { marginTop: 4 },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginTop: 12,
  },
  areaCard: {
    width: "47%",
    marginBottom: 18,
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
});
