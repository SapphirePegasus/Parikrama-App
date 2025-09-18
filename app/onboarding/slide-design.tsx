import React, { useEffect, useRef } from "react";
import { Animated, Image, StyleSheet, Text } from "react-native";

interface SlideProps {
  title: string;
  text: string;
  image?: string;
  active: boolean;
  textColor: string;
}

export default function SlideDesign({
  title,
  text,
  image,
  active,
  textColor,
}: SlideProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: active ? 1 : 0,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: active ? 1 : 0.95,
        useNativeDriver: true,
      }),
    ]).start();
  }, [active, fadeAnim, scaleAnim]);

  return (
    <Animated.View
      style={[
        styles.container,
        { opacity: fadeAnim, transform: [{ scale: scaleAnim }] },
      ]}
    >
      {image ? <Image source={{ uri: image }} style={styles.image} /> : null}
      <Text style={[styles.title, { color: textColor }]}>{title}</Text>
      <Text style={[styles.text, { color: textColor }]}>{text}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 24,
    width: "100%",
  },
  image: {
    width: "100%",
    height: "70%",
    marginVertical: 24,
    borderRadius: 12,
    resizeMode: "cover",
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 12,
    textAlign: "center",
  },
  text: {
    fontSize: 15,
    textAlign: "center",
    lineHeight: 20,
  },
});
