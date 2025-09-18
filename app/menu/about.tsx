import { useThemeColor } from "@/hooks/useThemeColor";
import { supabase } from "@/lib/supabase";
import React, { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

export default function AboutScreen() {
  const bg = useThemeColor({}, "background");
  const text = useThemeColor({}, "text");

  const [appName, setAppName] = useState("About Parikrama");
  const [aboutText, setAboutText] = useState(
    "Made by Prittam - www.sapphirepegasus.com"
  );

  useEffect(() => {
    (async () => {
      try {
        const { data } = await supabase
          .from("ParikramaConfig")
          .select("config_name, config_value")
          .in("config_name", ["aboutTitle", "aboutBody"]);

        if (data && data.length) {
          const appNameRow = data.find((d) => d.config_name === "aboutTitle");
          const appAboutRow = data.find((d) => d.config_name === "aboutBody");

          if (appNameRow) setAppName(appNameRow.config_value);
          if (appAboutRow) setAboutText(appAboutRow.config_value);
        }
      } catch {
        // ignore errors, fallback to default
      }
    })();
  }, []);

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
