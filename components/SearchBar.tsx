import { useThemeColor } from "@/hooks/useThemeColor";
import Ionicons from "@react-native-vector-icons/ionicons/static";
import React from "react";
import { StyleSheet, TextInput, View } from "react-native";

type Props = {
  value: string;
  onChangeText: (v: string) => void;
  placeholder?: string;
};

export default function SearchBar({
  value,
  onChangeText,
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
});
