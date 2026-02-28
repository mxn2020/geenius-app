import { useState } from "react"
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from "react-native"
import { useLocalSearchParams, router } from "expo-router"
import { useQuery, useMutation } from "convex/react"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const getProjectQuery = "projects:getProject" as any
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const updateProjectMutation = "projects:updateProject" as any
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const updateStatusMutation = "projects:updateProjectStatus" as any

export default function ProjectSettings() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const project = useQuery(getProjectQuery, { id })
  const updateProject = useMutation(updateProjectMutation)
  const updateStatus = useMutation(updateStatusMutation)
  const [name, setName] = useState("")
  const [saving, setSaving] = useState(false)

  if (!project) {
    return (
      <View style={styles.centered}>
        <Text style={styles.loading}>Loading...</Text>
      </View>
    )
  }

  const displayName = name || project.name

  async function handleSave() {
    if (!name.trim()) return
    setSaving(true)
    try {
      await updateProject({ id, name: name.trim() })
      Alert.alert("Saved", "Project name updated")
    } catch (e) {
      Alert.alert("Error", e instanceof Error ? e.message : "Failed to save")
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    Alert.alert(
      "Delete Project",
      `Are you sure you want to delete "${project!.name}"? This cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await updateStatus({ id, status: "deleted" })
              router.replace("/(app)")
            } catch (e) {
              Alert.alert("Error", e instanceof Error ? e.message : "Failed to delete")
            }
          },
        },
      ]
    )
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Project Settings</Text>

      <Text style={styles.label}>Project name</Text>
      <TextInput
        style={styles.input}
        value={displayName}
        onChangeText={setName}
        placeholder={project.name}
        placeholderTextColor="#999"
      />

      <Text style={styles.label}>Slug</Text>
      <View style={styles.readonlyField}>
        <Text style={styles.readonlyText}>{project.slug}.geenius.app</Text>
      </View>

      <Text style={styles.label}>Plan</Text>
      <View style={styles.readonlyField}>
        <Text style={styles.readonlyText}>{project.plan}</Text>
      </View>

      <TouchableOpacity
        style={[styles.saveButton, saving && styles.buttonDisabled]}
        onPress={handleSave}
        disabled={saving || !name.trim()}
      >
        <Text style={styles.saveButtonText}>{saving ? "Saving..." : "Save Changes"}</Text>
      </TouchableOpacity>

      <View style={styles.dangerZone}>
        <Text style={styles.dangerTitle}>Danger Zone</Text>
        <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
          <Text style={styles.deleteButtonText}>Delete Project</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  content: { padding: 24 },
  centered: { flex: 1, alignItems: "center", justifyContent: "center" },
  loading: { color: "#666" },
  title: { fontSize: 22, fontWeight: "700", marginBottom: 24 },
  label: { fontSize: 14, fontWeight: "600", color: "#333", marginBottom: 8 },
  input: {
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
    marginBottom: 20,
    backgroundColor: "#fafafa",
  },
  readonlyField: {
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 10,
    padding: 14,
    marginBottom: 20,
    backgroundColor: "#f0f0f0",
  },
  readonlyText: { fontSize: 16, color: "#666" },
  saveButton: {
    backgroundColor: "#6366f1",
    borderRadius: 10,
    padding: 16,
    alignItems: "center",
    marginBottom: 40,
  },
  buttonDisabled: { opacity: 0.5 },
  saveButtonText: { color: "#fff", fontWeight: "600", fontSize: 16 },
  dangerZone: {
    borderTopWidth: 1,
    borderTopColor: "#fee2e2",
    paddingTop: 24,
  },
  dangerTitle: { fontSize: 16, fontWeight: "700", color: "#ef4444", marginBottom: 16 },
  deleteButton: {
    borderWidth: 1,
    borderColor: "#ef4444",
    borderRadius: 10,
    padding: 16,
    alignItems: "center",
  },
  deleteButtonText: { color: "#ef4444", fontWeight: "600" },
})
