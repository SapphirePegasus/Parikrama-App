import { useThemeColor } from "@/hooks/useThemeColor";
import { Ionicons } from "@expo/vector-icons";
import React, { useMemo, useState } from "react";
import {
    FlatList,
    Keyboard,
    Modal,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    TouchableWithoutFeedback,
    View,
} from "react-native";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";

type City = { id: number; city: string; state?: string; country?: string };

interface CitySelectorModalProps {
  visible: boolean;
  onClose: () => void;
  cities: City[];
  selectedCity?: string;
  onSelect: (city: City) => void;
}

export default function CitySelectorModal({
  visible,
  onClose,
  cities,
  selectedCity,
  onSelect,
}: CitySelectorModalProps) {
  const bg = useThemeColor({}, "background");
  const text = useThemeColor({}, "text");

  const [search, setSearch] = useState("");

  const filteredCities = useMemo(() => {
    if (!search.trim()) return cities;
    return cities.filter((c) =>
      c.city.toLowerCase().includes(search.toLowerCase())
    );
  }, [search, cities]);

  const sortedCities = useMemo(() => {
    if (!selectedCity) return filteredCities;
    const selected = filteredCities.filter((c) => c.city === selectedCity);
    const rest = filteredCities.filter((c) => c.city !== selectedCity);
    return [...selected, ...rest];
  }, [filteredCities, selectedCity]);

  return (
    <Modal
      visible={visible}
      animationType="none"
      transparent
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay} />
      </TouchableWithoutFeedback>

      <Animated.View
        entering={FadeIn.duration(400)}
        exiting={FadeOut.duration(400)}
        style={[styles.container, { backgroundColor: bg }]}
      >
        {/* Header */}
        <View style={styles.headerRow}>
          <Text style={[styles.headerText, { color: text }]}>
            Select a City
          </Text>
          <Pressable onPress={onClose} hitSlop={12}>
            <Ionicons name="close" size={24} color={text} />
          </Pressable>
        </View>

        {/* Search Box */}
        <View style={[styles.searchBox, { borderColor: text }]}>
          <Ionicons
            name="search-outline"
            size={18}
            color={text}
            style={{ marginRight: 6 }}
          />
          <TextInput
            style={[styles.input, { color: text }]}
            placeholder="Search"
            placeholderTextColor={text + "99"}
            value={search}
            onChangeText={setSearch}
            returnKeyType="search"
            onSubmitEditing={Keyboard.dismiss}
          />
        </View>

        {/* Cities List */}
        <FlatList
          data={sortedCities}
          keyExtractor={(item) => item.id.toString()}
          keyboardShouldPersistTaps="handled"
          renderItem={({ item }) => (
            <Pressable
              style={({ pressed }) => [
                styles.item,
                {
                  backgroundColor:
                    item.city === selectedCity ? text + "15" : "transparent",
                  opacity: pressed ? 0.6 : 1,
                },
              ]}
              onPress={() => {
                onSelect(item);
                onClose();
              }}
            >
              <Text
                style={[
                  styles.city,
                  {
                    color: text,
                    fontWeight: item.city === selectedCity ? "700" : "500",
                  },
                ]}
              >
                {item.city}
              </Text>
              <Text style={[styles.meta, { color: text }]}>
                {item.state}, {item.country}
              </Text>
            </Pressable>
          )}
        />
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
  },
  container: {
    position: "absolute",
    top: "15%",
    left: "5%",
    right: "5%",
    borderRadius: 16,
    padding: 16,
    height: "70%",
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  headerText: {
    fontSize: 18,
    fontWeight: "800",
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 0,
    marginBottom: 16,
  },
  input: {
    flex: 1,
    fontSize: 14,
  },
  item: {
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 8,
    //borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#ccc",
  },
  city: {
    fontSize: 16,
  },
  meta: {
    fontSize: 12,
    opacity: 0.7,
  },
});
