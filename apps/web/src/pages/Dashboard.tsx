import { useQuery } from "convex/react"
import { useAuth } from "../hooks/useAuth"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const listProjectsQuery = "projects:listProjects" as any

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
  creating:  "#f59e0b",
  live:      "#22c55e",
  suspended: "#ef4444",
  deleted:   "#9ca3af",
}

export default function Dashboard() {
  const { signOut } = useAuth()
  const projects = useQuery(listProjectsQuery) as Project[] | undefined

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={styles.headerTitle}>Geenius Admin</h1>
        <button style={styles.signOutButton} onClick={() => signOut()}>
          Sign out
        </button>
      </header>

      <main style={styles.main}>
        <h2 style={styles.sectionTitle}>Projects</h2>

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
                  <span
                    style={{
                      ...styles.statusBadge,
                      backgroundColor: `${STATUS_COLORS[project.status] ?? "#9ca3af"}20`,
                      color: STATUS_COLORS[project.status] ?? "#9ca3af",
                    }}
                  >
                    {project.status}
                  </span>
                </div>
                <p style={styles.slug}>{project.slug}.geenius.app</p>
                <p style={styles.plan}>{project.plan}</p>
                {project.primaryUrl && (
                  <a href={project.primaryUrl} target="_blank" rel="noreferrer" style={styles.link}>
                    Open site →
                  </a>
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
  container: { minHeight: "100vh", backgroundColor: "#f8f8f8" },
  header: {
    backgroundColor: "#fff",
    padding: "1rem 2rem",
    borderBottom: "1px solid #e0e0e0",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerTitle: { fontSize: "1.25rem", fontWeight: 700, margin: 0 },
  signOutButton: {
    background: "none",
    border: "1px solid #e0e0e0",
    borderRadius: 8,
    padding: "0.4rem 1rem",
    cursor: "pointer",
    fontSize: "0.875rem",
  },
  main: { maxWidth: 1200, margin: "0 auto", padding: "2rem" },
  sectionTitle: { fontSize: "1.25rem", fontWeight: 600, marginBottom: "1rem" },
  loading: { color: "#666" },
  empty: { color: "#999", fontStyle: "italic" },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
    gap: "1rem",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: "1.25rem",
    boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
  },
  cardHeader: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.5rem" },
  projectName: { fontWeight: 600, fontSize: "1rem" },
  statusBadge: {
    borderRadius: 20,
    padding: "0.25rem 0.6rem",
    fontSize: "0.75rem",
    fontWeight: 600,
    textTransform: "capitalize" as const,
  },
  slug: { color: "#888", fontSize: "0.875rem", margin: "0.25rem 0" },
  plan: { color: "#666", fontSize: "0.875rem", margin: "0.25rem 0" },
  link: { color: "#6366f1", fontSize: "0.875rem", textDecoration: "none" },
}
