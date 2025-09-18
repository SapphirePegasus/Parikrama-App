// app/celebration/index.tsx
import Header from "@/components/HomeHeader";
import { useThemeColor } from "@/hooks/useThemeColor";
import { StyleSheet, Text, View } from "react-native";

export default function CelebrationsIndex() {
  const bg = useThemeColor({}, "background");
  const text = useThemeColor({}, "text");

  return (
    <View style={[styles.container, { backgroundColor: bg }]}>
      <Header />
      <View style={styles.content}>
        <Text style={[styles.text, { color: text }]}>
          Select a celebration to view details.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, alignItems: "center", justifyContent: "center" },
  text: { fontSize: 16, fontWeight: "500" },
});
