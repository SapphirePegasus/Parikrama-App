// app/menu/notes.tsx
import { useThemeColor } from "@/hooks/useThemeColor";
import { loadJSON, saveJSON } from "@/lib/storage";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
    Alert,
    FlatList,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";

type NoteItem = { id: string; title: string; body: string; createdAt: string };

const STORAGE_KEY = "parikrama_notes";

export default function NotesScreen() {
  const bg = useThemeColor({}, "background");
  const text = useThemeColor({}, "text");

  const [notes, setNotes] = useState<NoteItem[]>([]);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const saved = await loadJSON<NoteItem[]>(STORAGE_KEY, []);
      setNotes(saved);
    })();
  }, []);

  const saveNote = async () => {
    if (!title.trim() && !body.trim()) {
      Alert.alert("Empty note", "Please enter a title or note body.");
      return;
    }

    if (editingId) {
      const updated = notes.map((n) =>
        n.id === editingId ? { ...n, title, body } : n
      );
      setNotes(updated);
      await saveJSON(STORAGE_KEY, updated);
      setEditingId(null);
      setTitle("");
      setBody("");
      return;
    }

    const newNote: NoteItem = {
      id: String(Date.now()),
      title: title.trim() || "Untitled",
      body,
      createdAt: new Date().toISOString(),
    };
    const updated = [newNote, ...notes];
    setNotes(updated);
    await saveJSON(STORAGE_KEY, updated);
    setTitle("");
    setBody("");
  };

  const editNote = (note: NoteItem) => {
    setEditingId(note.id);
    setTitle(note.title);
    setBody(note.body);
  };

  const deleteNote = async (id: string) => {
    const filtered = notes.filter((n) => n.id !== id);
    setNotes(filtered);
    await saveJSON(STORAGE_KEY, filtered);
  };

  return (
    <View style={[styles.root, { backgroundColor: bg }]}>
      <View style={styles.form}>
        <TextInput
          placeholder="Title"
          placeholderTextColor={text + "99"}
          style={[styles.input, { color: text, borderColor: text + "22" }]}
          value={title}
          onChangeText={setTitle}
        />
        <TextInput
          placeholder="Note"
          placeholderTextColor={text + "99"}
          multiline
          style={[styles.textarea, { color: text, borderColor: text + "22" }]}
          value={body}
          onChangeText={setBody}
        />
        <Pressable style={styles.saveBtn} onPress={saveNote}>
          <Text style={{ color: "#fff", fontWeight: "700" }}>
            {editingId ? "Save" : "Add Note"}
          </Text>
        </Pressable>
      </View>

      <FlatList
        data={notes}
        keyExtractor={(i) => i.id}
        contentContainerStyle={{ padding: 16 }}
        renderItem={({ item }) => (
          <View style={[styles.noteCard, { borderColor: text + "22" }]}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.noteTitle, { color: text }]}>
                {item.title}
              </Text>
              <Text
                style={[styles.noteBody, { color: text }]}
                numberOfLines={3}
              >
                {item.body}
              </Text>
              <Text style={[styles.noteMeta, { color: text }]}>
                {new Date(item.createdAt).toLocaleString()}
              </Text>
            </View>

            <View style={styles.noteActions}>
              <Pressable onPress={() => editNote(item)} style={styles.iconBtn}>
                <Ionicons name="create-outline" size={18} color={text} />
              </Pressable>
              <Pressable
                onPress={() =>
                  Alert.alert("Delete note", "Are you sure?", [
                    { text: "Cancel", style: "cancel" },
                    {
                      text: "Delete",
                      style: "destructive",
                      onPress: () => deleteNote(item.id),
                    },
                  ])
                }
                style={styles.iconBtn}
              >
                <Ionicons name="trash-outline" size={18} color={text} />
              </Pressable>
            </View>
          </View>
        )}
        ListEmptyComponent={() => (
          <View style={{ padding: 16 }}>
            <Text style={{ color: text }}>No notes yet — add one above.</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, paddingTop: 24 },
  form: { padding: 16 },
  input: {
    height: 44,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    marginBottom: 8,
  },
  textarea: {
    minHeight: 80,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    textAlignVertical: "top",
  },
  saveBtn: {
    marginTop: 10,
    backgroundColor: "#0a84ff",
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
  },
  noteCard: {
    flexDirection: "row",
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  noteTitle: { fontSize: 16, fontWeight: "700", marginBottom: 6 },
  noteBody: { fontSize: 14, marginBottom: 8 },
  noteMeta: { fontSize: 12, opacity: 0.7 },
  noteActions: { marginLeft: 12, justifyContent: "space-between" },
  iconBtn: { padding: 6 },
});
