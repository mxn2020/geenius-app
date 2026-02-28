import { useState, useEffect } from "react"
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from "react-native"
import { router } from "expo-router"
import { useQuery } from "convex/react"
import type { Project } from "@geenius/shared-types"
import { ProjectCard } from "../../src/components/ProjectCard"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const listProjectsQuery = "projects:listProjects" as any

export default function ProjectsScreen() {
  const projects = useQuery(listProjectsQuery)
  const [refreshing, setRefreshing] = useState(false)

  async function onRefresh() {
    setRefreshing(true)
    setTimeout(() => setRefreshing(false), 500)
  }

  if (projects === undefined) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#6366f1" />
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={projects as Project[]}
        keyExtractor={(item) => item._id ?? item.id}
        renderItem={({ item }) => (
          <ProjectCard
            project={item}
            onPress={() => router.push(`/(app)/projects/${item._id ?? item.id}`)}
          />
        )}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={projects.length === 0 ? styles.emptyContainer : styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>No projects yet</Text>
            <Text style={styles.emptySubtitle}>Create your first project to get started</Text>
            <TouchableOpacity
              style={styles.createButton}
              onPress={() => router.push("/(app)/projects/new")}
            >
              <Text style={styles.createButtonText}>Create Project</Text>
            </TouchableOpacity>
          </View>
        }
      />
      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push("/(app)/projects/new")}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8f8f8" },
  centered: { flex: 1, alignItems: "center", justifyContent: "center" },
  list: { padding: 16 },
  emptyContainer: { flex: 1 },
  empty: { flex: 1, alignItems: "center", justifyContent: "center", padding: 32 },
  emptyTitle: { fontSize: 20, fontWeight: "600", marginBottom: 8 },
  emptySubtitle: { fontSize: 14, color: "#666", textAlign: "center", marginBottom: 24 },
  createButton: {
    backgroundColor: "#6366f1",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
  },
  createButtonText: { color: "#fff", fontWeight: "600" },
  fab: {
    position: "absolute",
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#6366f1",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  fabText: { color: "#fff", fontSize: 28, lineHeight: 30 },
})
