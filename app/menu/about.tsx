import { useAppConfig } from "@/context/AppConfigContext";
import { useThemeColor } from "@/hooks/useThemeColor";
import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

export default function AboutScreen() {
  const bg = useThemeColor({}, "background");
  const text = useThemeColor({}, "text");
  const { config } = useAppConfig();

  const appName = config.aboutTitle ?? "About Parikrama";
  const aboutText =
    config.aboutBody ?? "Made by Prittam - www.sapphirepegasus.com";

  return (
    <ScrollView style={[styles.root, { backgroundColor: bg }]}>
      <View style={styles.block}>
        <Text style={[styles.title, { color: text }]}>{appName}</Text>
        <Text style={[styles.p, { color: text }]}>{aboutText}</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, paddingTop: 32 },
  block: { padding: 24 },
  title: { fontSize: 22, fontWeight: "800", marginBottom: 16 },
  p: { fontSize: 14, lineHeight: 24 },
});
