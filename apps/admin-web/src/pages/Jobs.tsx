import { useQuery } from "convex/react"
import { Card, Badge, Loading, EmptyState } from "@geenius-ui/react-css"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const listAllJobsQuery = "jobs:listAll" as any

type Job = {
    _id: string
    projectId: string
    type: string
    state: string
    step?: string
    error?: string
    startedAt?: number
    finishedAt?: number
}

const STATE_VARIANTS: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
    queued: "outline",
    running: "secondary",
    done: "default",
    failed: "destructive",
}

export default function Jobs() {
    const jobs = useQuery(listAllJobsQuery) as Job[] | undefined

    const queuedCount = jobs?.filter(j => j.state === "queued").length ?? 0
    const runningCount = jobs?.filter(j => j.state === "running").length ?? 0
    const failedCount = jobs?.filter(j => j.state === "failed").length ?? 0
    const doneCount = jobs?.filter(j => j.state === "done").length ?? 0

    return (
        <div>
            <h2 style={styles.sectionTitle}>Job Monitor</h2>

            {/* Summary cards */}
            <div style={styles.kpiGrid}>
                <Card padding="md">
                    <p style={styles.kpiLabel}>Queued</p>
                    <p style={{ ...styles.kpiValue, color: "#6b7280" }}>{queuedCount}</p>
                </Card>
                <Card padding="md">
                    <p style={styles.kpiLabel}>Running</p>
                    <p style={{ ...styles.kpiValue, color: "#f59e0b" }}>{runningCount}</p>
                </Card>
                <Card padding="md">
                    <p style={styles.kpiLabel}>Failed</p>
                    <p style={{ ...styles.kpiValue, color: "#ef4444" }}>{failedCount}</p>
                </Card>
                <Card padding="md">
                    <p style={styles.kpiLabel}>Done</p>
                    <p style={{ ...styles.kpiValue, color: "#22c55e" }}>{doneCount}</p>
                </Card>
            </div>

            {/* Jobs list */}
            <div style={{ marginTop: "1.5rem" }}>
                {jobs === undefined ? (
                    <Loading>Loading jobs...</Loading>
                ) : jobs.length === 0 ? (
                    <EmptyState title="No jobs" description="Jobs will appear here once projects are created." />
                ) : (
                    <div style={styles.grid}>
                        {jobs.map((job) => (
                            <Card key={job._id} padding="md">
                                <div style={styles.cardHeader}>
                                    <span style={styles.jobType}>{job.type}</span>
                                    <Badge variant={STATE_VARIANTS[job.state] ?? "outline"}>
                                        {job.state}
                                    </Badge>
                                </div>
                                {job.step && <p style={styles.step}>Step: {job.step}</p>}
                                {job.error && <p style={styles.error}>{job.error}</p>}
                                <p style={styles.meta}>
                                    Project: {String(job.projectId).slice(0, 12)}...
                                    {job.startedAt && ` • Started: ${new Date(job.startedAt).toLocaleString()}`}
                                    {job.finishedAt && ` • Finished: ${new Date(job.finishedAt).toLocaleString()}`}
                                </p>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

const styles: Record<string, React.CSSProperties> = {
    sectionTitle: { fontSize: "1.25rem", fontWeight: 600, marginBottom: "1rem" },
    kpiGrid: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1rem" },
    kpiLabel: { margin: 0, fontSize: "0.8rem", color: "#6b7280" },
    kpiValue: { margin: "0.25rem 0 0", fontSize: "2rem", fontWeight: 700 },
    grid: { display: "grid", gridTemplateColumns: "1fr", gap: "0.75rem" },
    cardHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" },
    jobType: { fontWeight: 600, fontSize: "0.95rem", textTransform: "uppercase" as const },
    step: { color: "#6366f1", fontSize: "0.875rem", margin: "0.25rem 0" },
    error: { color: "#ef4444", fontSize: "0.8rem", margin: "0.25rem 0", fontStyle: "italic" },
    meta: { color: "#6b7280", fontSize: "0.75rem", margin: "0.5rem 0 0" },
}
