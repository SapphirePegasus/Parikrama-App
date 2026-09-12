import MenuItem from "@/components/MenuItem";
import { useThemeColor } from "@/hooks/useThemeColor";
import { useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

// These could be moved into ParikramaConfig (remote config) later if you
// want to change them without shipping an app update. Keeping them as
// constants for now since that's a deliberate scope decision, not an
// oversight.
const ADD_FESTIVAL_FORM = "https://forms.gle/VX74tot19da2N8Vx9";
const SUGGESTIONS_FORM = "https://forms.gle/aVbhsqnqoiWKgVbj8";

export default function MenuIndex() {
  const router = useRouter();
  const bg = useThemeColor({}, "background");
  const text = useThemeColor({}, "text");

  const openExternal = (url: string) => {
    WebBrowser.openBrowserAsync(url).catch((err) =>
      console.warn("[Menu] Failed to open external link:", err)
    );
  };

  return (
    <ScrollView style={[styles.root, { backgroundColor: bg }]}>
      <Text style={[styles.header, { color: text }]}>Options</Text>
      <View style={styles.container}>
        <MenuItem
          icon="add-circle-outline"
          title="Add Festival"
          subtitle="Suggest a festival/celebration (Google Form)"
          onPress={() => openExternal(ADD_FESTIVAL_FORM)}
        />

        <MenuItem
          icon="chatbox-ellipses-outline"
          title="Feedback & Support"
          subtitle="Send feedback & get support (Google Form)"
          onPress={() => openExternal(SUGGESTIONS_FORM)}
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
  container: { marginTop: 8 },
  header: {
    fontSize: 18,
    fontWeight: "800",
    marginHorizontal: 16,
    marginVertical: 8,
  },
});
