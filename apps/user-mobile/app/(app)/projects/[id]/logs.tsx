import { View, Text, FlatList, StyleSheet, ActivityIndicator } from "react-native"
import { useLocalSearchParams } from "expo-router"
import { useQuery } from "convex/react"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const listJobsQuery = "jobs:listJobsByProject" as any
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const listLogsQuery = "jobs:listJobLogs" as any

type JobLog = {
  _id: string
  timestamp: number
  level: "info" | "warn" | "error"
  message: string
}

type Job = {
  _id: string
  type: string
  state: string
  startedAt?: number
  finishedAt?: number
  step?: string
}

const LEVEL_COLORS: Record<string, string> = {
  info: "#333",
  warn: "#f59e0b",
  error: "#ef4444",
}

function formatTime(ts: number) {
  return new Date(ts).toLocaleTimeString()
}

export default function JobLogs() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const jobs = useQuery(listJobsQuery, { projectId: id })
  const latestJob = jobs?.[0] as Job | undefined
  const logs = useQuery(listLogsQuery, latestJob ? { jobId: latestJob._id } : "skip") as JobLog[] | undefined

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Job Logs</Text>

      {jobs === undefined ? (
        <ActivityIndicator size="large" color="#6366f1" />
      ) : !latestJob ? (
        <Text style={styles.empty}>No jobs yet</Text>
      ) : (
        <>
          <View style={styles.jobInfo}>
            <Text style={styles.jobType}>{latestJob.type}</Text>
            <Text style={[styles.jobState, latestJob.state === "done" ? styles.stateDone : latestJob.state === "failed" ? styles.stateFailed : styles.stateRunning]}>
              {latestJob.state}
            </Text>
          </View>

          {logs === undefined ? (
            <ActivityIndicator size="small" color="#6366f1" />
          ) : (
            <FlatList
              data={logs}
              keyExtractor={(item) => item._id}
              renderItem={({ item }) => (
                <View style={styles.logRow}>
                  <Text style={styles.logTime}>{formatTime(item.timestamp)}</Text>
                  <Text style={[styles.logMessage, { color: LEVEL_COLORS[item.level] }]}>
                    {item.message}
                  </Text>
                </View>
              )}
              style={styles.logList}
              contentContainerStyle={styles.logContent}
            />
          )}
        </>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0f0f0f", padding: 16 },
  title: { fontSize: 18, fontWeight: "700", color: "#fff", marginBottom: 12 },
  empty: { color: "#666", fontStyle: "italic" },
  jobInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#333",
  },
  jobType: { color: "#aaa", fontSize: 14 },
  jobState: { fontSize: 14, fontWeight: "600" },
  stateDone: { color: "#22c55e" },
  stateFailed: { color: "#ef4444" },
  stateRunning: { color: "#f59e0b" },
  logList: { flex: 1 },
  logContent: { paddingBottom: 20 },
  logRow: { flexDirection: "row", marginBottom: 4 },
  logTime: { color: "#555", fontSize: 12, marginRight: 8, minWidth: 70 },
  logMessage: { fontSize: 13, flex: 1, fontFamily: "monospace" },
})
