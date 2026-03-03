import { useState } from "react"
import { useQuery, useMutation } from "convex/react"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const listQuery = "prospects:list" as any
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const createMutation = "prospects:create" as any
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const updateStatusMutation = "prospects:updateStatus" as any

type Prospect = {
    _id: string
    businessName: string
    contactName?: string
    email?: string
    phone?: string
    location: string
    niche: string
    status: string
    aiSummary?: string
    createdAt: number
}

const STATUS_COLORS: Record<string, string> = {
    new: "#3b82f6",
    contacted: "#f59e0b",
    negotiating: "#8b5cf6",
    won: "#22c55e",
    lost: "#ef4444",
}

export default function Prospects() {
    const [filter, setFilter] = useState<string | undefined>()
    const [showAdd, setShowAdd] = useState(false)
    const [form, setForm] = useState({ businessName: "", location: "", niche: "", email: "", contactName: "" })

    const prospects = useQuery(listQuery, filter ? { status: filter } : {}) as Prospect[] | undefined
    const create = useMutation(createMutation)
    const updateStatus = useMutation(updateStatusMutation)

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault()
        await create(form)
        setForm({ businessName: "", location: "", niche: "", email: "", contactName: "" })
        setShowAdd(false)
    }

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h1 style={styles.title}>Prospects</h1>
                <button style={styles.addBtn} onClick={() => setShowAdd(!showAdd)}>+ Add Prospect</button>
            </div>

            {/* Filter tabs */}
            <div style={styles.filters}>
                {[undefined, "new", "contacted", "negotiating", "won", "lost"].map((s) => (
                    <button
                        key={s ?? "all"}
                        style={{ ...styles.filterBtn, ...(filter === s ? styles.filterActive : {}) }}
                        onClick={() => setFilter(s)}
                    >
                        {s ?? "All"}
                    </button>
                ))}
            </div>

            {/* Add form */}
            {showAdd && (
                <form onSubmit={handleAdd} style={styles.form}>
                    <input style={styles.input} placeholder="Business name" required value={form.businessName}
                        onChange={(e) => setForm({ ...form, businessName: e.target.value })} />
                    <input style={styles.input} placeholder="Contact name" value={form.contactName}
                        onChange={(e) => setForm({ ...form, contactName: e.target.value })} />
                    <input style={styles.input} placeholder="Email" value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })} />
                    <input style={styles.input} placeholder="Location" required value={form.location}
                        onChange={(e) => setForm({ ...form, location: e.target.value })} />
                    <input style={styles.input} placeholder="Niche" required value={form.niche}
                        onChange={(e) => setForm({ ...form, niche: e.target.value })} />
                    <button type="submit" style={styles.submitBtn}>Save Prospect</button>
                </form>
            )}

            {/* Table */}
            {prospects === undefined ? (
                <p>Loading...</p>
            ) : prospects.length === 0 ? (
                <p style={styles.empty}>No prospects found. Use AI Research or add manually.</p>
            ) : (
                <table style={styles.table}>
                    <thead>
                        <tr>
                            <th style={styles.th}>Business</th>
                            <th style={styles.th}>Contact</th>
                            <th style={styles.th}>Email</th>
                            <th style={styles.th}>Location</th>
                            <th style={styles.th}>Niche</th>
                            <th style={styles.th}>Status</th>
                            <th style={styles.th}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {prospects.map((p) => (
                            <tr key={p._id}>
                                <td style={styles.td}>{p.businessName}</td>
                                <td style={styles.td}>{p.contactName || "—"}</td>
                                <td style={styles.td}>{p.email || "—"}</td>
                                <td style={styles.td}>{p.location}</td>
                                <td style={styles.td}>{p.niche}</td>
                                <td style={styles.td}>
                                    <span style={{
                                        color: STATUS_COLORS[p.status] ?? "#6b7280",
                                        fontWeight: 600, fontSize: "0.8rem", textTransform: "capitalize" as const,
                                    }}>
                                        {p.status}
                                    </span>
                                </td>
                                <td style={styles.td}>
                                    <select
                                        value={p.status}
                                        onChange={(e) => updateStatus({ id: p._id, status: e.target.value })}
                                        style={styles.select}
                                    >
                                        <option value="new">New</option>
                                        <option value="contacted">Contacted</option>
                                        <option value="negotiating">Negotiating</option>
                                        <option value="won">Won</option>
                                        <option value="lost">Lost</option>
                                    </select>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    )
}

const styles: Record<string, React.CSSProperties> = {
    container: { padding: "2rem" },
    header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" },
    title: { fontSize: "1.5rem", fontWeight: 700, margin: 0 },
    addBtn: {
        backgroundColor: "#6366f1", color: "#fff", border: "none", padding: "0.6rem 1.2rem",
        borderRadius: 8, fontWeight: 600, cursor: "pointer",
    },
    filters: { display: "flex", gap: "0.5rem", marginBottom: "1.5rem" },
    filterBtn: {
        background: "none", border: "1px solid #d1d5db", padding: "0.4rem 0.8rem",
        borderRadius: 6, cursor: "pointer", fontSize: "0.8rem", textTransform: "capitalize" as const,
    },
    filterActive: { backgroundColor: "#6366f1", color: "#fff", borderColor: "#6366f1" },
    form: {
        display: "flex", gap: "0.5rem", marginBottom: "1.5rem", flexWrap: "wrap" as const,
        backgroundColor: "#fff", padding: "1rem", borderRadius: 12,
    },
    input: {
        padding: "0.5rem 0.75rem", border: "1px solid #d1d5db", borderRadius: 6,
        fontSize: "0.875rem", flex: "1 1 150px",
    },
    submitBtn: {
        backgroundColor: "#22c55e", color: "#fff", border: "none", padding: "0.5rem 1rem",
        borderRadius: 6, fontWeight: 600, cursor: "pointer",
    },
    empty: { color: "#6b7280", fontStyle: "italic", textAlign: "center", padding: "3rem" },
    table: {
        width: "100%", borderCollapse: "collapse" as const, backgroundColor: "#fff",
        borderRadius: 12, overflow: "hidden",
    },
    th: {
        textAlign: "left" as const, padding: "0.75rem 1rem", borderBottom: "2px solid #e5e7eb",
        fontSize: "0.75rem", fontWeight: 600, color: "#6b7280", textTransform: "uppercase" as const,
    },
    td: { padding: "0.75rem 1rem", borderBottom: "1px solid #f3f4f6", fontSize: "0.875rem" },
    select: { padding: "0.3rem", border: "1px solid #d1d5db", borderRadius: 4, fontSize: "0.8rem" },
}
