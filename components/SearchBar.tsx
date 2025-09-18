// components/SearchBar.tsx
import { useThemeColor } from "@/hooks/useThemeColor";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, TextInput, View } from "react-native";

type Props = {
  value: string;
  onChangeText: (v: string) => void;
  onPressFilter?: () => void;
  placeholder?: string;
};

export default function SearchBar({
  value,
  onChangeText,
  onPressFilter,
  placeholder = "Search",
}: Props) {
  const bg = useThemeColor({}, "background");
  const text = useThemeColor({}, "text");
  const accent = useThemeColor({}, "borderColor");

  return (
    <View style={[styles.row, { backgroundColor: bg }]}>
      <View style={[styles.searchBox, { borderColor: accent }]}>
        <Ionicons name="search-outline" size={18} color={text} />
        <TextInput
          placeholder={placeholder}
          placeholderTextColor={text === "#FFFFFF" ? "#C0C6CC" : "#666"}
          style={[styles.input, { color: text }]}
          value={value}
          onChangeText={onChangeText}
          returnKeyType="search"
        />
      </View>
      {/*<Pressable style={[styles.filterBtn]} onPress={onPressFilter}>
        <Ionicons name="options" size={20} color={accent} />
      </Pressable>*/}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    marginVertical: 8,
  },
  searchBox: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 0.4,
  },
  input: { marginLeft: 8, fontSize: 16, flex: 1, padding: 0 },
  filterBtn: { marginLeft: 10, padding: 10, borderRadius: 8 },
});
