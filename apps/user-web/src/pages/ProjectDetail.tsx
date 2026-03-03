import { useQuery } from "convex/react"
import { useAuth } from "../hooks/useAuth"
import { Link, useParams } from "@tanstack/react-router"
import { Button, Card, Badge } from "@geenius-ui/react-css"

// We will need a convex query to get a specific project by id/slug
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const getProjectQuery = "projects:getProject" as any
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const listDomainsQuery = "domains:listDomains" as any
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const getCurrentAllowanceQuery = "ai:getCurrentAllowance" as any

export default function ProjectDetail() {
    const { signOut } = useAuth()
    const { projectId } = useParams({ strict: false }) as { projectId: string }

    const project = useQuery(getProjectQuery, { id: projectId })
    const domains = useQuery(listDomainsQuery, project ? { projectId } : "skip")
    const aiAllowance = useQuery(getCurrentAllowanceQuery, project?.plan === "ai" ? { projectId } : "skip")

    if (project === undefined) {
        return (
            <div style={styles.container}>
                <header style={styles.header}>
                    <h1 style={styles.headerTitle}>Geenius Portal</h1>
                    <Button variant="outline" size="sm" onClick={() => signOut()}>
                        Sign out
                    </Button>
                </header>
                <main style={styles.main}>
                    <p>Loading...</p>
                </main>
            </div>
        )
    }

    if (project === null) {
        return (
            <div style={styles.container}>
                <header style={styles.header}>
                    <h1 style={styles.headerTitle}>Geenius Portal</h1>
                    <Button variant="outline" size="sm" onClick={() => signOut()}>
                        Sign out
                    </Button>
                </header>
                <main style={styles.main}>
                    <p>Project not found.</p>
                    <Link to="/">← Back to Dashboard</Link>
                </main>
            </div>
        )
    }

    return (
        <div style={styles.container}>
            <header style={styles.header}>
                <div style={styles.headerLeft}>
                    <Link to="/" style={styles.backLink}>← Back</Link>
                    <h1 style={styles.headerTitle}>{project.name}</h1>
                    <Badge variant="secondary">
                        {project.status}
                    </Badge>
                </div>
                <Button variant="outline" size="sm" onClick={() => signOut()}>
                    Sign out
                </Button>
            </header>

            <main style={styles.main}>
                <div style={styles.grid}>
                    <Card padding="md">
                        <h3>Overview</h3>
                        <p><strong>Plan:</strong> {project.plan}</p>
                        <p><strong>URL:</strong> <a href={`https://${project.slug}.geenius.app`} target="_blank" rel="noreferrer">
                            {project.slug}.geenius.app
                        </a></p>
                    </Card>

                    <Card padding="md">
                        <h3>Domains</h3>
                        <p>Manage domains for this project.</p>
                        {domains === undefined ? <p>Loading domains...</p> : domains.length === 0 ? <p>No domains attached yet.</p> : (
                            <ul style={{ paddingLeft: "1.5rem", marginBottom: "1rem" }}>
                                {domains.map((d: any) => (
                                    <li key={d._id}>
                                        <strong>{d.domainName}</strong> - {d.status}
                                    </li>
                                ))}
                            </ul>
                        )}
                        <Button size="sm" style={{ marginTop: "1rem" }}>Attach Domain</Button>
                    </Card>

                    {project.plan === "ai" && (
                        <Card padding="md">
                            <h3>AI Settings</h3>
                            <p>Configure the AI model for your application.</p>
                            {aiAllowance === undefined ? <p>Loading allowance...</p> : aiAllowance === null ? <p>No active allowance period.</p> : (
                                <div style={{ marginBottom: "1rem" }}>
                                    <p><strong>Credits Used:</strong> {aiAllowance.creditsUsed} / {aiAllowance.creditsGranted}</p>
                                </div>
                            )}
                            <Button size="sm" style={{ marginTop: "1rem" }}>Update Model</Button>
                        </Card>
                    )}
                </div>
            </main>
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
    headerLeft: { display: "flex", alignItems: "center" },
    headerTitle: { fontSize: "1.25rem", fontWeight: 700, margin: 0, color: "#111", marginLeft: "1rem" },
    backLink: { textDecoration: "none", color: "#6366f1", fontWeight: 500 },
    main: { maxWidth: 1200, margin: "0 auto", padding: "2rem" },
    grid: {
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "1.5rem",
    }
}
