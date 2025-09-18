// app/menu/index.tsx
import MenuItem from "@/components/MenuItem";
import { useThemeColor } from "@/hooks/useThemeColor";
import { useRouter } from "expo-router";
import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

export default function MenuIndex() {
  const router = useRouter();
  const bg = useThemeColor({}, "background");
  const text = useThemeColor({}, "text");

  // Replace these with your real Google Form URLs later (can be pulled from ParikramaConfig)
  const ADD_FESTIVAL_FORM = "https://forms.gle/VX74tot19da2N8Vx9";
  const SUGGESTIONS_FORM = "https://forms.gle/aVbhsqnqoiWKgVbj8";

  return (
    <ScrollView style={[styles.root, { backgroundColor: bg }]}>
      <Text style={[styles.header, { color: text }]}>Options</Text>
      <View style={styles.container}>
        <MenuItem
          icon="add-circle-outline"
          title="Add Festival"
          subtitle="Suggest a festival/celebration (Google Form)"
          onPress={() => router.push({ pathname: ADD_FESTIVAL_FORM })}
        />

        <MenuItem
          icon="chatbox-ellipses-outline"
          title="Feedback & Support"
          subtitle="Send feedbacks & get support (Google Form)"
          onPress={() => router.push({ pathname: SUGGESTIONS_FORM })}
        />

        <MenuItem
          icon="business-outline"
          title="Utilities"
          subtitle="Find various utilities near you"
          onPress={() => router.push("/utilities")}
        />

        <MenuItem
          icon="help-circle-outline"
          title="Help"
          subtitle="Get help on how to use the app"
          onPress={() => router.push("/onboarding")}
        />

        <MenuItem
          icon="information-circle-outline"
          title="About"
          subtitle="About Parikrama"
          onPress={() => router.push("/menu/about")}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, paddingTop: 40 },
  container: { marginTop: 8, backgroundColor: "transparent" },
  header: {
    fontSize: 18,
    fontWeight: "800",
    marginHorizontal: 16,
    marginVertical: 8,
  },
});
