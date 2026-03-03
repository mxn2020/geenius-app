import { useQuery } from "convex/react"
import { useAuth } from "../hooks/useAuth"
import {
  Button,
  Card,
  Badge,
  Separator,
  Loading,
  EmptyState,
} from "@geenius-ui/react"

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

const STATUS_VARIANTS: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  preview: "secondary",
  creating: "outline",
  live: "default",
  suspended: "destructive",
  deleted: "outline",
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

function KpiCard({ label, value, color }: { label: string; value: number | string; color?: string }) {
  return (
    <Card padding="md">
      <p style={{ margin: 0, fontSize: "0.8rem", color: "#6b7280" }}>{label}</p>
      <p style={{ margin: "0.25rem 0 0", fontSize: "2rem", fontWeight: 700, color: color || "#111" }}>{value}</p>
    </Card>
  )
}

function PipelineViz({ steps, color }: { steps: typeof PIPELINE_STEPS; color: string }) {
  return (
    <Card padding="md">
      <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 0 }}>
        {steps.map((step, i) => (
          <div key={step.key} style={{ display: "flex", alignItems: "center" }}>
            <div style={{
              width: 32, height: 32, borderRadius: "50%", backgroundColor: color,
              display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
            }}>
              <span style={{ color: "#fff", fontSize: "0.75rem", fontWeight: 700 }}>{i + 1}</span>
            </div>
            <span style={{ fontSize: "0.7rem", color: "#374151", margin: "0 0.25rem", whiteSpace: "nowrap" }}>
              {step.label}
            </span>
            {i < steps.length - 1 && (
              <div style={{ width: 20, height: 2, backgroundColor: "#d1d5db", flexShrink: 0 }} />
            )}
          </div>
        ))}
      </div>
    </Card>
  )
}

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
        <Button variant="outline" size="sm" onClick={() => signOut()}>
          Sign out
        </Button>
      </header>

      <main style={styles.main}>
        {/* KPIs */}
        <div style={styles.kpiGrid}>
          <KpiCard label="Total Projects" value={projects?.length ?? 0} />
          <KpiCard label="Live" value={liveCount} color="#22c55e" />
          <KpiCard label="Creating" value={creatingCount} color="#f59e0b" />
          <KpiCard label="Previews" value={previewCount} color="#8b5cf6" />
          <KpiCard label="Resellers" value={resellers?.length ?? 0} color="#6366f1" />
        </div>

        {/* Pipeline Visualization */}
        <h2 style={styles.sectionTitle}>🔄 Project Creation Pipeline</h2>
        <PipelineViz steps={PIPELINE_STEPS} color="#6366f1" />

        <h2 style={styles.sectionTitle}>🔀 Preview → Live Conversion</h2>
        <PipelineViz steps={CONVERSION_STEPS} color="#8b5cf6" />

        <div style={{ margin: "2rem 0" }}><Separator /></div>

        {/* Projects */}
        <h2 style={styles.sectionTitle}>All Projects</h2>
        {projects === undefined ? (
          <Loading fullScreen message="Loading projects..." showMessage />
        ) : projects.length === 0 ? (
          <EmptyState title="No projects yet" description="Projects will appear here once created." />
        ) : (
          <div style={styles.grid}>
            {projects.map((project) => (
              <Card key={project._id} padding="md">
                <div style={styles.cardHeader}>
                  <span style={styles.projectName}>{project.name}</span>
                  <Badge
                    variant={STATUS_VARIANTS[project.status] || "default"}
                    style={{ textTransform: "capitalize" }}
                  >
                    {project.status}
                  </Badge>
                </div>
                <p style={styles.slug}>{project.slug}.geenius.app</p>
                <p style={styles.plan}>{project.plan}</p>
                {project.primaryUrl && (
                  <a href={project.primaryUrl} target="_blank" rel="noreferrer" style={styles.link}>
                    Open site →
                  </a>
                )}
              </Card>
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
  main: { maxWidth: 1200, margin: "0 auto", padding: "2rem" },
  kpiGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "1rem", marginBottom: "2rem" },
  sectionTitle: { fontSize: "1.125rem", fontWeight: 600, margin: "2rem 0 1rem" },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "1rem" },
  cardHeader: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.5rem" },
  projectName: { fontWeight: 600, fontSize: "1rem" },
  slug: { color: "#888", fontSize: "0.875rem", margin: "0.25rem 0" },
  plan: { color: "#666", fontSize: "0.875rem", margin: "0.25rem 0" },
  link: { color: "#6366f1", fontSize: "0.875rem", textDecoration: "none" },
}
