import { useQuery } from "convex/react"
import { useAuth } from "../hooks/useAuth"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const listProjectsQuery = "projects:getAll" as any
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const listResellersQuery = "resellers:listResellers" as any

type Project = {
  _id: string
  name: string
  slug: string
  plan: string
  status: string
  primaryUrl?: string
  createdAt: number
}

const STATUS_COLORS: Record<string, string> = {
  preview: "#8b5cf6",
  creating: "#f59e0b",
  live: "#22c55e",
  suspended: "#ef4444",
  deleted: "#9ca3af",
}

const PIPELINE_STEPS = [
  { key: "reserve_slug", label: "Reserve Slug" },
  { key: "create_github_repo", label: "Create Repo" },
  { key: "push_template", label: "Push Template" },
  { key: "invoke_agent_task", label: "AI Agent" },
  { key: "wait_agent_task", label: "Wait Agent" },
  { key: "create_vercel_project", label: "Vercel Project" },
  { key: "set_env_vars", label: "Env Vars" },
  { key: "deploy", label: "Deploy" },
  { key: "assign_slug_domain", label: "Domain" },
  { key: "verify_live", label: "Verify" },
  { key: "mark_live", label: "Mark Live" },
]

const CONVERSION_STEPS = [
  { key: "convert_preview_to_live", label: "Convert Preview" },
  { key: "deploy", label: "Deploy Prod" },
  { key: "assign_slug_domain", label: "Assign Domain" },
  { key: "verify_live", label: "Verify" },
  { key: "mark_live", label: "Go Live" },
]

export default function Dashboard() {
  const { signOut } = useAuth()
  const projects = useQuery(listProjectsQuery) as Project[] | undefined
  const resellers = useQuery(listResellersQuery) as any[] | undefined

  const liveCount = projects?.filter((p) => p.status === "live").length ?? 0
  const creatingCount = projects?.filter((p) => p.status === "creating").length ?? 0
  const previewCount = projects?.filter((p) => p.status === "preview").length ?? 0

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={styles.headerTitle}>Geenius Admin</h1>
        <button style={styles.signOutButton} onClick={() => signOut()}>Sign out</button>
      </header>

      <main style={styles.main}>
        {/* KPIs */}
        <div style={styles.kpiGrid}>
          <div style={styles.kpiCard}>
            <p style={styles.kpiLabel}>Total Projects</p>
            <p style={styles.kpiValue}>{projects?.length ?? 0}</p>
          </div>
          <div style={styles.kpiCard}>
            <p style={styles.kpiLabel}>Live</p>
            <p style={{ ...styles.kpiValue, color: "#22c55e" }}>{liveCount}</p>
          </div>
          <div style={styles.kpiCard}>
            <p style={styles.kpiLabel}>Creating</p>
            <p style={{ ...styles.kpiValue, color: "#f59e0b" }}>{creatingCount}</p>
          </div>
          <div style={styles.kpiCard}>
            <p style={styles.kpiLabel}>Previews</p>
            <p style={{ ...styles.kpiValue, color: "#8b5cf6" }}>{previewCount}</p>
          </div>
          <div style={styles.kpiCard}>
            <p style={styles.kpiLabel}>Resellers</p>
            <p style={{ ...styles.kpiValue, color: "#6366f1" }}>{resellers?.length ?? 0}</p>
          </div>
        </div>

        {/* Pipeline Visualization */}
        <h2 style={styles.sectionTitle}>🔄 Project Creation Pipeline</h2>
        <div style={styles.pipeline}>
          {PIPELINE_STEPS.map((step, i) => (
            <div key={step.key} style={styles.pipelineStep}>
              <div style={styles.pipelineNode}>
                <span style={styles.stepNumber}>{i + 1}</span>
              </div>
              <span style={styles.stepLabel}>{step.label}</span>
              {i < PIPELINE_STEPS.length - 1 && <div style={styles.pipelineConnector} />}
            </div>
          ))}
        </div>

        <h2 style={styles.sectionTitle}>🔀 Preview → Live Conversion</h2>
        <div style={styles.pipeline}>
          {CONVERSION_STEPS.map((step, i) => (
            <div key={step.key} style={styles.pipelineStep}>
              <div style={{ ...styles.pipelineNode, backgroundColor: "#8b5cf6" }}>
                <span style={styles.stepNumber}>{i + 1}</span>
              </div>
              <span style={styles.stepLabel}>{step.label}</span>
              {i < CONVERSION_STEPS.length - 1 && <div style={styles.pipelineConnector} />}
            </div>
          ))}
        </div>

        {/* Projects */}
        <h2 style={styles.sectionTitle}>All Projects</h2>
        {projects === undefined ? (
          <p style={styles.loading}>Loading projects...</p>
        ) : projects.length === 0 ? (
          <p style={styles.empty}>No projects yet.</p>
        ) : (
          <div style={styles.grid}>
            {projects.map((project) => (
              <div key={project._id} style={styles.card}>
                <div style={styles.cardHeader}>
                  <span style={styles.projectName}>{project.name}</span>
                  <span style={{
                    ...styles.statusBadge,
                    backgroundColor: `${STATUS_COLORS[project.status] ?? "#9ca3af"}20`,
                    color: STATUS_COLORS[project.status] ?? "#9ca3af",
                  }}>
                    {project.status}
                  </span>
                </div>
                <p style={styles.slug}>{project.slug}.geenius.app</p>
                <p style={styles.plan}>{project.plan}</p>
                {project.primaryUrl && (
                  <a href={project.primaryUrl} target="_blank" rel="noreferrer" style={styles.link}>Open site →</a>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  container: { minHeight: "100vh", backgroundColor: "#f8f8f8", fontFamily: "system-ui, sans-serif" },
  header: {
    backgroundColor: "#fff", padding: "1rem 2rem", borderBottom: "1px solid #e0e0e0",
    display: "flex", alignItems: "center", justifyContent: "space-between",
  },
  headerTitle: { fontSize: "1.25rem", fontWeight: 700, margin: 0 },
  signOutButton: {
    background: "none", border: "1px solid #e0e0e0", borderRadius: 8,
    padding: "0.4rem 1rem", cursor: "pointer", fontSize: "0.875rem",
  },
  main: { maxWidth: 1200, margin: "0 auto", padding: "2rem" },
  kpiGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "1rem", marginBottom: "2rem" },
  kpiCard: { backgroundColor: "#fff", borderRadius: 12, padding: "1.25rem", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" },
  kpiLabel: { margin: 0, fontSize: "0.8rem", color: "#6b7280" },
  kpiValue: { margin: "0.25rem 0 0", fontSize: "2rem", fontWeight: 700, color: "#111" },
  sectionTitle: { fontSize: "1.125rem", fontWeight: 600, margin: "2rem 0 1rem" },
  pipeline: { display: "flex", alignItems: "center", flexWrap: "wrap" as const, gap: 0, backgroundColor: "#fff", borderRadius: 12, padding: "1.5rem", marginBottom: "1.5rem", overflowX: "auto" as const },
  pipelineStep: { display: "flex", alignItems: "center", gap: 0 },
  pipelineNode: {
    width: 32, height: 32, borderRadius: "50%", backgroundColor: "#6366f1",
    display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
  },
  stepNumber: { color: "#fff", fontSize: "0.75rem", fontWeight: 700 },
  stepLabel: { fontSize: "0.7rem", color: "#374151", margin: "0 0.25rem", whiteSpace: "nowrap" as const },
  pipelineConnector: { width: 20, height: 2, backgroundColor: "#d1d5db", flexShrink: 0 },
  loading: { color: "#666" },
  empty: { color: "#999", fontStyle: "italic" },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "1rem" },
  card: { backgroundColor: "#fff", borderRadius: 12, padding: "1.25rem", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" },
  cardHeader: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.5rem" },
  projectName: { fontWeight: 600, fontSize: "1rem" },
  statusBadge: { borderRadius: 20, padding: "0.25rem 0.6rem", fontSize: "0.75rem", fontWeight: 600, textTransform: "capitalize" as const },
  slug: { color: "#888", fontSize: "0.875rem", margin: "0.25rem 0" },
  plan: { color: "#666", fontSize: "0.875rem", margin: "0.25rem 0" },
  link: { color: "#6366f1", fontSize: "0.875rem", textDecoration: "none" },
}
