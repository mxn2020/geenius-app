import { useQuery, useMutation } from "convex/react"
import { useAuth } from "../hooks/useAuth"
import { Link, useParams } from "@tanstack/react-router"
import { useState } from "react"
import { Button, Card, Badge, Input, Label, Select } from "@geenius-ui/react-css"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const getProjectQuery = "projects:getProject" as any
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const listDomainsQuery = "domains:listDomains" as any
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const getCurrentAllowanceQuery = "ai:getCurrentAllowance" as any
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const getSettingsQuery = "project_settings:getByProject" as any
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const upsertSettingsMutation = "project_settings:upsert" as any
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const getSubscriptionQuery = "subscriptions:getByProject" as any

const AI_MODELS = [
    { value: "gpt-4o", label: "GPT-4o" },
    { value: "gpt-4o-mini", label: "GPT-4o Mini" },
    { value: "claude-3-5-sonnet", label: "Claude 3.5 Sonnet" },
    { value: "claude-3-haiku", label: "Claude 3 Haiku" },
]

const STATUS_COLORS: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
    preview: "secondary",
    creating: "outline",
    live: "default",
    suspended: "destructive",
    deleted: "outline",
}

export default function ProjectDetail() {
    const { signOut } = useAuth()
    const { projectId } = useParams({ strict: false }) as { projectId: string }

    const project = useQuery(getProjectQuery, { id: projectId })
    const domains = useQuery(listDomainsQuery, project ? { projectId } : "skip")
    const aiAllowance = useQuery(getCurrentAllowanceQuery, project?.plan === "ai" ? { projectId } : "skip")
    const settings = useQuery(getSettingsQuery, project ? { projectId } : "skip")
    const subscription = useQuery(getSubscriptionQuery, project ? { projectId } : "skip")

    const upsertSettings = useMutation(upsertSettingsMutation)

    const [domainSearch, setDomainSearch] = useState("")
    const [selectedModel, setSelectedModel] = useState("")
    const [savingModel, setSavingModel] = useState(false)
    const [redeploying, setRedeploying] = useState(false)
    const [modelSaved, setModelSaved] = useState(false)

    async function handleUpdateModel() {
        if (!selectedModel || !project) return
        setSavingModel(true)
        setModelSaved(false)
        try {
            await upsertSettings({ projectId, aiModel: selectedModel })
            setModelSaved(true)
            setTimeout(() => setModelSaved(false), 3000)
        } catch (err) {
            console.error("Failed to update model:", err)
        } finally {
            setSavingModel(false)
        }
    }

    async function handleRedeploy() {
        if (!project || project.status !== "live") return
        setRedeploying(true)
        try {
            const apiBase = import.meta.env.VITE_API_URL || "http://localhost:3004"
            await fetch(`${apiBase}/projects/${projectId}/redeploy`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
            })
        } catch (err) {
            console.error("Failed to redeploy:", err)
        } finally {
            setRedeploying(false)
        }
    }

    async function handleDomainSearch() {
        if (!domainSearch) return
        try {
            const apiBase = import.meta.env.VITE_API_URL || "http://localhost:3004"
            const res = await fetch(`${apiBase}/domains/search?query=${encodeURIComponent(domainSearch)}`)
            const data = await res.json()
            console.log("Domain search results:", data)
            // TODO: render results in a list below the search input
        } catch (err) {
            console.error("Domain search failed:", err)
        }
    }

    if (project === undefined) {
        return (
            <div style={styles.container}>
                <header style={styles.header}>
                    <h1 style={styles.headerTitle}>Geenius Portal</h1>
                    <Button variant="outline" size="sm" onClick={() => signOut()}>Sign out</Button>
                </header>
                <main style={styles.main}><p>Loading...</p></main>
            </div>
        )
    }

    if (project === null) {
        return (
            <div style={styles.container}>
                <header style={styles.header}>
                    <h1 style={styles.headerTitle}>Geenius Portal</h1>
                    <Button variant="outline" size="sm" onClick={() => signOut()}>Sign out</Button>
                </header>
                <main style={styles.main}>
                    <p>Project not found.</p>
                    <Link to="/">← Back to Dashboard</Link>
                </main>
            </div>
        )
    }

    const currentModel = settings?.aiModel ?? "gpt-4o-mini"
    const creditsUsed = aiAllowance?.creditsUsed ?? 0
    const creditsGranted = aiAllowance?.creditsGranted ?? 0
    const creditsPercent = creditsGranted > 0 ? Math.round((creditsUsed / creditsGranted) * 100) : 0

    return (
        <div style={styles.container}>
            <header style={styles.header}>
                <div style={styles.headerLeft}>
                    <Link to="/" style={styles.backLink}>← Back</Link>
                    <h1 style={styles.headerTitle}>{project.name}</h1>
                    <Badge variant={STATUS_COLORS[project.status] || "default"}>
                        {project.status}
                    </Badge>
                </div>
                <Button variant="outline" size="sm" onClick={() => signOut()}>Sign out</Button>
            </header>

            <main style={styles.main}>
                <div style={styles.grid}>
                    {/* Overview Card */}
                    <Card padding="md">
                        <h3 style={{ marginTop: 0 }}>Overview</h3>
                        <p><strong>Plan:</strong> {project.plan}</p>
                        <p><strong>URL:</strong>{" "}
                            <a href={`https://${project.slug}.geenius.app`} target="_blank" rel="noreferrer" style={{ color: "#6366f1" }}>
                                {project.slug}.geenius.app
                            </a>
                        </p>
                        {project.primaryUrl && project.primaryUrl !== `https://${project.slug}.geenius.app` && (
                            <p><strong>Custom Domain:</strong>{" "}
                                <a href={project.primaryUrl} target="_blank" rel="noreferrer" style={{ color: "#6366f1" }}>
                                    {project.primaryUrl.replace("https://", "")}
                                </a>
                            </p>
                        )}
                        {subscription && (
                            <p style={{ fontSize: "0.875rem", color: "#666" }}>
                                <strong>Billing:</strong> {subscription.status} •
                                Next renewal: {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
                            </p>
                        )}
                    </Card>

                    {/* Domains Card */}
                    <Card padding="md">
                        <h3 style={{ marginTop: 0 }}>Domains</h3>
                        {domains === undefined ? <p>Loading domains...</p> : domains.length === 0 ? <p style={{ color: "#999" }}>No custom domains attached yet.</p> : (
                            <ul style={{ paddingLeft: "1.5rem", marginBottom: "1rem" }}>
                                {domains.map((d: any) => (
                                    <li key={d._id}>
                                        <strong>{d.domainName}</strong>{" "}
                                        <Badge variant={d.status === "active" ? "default" : "secondary"}>
                                            {d.status}
                                        </Badge>
                                    </li>
                                ))}
                            </ul>
                        )}
                        <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.75rem" }}>
                            <Input
                                placeholder="Search domain e.g. mybusiness.com"
                                value={domainSearch}
                                onChange={(e) => setDomainSearch(e.target.value)}
                                style={{ flex: 1 }}
                            />
                            <Button size="sm" onClick={handleDomainSearch}>Search</Button>
                        </div>
                    </Card>

                    {/* AI Settings Card */}
                    {project.plan === "ai" && (
                        <Card padding="md">
                            <h3 style={{ marginTop: 0 }}>AI Settings</h3>
                            <p style={{ fontSize: "0.875rem", color: "#666" }}>Configure the AI model for your application.</p>

                            {aiAllowance === undefined ? <p>Loading allowance...</p> : aiAllowance === null ? <p>No active allowance period.</p> : (
                                <div style={{ marginBottom: "1rem" }}>
                                    <p><strong>Credits:</strong> {creditsUsed.toLocaleString()} / {creditsGranted.toLocaleString()}</p>
                                    <div style={{ background: "#e5e7eb", borderRadius: 999, height: 8, overflow: "hidden" }}>
                                        <div style={{
                                            background: creditsPercent > 90 ? "#ef4444" : creditsPercent > 70 ? "#f59e0b" : "#22c55e",
                                            width: `${creditsPercent}%`,
                                            height: "100%",
                                            borderRadius: 999,
                                            transition: "width 0.3s",
                                        }} />
                                    </div>
                                </div>
                            )}

                            <Label>Model</Label>
                            <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.25rem" }}>
                                <select
                                    value={selectedModel || currentModel}
                                    onChange={(e) => setSelectedModel(e.target.value)}
                                    style={{
                                        flex: 1, padding: "0.5rem", borderRadius: 6,
                                        border: "1px solid #d1d5db", fontSize: "0.875rem"
                                    }}
                                >
                                    {AI_MODELS.map(m => (
                                        <option key={m.value} value={m.value}>{m.label}</option>
                                    ))}
                                </select>
                                <Button size="sm" onClick={handleUpdateModel} disabled={savingModel}>
                                    {savingModel ? "Saving..." : modelSaved ? "✓ Saved" : "Update"}
                                </Button>
                            </div>
                        </Card>
                    )}

                    {/* Actions Card */}
                    <Card padding="md">
                        <h3 style={{ marginTop: 0 }}>Actions</h3>
                        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                            {project.status === "live" && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleRedeploy}
                                    disabled={redeploying}
                                >
                                    {redeploying ? "Redeploying..." : "🔄 Redeploy"}
                                </Button>
                            )}
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                    window.open(`https://${project.slug}.geenius.app`, "_blank")
                                }}
                            >
                                🌐 Open Site
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                    navigator.clipboard.writeText(`https://${project.slug}.geenius.app`)
                                }}
                            >
                                📋 Copy URL
                            </Button>
                        </div>
                    </Card>
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
    headerLeft: { display: "flex", alignItems: "center", gap: "0.75rem" },
    headerTitle: { fontSize: "1.25rem", fontWeight: 700, margin: 0, color: "#111" },
    backLink: { textDecoration: "none", color: "#6366f1", fontWeight: 500 },
    main: { maxWidth: 1200, margin: "0 auto", padding: "2rem" },
    grid: {
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "1.5rem",
    },
}
