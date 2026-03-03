import { useQuery, useMutation } from "convex/react"
import { useAuth } from "../hooks/useAuth"
import { Link } from "@tanstack/react-router"
import { useState, useEffect } from "react"
import {
  Button,
  Input,
  Textarea,
  Label,
  Select,
  SelectItem,
  Card,
  Badge,
  AlertDialog,
} from "@geenius-ui/react-css"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const listProjectsQuery = "projects:listProjects" as any
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const createProjectMutation = "projects:createProject" as any

type Project = {
  _id: string
  name: string
  slug: string
  plan: string
  status: string
  primaryUrl?: string
  createdAt: number
}

const STATUS_COLORS: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  creating: "secondary",
  live: "default",
  suspended: "destructive",
  deleted: "outline",
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40)
}

export default function Dashboard() {
  const { signOut } = useAuth()
  const projects = useQuery(listProjectsQuery) as Project[] | undefined
  const createProject = useMutation(createProjectMutation)

  const [showCreate, setShowCreate] = useState(false)
  const [name, setName] = useState("")
  const [slug, setSlug] = useState("")
  const [plan, setPlan] = useState("webapp")
  const [prompt, setPrompt] = useState("")
  const [isCreating, setIsCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (name && !slug) {
      setSlug(slugify(name))
    }
  }, [name])

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setIsCreating(true)
    setError(null)
    try {
      await createProject({ name, slug, plan, prompt: prompt || undefined })
      setShowCreate(false)
      setName("")
      setSlug("")
      setPrompt("")
      setPlan("webapp")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create project")
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={styles.headerTitle}>Geenius Portal</h1>
        <Button variant="outline" size="sm" onClick={() => signOut()}>
          Sign out
        </Button>
      </header>

      <main style={styles.main}>
        <div style={styles.sectionHeader}>
          <h2 style={styles.sectionTitle}>My Projects</h2>
          {!showCreate && (
            <Button onClick={() => setShowCreate(true)}>
              + New Project
            </Button>
          )}
        </div>

        {showCreate && (
          <div style={styles.createFormContainer}>
            <Card padding="lg">
              <h3 style={styles.formTitle}>Launch a New Project</h3>
              <form onSubmit={handleCreate} style={styles.form}>
                <div style={styles.inputGroup}>
                  <Label>Project Name</Label>
                  <Input
                    required
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value)
                      setSlug(slugify(e.target.value))
                    }}
                    placeholder="e.g. Acme Corp"
                  />
                </div>

                <div style={styles.inputGroup}>
                  <Label>Subdomain</Label>
                  <div style={styles.domainRow}>
                    <Input
                      style={{ borderTopRightRadius: 0, borderBottomRightRadius: 0 }}
                      required
                      value={slug}
                      onChange={(e) => setSlug(slugify(e.target.value))}
                    />
                    <span style={styles.domainSuffix}>.geenius.app</span>
                  </div>
                </div>

                <div style={styles.inputGroup}>
                  <Label>Plan</Label>
                  <Select value={plan} onChange={(e) => setPlan(e.target.value)}>
                    <SelectItem value="website">Website — Static / Landing Page</SelectItem>
                    <SelectItem value="webapp">Web App — Dynamic React</SelectItem>
                    <SelectItem value="authdb">Auth + DB — Fullstack Convex</SelectItem>
                    <SelectItem value="ai">AI — Auth + DB + Anthropic</SelectItem>
                  </Select>
                </div>

                <div style={styles.inputGroup}>
                  <Label>AI Prompt (Optional)</Label>
                  <Textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Describe what the AI should build for you. e.g. A CRM for real estate agents..."
                  />
                </div>

                <div style={styles.formActions}>
                  <Button type="button" variant="outline" onClick={() => setShowCreate(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isCreating}>
                    {isCreating ? "Launching..." : "Launch Project 🚀"}
                  </Button>
                </div>
              </form>
            </Card>
          </div>
        )}

        {projects === undefined ? (
          <p style={styles.loading}>Loading projects...</p>
        ) : projects.length === 0 ? (
          <p style={styles.empty}>No projects yet. Click "+ New Project" to get started.</p>
        ) : (
          <div style={styles.grid}>
            {projects.map((project) => (
              <Card key={project._id} padding="md">
                <div style={styles.cardHeader}>
                  <span style={styles.projectName}>{project.name}</span>
                  <Badge variant={STATUS_COLORS[project.status] || "default"}>
                    {project.status}
                  </Badge>
                </div>
                <p style={styles.slug}>{project.slug}.geenius.app</p>
                <p style={styles.plan}>{project.plan}</p>

                <div style={styles.cardActions}>
                  <Link to={`/project/${project._id}`} style={styles.manageLink}>
                    Manage Project
                  </Link>

                  {project.primaryUrl && (
                    <a href={project.primaryUrl} target="_blank" rel="noreferrer" style={styles.link}>
                      Open site →
                    </a>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>

      <AlertDialog
        open={!!error}
        onClose={() => setError(null)}
        title="Error"
        description={error || ""}
        confirmText="OK"
        onConfirm={() => setError(null)}
      />
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  container: { minHeight: "100vh", backgroundColor: "#f8f8f8", fontFamily: "system-ui, sans-serif" },
  header: {
    backgroundColor: "#fff",
    padding: "1rem 2rem",
    borderBottom: "1px solid #e0e0e0",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerTitle: { fontSize: "1.25rem", fontWeight: 700, margin: 0, color: "#111" },
  main: { maxWidth: 1200, margin: "0 auto", padding: "2rem" },
  sectionHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" },
  sectionTitle: { fontSize: "1.5rem", fontWeight: 600, margin: 0 },
  createFormContainer: {
    padding: "2rem",
    marginBottom: "2rem",
  },
  formTitle: { marginTop: 0, marginBottom: "1.5rem", fontSize: "1.25rem" },
  form: { display: "flex", flexDirection: "column", gap: "1rem" },
  inputGroup: { display: "flex", flexDirection: "column", gap: "0.5rem" },
  domainRow: { display: "flex", alignItems: "center" },
  domainSuffix: {
    padding: "0.55rem 1rem",
    backgroundColor: "#f3f4f6",
    border: "1px solid #d1d5db",
    borderLeft: "none",
    borderRadius: "0 6px 6px 0",
    color: "#6b7280",
    fontSize: "0.875rem",
  },
  formActions: { display: "flex", justifyContent: "flex-end", gap: "1rem", marginTop: "1rem" },
  loading: { color: "#666" },
  empty: { color: "#6b7280", fontStyle: "italic", padding: "2rem", textAlign: "center", backgroundColor: "#fff", borderRadius: "12px" },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
    gap: "1.5rem",
  },
  cardHeader: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.75rem" },
  projectName: { fontWeight: 600, fontSize: "1.125rem", color: "#111" },
  slug: { color: "#6b7280", fontSize: "0.875rem", margin: "0.25rem 0" },
  plan: { color: "#4b5563", fontSize: "0.875rem", margin: "0.25rem 0" },
  cardActions: { display: "flex", gap: "1rem", marginTop: "1rem", alignItems: "center" },
  manageLink: { color: "#111", fontSize: "0.875rem", textDecoration: "none", fontWeight: 500 },
  link: { color: "#6366f1", fontSize: "0.875rem", textDecoration: "none" },
}
