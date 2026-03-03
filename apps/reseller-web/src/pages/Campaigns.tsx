import { useState } from "react"
import { useQuery, useMutation } from "convex/react"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const listQuery = "campaigns:list" as any
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const createMutation = "campaigns:create" as any
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const activateMutation = "campaigns:activate" as any
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const pauseMutation = "campaigns:pause" as any
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const updateMutation = "campaigns:update" as any

const STATUS_COLORS: Record<string, string> = {
    draft: "#6b7280", active: "#22c55e", paused: "#f59e0b", completed: "#3b82f6",
}

export default function Campaigns() {
    const campaigns = useQuery(listQuery) as any[] | undefined
    const create = useMutation(createMutation)
    const activate = useMutation(activateMutation)
    const pause = useMutation(pauseMutation)
    const update = useMutation(updateMutation)
    const [showNew, setShowNew] = useState(false)
    const [form, setForm] = useState({
        name: "", niche: "", location: "",
        complianceMarket: "EU" as "EU" | "US" | "UK" | "DACH",
        templateSubject: "", templateBody: "",
    })

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault()
        await create(form)
        setForm({ name: "", niche: "", location: "", complianceMarket: "EU", templateSubject: "", templateBody: "" })
        setShowNew(false)
    }

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h1 style={styles.title}>Campaigns</h1>
                <button style={styles.createBtn} onClick={() => setShowNew(!showNew)}>+ New Campaign</button>
            </div>

            {showNew && (
                <form onSubmit={handleCreate} style={styles.form}>
                    <h3 style={{ margin: "0 0 1rem" }}>Create Campaign</h3>
                    <div style={styles.row}>
                        <input style={styles.input} placeholder="Campaign name" required value={form.name}
                            onChange={(e) => setForm({ ...form, name: e.target.value })} />
                        <input style={styles.input} placeholder="Niche (e.g. lawyers)" required value={form.niche}
                            onChange={(e) => setForm({ ...form, niche: e.target.value })} />
                        <input style={styles.input} placeholder="Location (e.g. Munich)" required value={form.location}
                            onChange={(e) => setForm({ ...form, location: e.target.value })} />
                    </div>
                    <div style={styles.row}>
                        <select style={styles.input} value={form.complianceMarket}
                            onChange={(e) => setForm({ ...form, complianceMarket: e.target.value as any })}>
                            <option value="EU">EU (GDPR)</option>
                            <option value="US">US (CAN-SPAM)</option>
                            <option value="UK">UK (PECR)</option>
                            <option value="DACH">DACH (UWG §7)</option>
                        </select>
                    </div>
                    <input style={styles.input} placeholder="Email subject template" required value={form.templateSubject}
                        onChange={(e) => setForm({ ...form, templateSubject: e.target.value })} />
                    <textarea style={{ ...styles.input, minHeight: 100 }} placeholder="Email body template (use {{prospect_name}}, {{company_name}})"
                        required value={form.templateBody}
                        onChange={(e) => setForm({ ...form, templateBody: e.target.value })} />
                    <div style={styles.actions}>
                        <button type="button" style={styles.cancelBtn} onClick={() => setShowNew(false)}>Cancel</button>
                        <button type="submit" style={styles.submitBtn}>Create Draft</button>
                    </div>
                </form>
            )}

            {campaigns === undefined ? (
                <p>Loading...</p>
            ) : campaigns.length === 0 ? (
                <p style={styles.empty}>No campaigns yet. Create one to start outreach.</p>
            ) : (
                <div style={styles.grid}>
                    {campaigns.map((c: any) => (
                        <div key={c._id} style={styles.card}>
                            <div style={styles.cardTop}>
                                <h3 style={{ margin: 0, fontSize: "1rem" }}>{c.name}</h3>
                                <span style={{ color: STATUS_COLORS[c.status], fontWeight: 600, fontSize: "0.8rem", textTransform: "capitalize" as const }}>
                                    {c.status}
                                </span>
                            </div>
                            <p style={styles.meta}>📍 {c.location} • 🎯 {c.niche} • ⚖️ {c.complianceMarket}</p>
                            <div style={styles.stats}>
                                <span>📧 {c.totalSent ?? 0} sent</span>
                                <span>👀 {c.totalOpened ?? 0} opened</span>
                                <span>💬 {c.totalReplied ?? 0} replied</span>
                            </div>
                            <div style={styles.cardActions}>
                                {c.status === "draft" && (
                                    <>
                                        <button style={styles.ackBtn} onClick={() => update({ id: c._id, complianceAcknowledged: true })}>
                                            ✅ Acknowledge Compliance
                                        </button>
                                        <button style={styles.activateBtn} onClick={() => activate({ id: c._id })}>
                                            ▶️ Activate
                                        </button>
                                    </>
                                )}
                                {c.status === "active" && (
                                    <button style={styles.pauseBtn} onClick={() => pause({ id: c._id })}>⏸ Pause</button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

const styles: Record<string, React.CSSProperties> = {
    container: { padding: "2rem" },
    header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" },
    title: { fontSize: "1.5rem", fontWeight: 700, margin: 0 },
    createBtn: { backgroundColor: "#6366f1", color: "#fff", border: "none", padding: "0.6rem 1.2rem", borderRadius: 8, fontWeight: 600, cursor: "pointer" },
    form: { backgroundColor: "#fff", padding: "1.5rem", borderRadius: 12, marginBottom: "2rem", display: "flex", flexDirection: "column" as const, gap: "0.75rem" },
    row: { display: "flex", gap: "0.5rem", flexWrap: "wrap" as const },
    input: { padding: "0.6rem 0.8rem", border: "1px solid #d1d5db", borderRadius: 6, fontSize: "0.875rem", flex: "1 1 200px", fontFamily: "inherit" },
    actions: { display: "flex", justifyContent: "flex-end", gap: "0.75rem" },
    cancelBtn: { padding: "0.5rem 1rem", border: "1px solid #d1d5db", borderRadius: 6, cursor: "pointer", background: "#fff" },
    submitBtn: { padding: "0.5rem 1rem", backgroundColor: "#6366f1", color: "#fff", border: "none", borderRadius: 6, fontWeight: 600, cursor: "pointer" },
    empty: { color: "#6b7280", fontStyle: "italic", textAlign: "center", padding: "3rem" },
    grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: "1.5rem" },
    card: { backgroundColor: "#fff", borderRadius: 12, padding: "1.5rem", boxShadow: "0 1px 3px rgba(0,0,0,0.08)" },
    cardTop: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" },
    meta: { margin: "0.5rem 0", fontSize: "0.8rem", color: "#6b7280" },
    stats: { display: "flex", gap: "1rem", fontSize: "0.8rem", color: "#374151", margin: "0.75rem 0" },
    cardActions: { display: "flex", gap: "0.5rem", marginTop: "0.75rem" },
    ackBtn: { padding: "0.4rem 0.8rem", border: "1px solid #d1d5db", borderRadius: 6, cursor: "pointer", background: "#fff", fontSize: "0.8rem" },
    activateBtn: { padding: "0.4rem 0.8rem", backgroundColor: "#22c55e", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer", fontSize: "0.8rem" },
    pauseBtn: { padding: "0.4rem 0.8rem", backgroundColor: "#f59e0b", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer", fontSize: "0.8rem" },
}
