import { useAppConfig } from "@/hooks/useAppConfig";
import { useThemeColor } from "@/hooks/useThemeColor";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React, { useMemo, useRef, useState } from "react";
import {
  Dimensions,
  FlatList,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import SlideDesign from "./slide-design";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export default function OnboardingScreen() {
  const router = useRouter();
  const { config } = useAppConfig();
  const bg = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "text");
  const accent = useThemeColor({}, "tint");
  const accentText = useThemeColor({}, "tintText");

  const version = config["onboarding_version"] ?? "1";
  const STORAGE_KEY = `onboardingSeen_v${version}`;

  const slides = useMemo(() => {
    return [1, 2, 3, 4].map((n) => ({
      id: String(n),
      title: config[`onboarding_slide_${n}_title`] ?? `Slide ${n}`,
      text:
        config[`onboarding_slide_${n}_text`] ?? `Description for slide ${n}`,
      image: config[`onboarding_slide_${n}_image`] ?? undefined,
    }));
  }, [config]);

  const [index, setIndex] = useState(0);
  const listRef = useRef<FlatList>(null);

  const goNext = () => {
    const next = Math.min(index + 1, slides.length - 1);
    listRef.current?.scrollToIndex({ index: next, animated: true });
  };

  const finish = async () => {
    await AsyncStorage.setItem(STORAGE_KEY, "true");
    router.replace("/");
  };

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: bg }]}>
      {/* Skip */}
      <View style={styles.topRow}>
        <Pressable onPress={finish}>
          <Text style={{ color: textColor, opacity: 0.8 }}>Skip</Text>
        </Pressable>
      </View>

      <FlatList
        ref={listRef}
        horizontal
        pagingEnabled
        data={slides}
        keyExtractor={(s) => s.id}
        renderItem={({ item, index: idx }) => (
          <View style={{ width: SCREEN_WIDTH }}>
            <SlideDesign
              title={item.title}
              text={item.text}
              image={item.image}
              active={index === idx}
              textColor={textColor}
            />
          </View>
        )}
        onMomentumScrollEnd={(ev) => {
          const newIndex = Math.round(
            ev.nativeEvent.contentOffset.x / SCREEN_WIDTH
          );
          setIndex(newIndex);
        }}
        showsHorizontalScrollIndicator={false}
      />

      {/* Dots */}
      <View style={styles.dotsRow}>
        {slides.map((_, i) => (
          <View
            key={i}
            style={[
              styles.dot,
              {
                backgroundColor: i === index ? accent : textColor + "44",
                width: i === index ? 16 : 8,
              },
            ]}
          />
        ))}
      </View>

      {/* Bottom buttons */}
      <View style={styles.bottomRow}>
        {index < slides.length - 1 ? (
          <Pressable
            onPress={goNext}
            style={[styles.cta, { backgroundColor: accent }]}
          >
            <Text
              style={{
                color: accentText,
                fontWeight: "800",
                textAlign: "center",
              }}
            >
              Next
            </Text>
          </Pressable>
        ) : (
          <Pressable
            onPress={finish}
            style={[styles.cta, { backgroundColor: accent }]}
          >
            <Text
              style={{
                color: accentText,
                fontWeight: "800",
                textAlign: "center",
              }}
            >
              Get Started
            </Text>
          </Pressable>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, paddingVertical: 32 },
  topRow: {
    position: "absolute",
    top: 42,
    right: 24,
    zIndex: 10,
  },
  dotsRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 12,
  },
  dot: {
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  bottomRow: {
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 20,
  },
  cta: {
    width: 120,
    textAlign: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 100,
  },
});
