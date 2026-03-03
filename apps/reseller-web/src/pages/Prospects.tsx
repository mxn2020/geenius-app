import { useState } from "react"
import { useQuery, useMutation } from "convex/react"
import {
    Button,
    Input,
    Label,
    Card,
    Badge,
    EmptyState,
    Loading,
} from "@geenius-ui/react"

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

const STATUS_VARIANTS: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
    new: "default",
    contacted: "outline",
    negotiating: "secondary",
    won: "default",
    lost: "destructive",
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
        <div style={{ padding: "2rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                <h1 style={{ fontSize: "1.5rem", fontWeight: 700, margin: 0 }}>Prospects</h1>
                <Button onClick={() => setShowAdd(!showAdd)}>+ Add Prospect</Button>
            </div>

            {/* Filter tabs */}
            <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.5rem", flexWrap: "wrap" }}>
                {[undefined, "new", "contacted", "negotiating", "won", "lost"].map((s) => (
                    <Button
                        key={s ?? "all"}
                        variant={filter === s ? "default" : "outline"}
                        size="sm"
                        onClick={() => setFilter(s)}
                        style={{ textTransform: "capitalize" }}
                    >
                        {s ?? "All"}
                    </Button>
                ))}
            </div>

            {/* Add form */}
            {showAdd && (
                <div style={{ marginBottom: "1.5rem" }}><Card padding="lg">
                    <form onSubmit={handleAdd} style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", alignItems: "flex-end" }}>
                        <div style={{ flex: "1 1 150px" }}>
                            <Label>Business Name</Label>
                            <Input placeholder="Business name" required value={form.businessName}
                                onChange={(e) => setForm({ ...form, businessName: e.target.value })} />
                        </div>
                        <div style={{ flex: "1 1 150px" }}>
                            <Label>Contact Name</Label>
                            <Input placeholder="Contact name" value={form.contactName}
                                onChange={(e) => setForm({ ...form, contactName: e.target.value })} />
                        </div>
                        <div style={{ flex: "1 1 150px" }}>
                            <Label>Email</Label>
                            <Input placeholder="Email" value={form.email}
                                onChange={(e) => setForm({ ...form, email: e.target.value })} />
                        </div>
                        <div style={{ flex: "1 1 150px" }}>
                            <Label>Location</Label>
                            <Input placeholder="Location" required value={form.location}
                                onChange={(e) => setForm({ ...form, location: e.target.value })} />
                        </div>
                        <div style={{ flex: "1 1 150px" }}>
                            <Label>Niche</Label>
                            <Input placeholder="Niche" required value={form.niche}
                                onChange={(e) => setForm({ ...form, niche: e.target.value })} />
                        </div>
                        <Button type="submit" size="sm">Save</Button>
                    </form>
                </Card></div>
            )}

            {/* Table */}
            {prospects === undefined ? (
                <Loading fullScreen message="Loading prospects..." showMessage />
            ) : prospects.length === 0 ? (
                <EmptyState title="No prospects found" description="Use AI Research or add manually." />
            ) : (
                <Card padding="none">
                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                        <thead>
                            <tr>
                                {["Business", "Contact", "Email", "Location", "Niche", "Status", "Actions"].map((h) => (
                                    <th key={h} style={thStyle}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {prospects.map((p) => (
                                <tr key={p._id}>
                                    <td style={tdStyle}>{p.businessName}</td>
                                    <td style={tdStyle}>{p.contactName || "—"}</td>
                                    <td style={tdStyle}>{p.email || "—"}</td>
                                    <td style={tdStyle}>{p.location}</td>
                                    <td style={tdStyle}>{p.niche}</td>
                                    <td style={tdStyle}>
                                        <Badge
                                            variant={STATUS_VARIANTS[p.status] || "default"}
                                            style={{ textTransform: "capitalize" }}
                                        >
                                            {p.status}
                                        </Badge>
                                    </td>
                                    <td style={tdStyle}>
                                        <select
                                            value={p.status}
                                            onChange={(e) => updateStatus({ id: p._id, status: e.target.value })}
                                            style={{ padding: "0.3rem", border: "1px solid #d1d5db", borderRadius: 4, fontSize: "0.8rem" }}
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
                </Card>
            )}
        </div>
    )
}

const thStyle: React.CSSProperties = {
    textAlign: "left", padding: "0.75rem 1rem", borderBottom: "2px solid #e5e7eb",
    fontSize: "0.75rem", fontWeight: 600, color: "#6b7280", textTransform: "uppercase",
}
const tdStyle: React.CSSProperties = {
    padding: "0.75rem 1rem", borderBottom: "1px solid #f3f4f6", fontSize: "0.875rem",
}
