import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert, Linking } from "react-native"
import { useLocalSearchParams, router } from "expo-router"
import { useQuery, useMutation } from "convex/react"
import { StatusBadge } from "../../../../src/components/StatusBadge"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const getProjectQuery = "projects:getProject" as any
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const redeployMutation = "jobs:createJob" as any

const PLAN_LABELS: Record<string, string> = {
  website: "Website — €10/mo",
  webapp: "Web App — €20/mo",
  authdb: "Web App + Auth + DB — €30/mo",
  ai: "Web App + AI — €40/mo",
}

export default function ProjectDashboard() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const project = useQuery(getProjectQuery, { id })

  if (!project) {
    return (
      <View style={styles.centered}>
        <Text style={styles.notFound}>Project not found</Text>
      </View>
    )
  }

  const url = project.primaryUrl ?? `https://${project.slug}.geenius.app`

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.projectName}>{project.name}</Text>
        <StatusBadge status={project.status} />
      </View>

      <View style={styles.card}>
        <Text style={styles.cardLabel}>Live URL</Text>
        <Text style={styles.urlText}>{url}</Text>
        <View style={styles.urlButtons}>
          <TouchableOpacity
            style={styles.urlButton}
            onPress={() => Linking.openURL(url)}
          >
            <Text style={styles.urlButtonText}>Open</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardLabel}>Plan</Text>
        <Text style={styles.infoValue}>{PLAN_LABELS[project.plan] ?? project.plan}</Text>
      </View>

      <View style={styles.actionsRow}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => router.push(`/(app)/projects/${id}/settings`)}
        >
          <Text style={styles.actionButtonText}>⚙ Settings</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => router.push(`/(app)/projects/${id}/domain`)}
        >
          <Text style={styles.actionButtonText}>🌐 Domain</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => router.push(`/(app)/projects/${id}/logs`)}
        >
          <Text style={styles.actionButtonText}>📋 Logs</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.redeployButton}
        onPress={() =>
          Alert.alert("Redeploy", "Trigger a new deployment?", [
            { text: "Cancel", style: "cancel" },
            { text: "Redeploy", style: "default", onPress: () => {} },
          ])
        }
      >
        <Text style={styles.redeployText}>↺ Redeploy</Text>
      </TouchableOpacity>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8f8f8" },
  content: { padding: 16 },
  centered: { flex: 1, alignItems: "center", justifyContent: "center" },
  notFound: { fontSize: 18, color: "#666" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  projectName: { fontSize: 22, fontWeight: "700" },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  cardLabel: { fontSize: 12, color: "#999", fontWeight: "600", marginBottom: 6, textTransform: "uppercase" },
  urlText: { fontSize: 15, color: "#333", marginBottom: 12 },
  urlButtons: { flexDirection: "row", gap: 8 },
  urlButton: {
    backgroundColor: "#6366f1",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  urlButtonText: { color: "#fff", fontWeight: "600" },
  infoValue: { fontSize: 16, color: "#333" },
  actionsRow: { flexDirection: "row", gap: 8, marginBottom: 12 },
  actionButton: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  actionButtonText: { fontSize: 13, fontWeight: "500" },
  redeployButton: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#6366f1",
  },
  redeployText: { color: "#6366f1", fontWeight: "600", fontSize: 16 },
})
