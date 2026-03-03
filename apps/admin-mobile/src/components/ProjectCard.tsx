import { View, Text, TouchableOpacity, StyleSheet } from "react-native"
import type { Project } from "@geenius/shared-types"
import { StatusBadge } from "./StatusBadge"

const PLAN_ICONS: Record<string, string> = {
  website: "🌐",
  webapp:  "⚡",
  authdb:  "🔐",
  ai:      "🤖",
}

type Props = {
  project: Project & { _id?: string }
  onPress: () => void
}

export function ProjectCard({ project, onPress }: Props) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.left}>
        <Text style={styles.icon}>{PLAN_ICONS[project.plan] ?? "📦"}</Text>
        <View style={styles.info}>
          <Text style={styles.name}>{project.name}</Text>
          <Text style={styles.slug}>{project.slug}.geenius.app</Text>
        </View>
      </View>
      <StatusBadge status={project.status} />
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  left: { flexDirection: "row", alignItems: "center", flex: 1 },
  icon: { fontSize: 24, marginRight: 12 },
  info: { flex: 1 },
  name: { fontSize: 16, fontWeight: "600", color: "#111" },
  slug: { fontSize: 13, color: "#888", marginTop: 2 },
})
