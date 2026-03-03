import { useState } from "react"
import { useQuery, useMutation } from "convex/react"
import {
    Button,
    Input,
    Textarea,
    Label,
    Card,
    Badge,
    EmptyState,
    Loading,
} from "@geenius-ui/react"

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

const STATUS_VARIANTS: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
    draft: "secondary",
    active: "default",
    paused: "outline",
    completed: "secondary",
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
        <div style={{ padding: "2rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
                <h1 style={{ fontSize: "1.5rem", fontWeight: 700, margin: 0 }}>Campaigns</h1>
                <Button onClick={() => setShowNew(!showNew)}>+ New Campaign</Button>
            </div>

            {showNew && (
                <div style={{ marginBottom: "2rem" }}><Card padding="lg">
                    <h3 style={{ margin: "0 0 1rem" }}>Create Campaign</h3>
                    <form onSubmit={handleCreate} style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                            <div style={{ flex: "1 1 200px" }}>
                                <Label>Campaign Name</Label>
                                <Input placeholder="Campaign name" required value={form.name}
                                    onChange={(e) => setForm({ ...form, name: e.target.value })} />
                            </div>
                            <div style={{ flex: "1 1 200px" }}>
                                <Label>Niche</Label>
                                <Input placeholder="e.g. lawyers" required value={form.niche}
                                    onChange={(e) => setForm({ ...form, niche: e.target.value })} />
                            </div>
                            <div style={{ flex: "1 1 200px" }}>
                                <Label>Location</Label>
                                <Input placeholder="e.g. Munich" required value={form.location}
                                    onChange={(e) => setForm({ ...form, location: e.target.value })} />
                            </div>
                        </div>
                        <div>
                            <Label>Compliance Market</Label>
                            <select
                                style={{ width: "100%", padding: "0.6rem 0.8rem", border: "1px solid #d1d5db", borderRadius: 6, fontSize: "0.875rem", fontFamily: "inherit" }}
                                value={form.complianceMarket}
                                onChange={(e) => setForm({ ...form, complianceMarket: e.target.value as any })}
                            >
                                <option value="EU">EU (GDPR)</option>
                                <option value="US">US (CAN-SPAM)</option>
                                <option value="UK">UK (PECR)</option>
                                <option value="DACH">DACH (UWG §7)</option>
                            </select>
                        </div>
                        <div>
                            <Label>Subject Template</Label>
                            <Input placeholder="Email subject template" required value={form.templateSubject}
                                onChange={(e) => setForm({ ...form, templateSubject: e.target.value })} />
                        </div>
                        <div>
                            <Label>Body Template</Label>
                            <Textarea
                                placeholder="Email body template (use {{prospect_name}}, {{company_name}})"
                                required value={form.templateBody}
                                onChange={(e) => setForm({ ...form, templateBody: e.target.value })}
                                style={{ minHeight: 100 }}
                            />
                        </div>
                        <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem" }}>
                            <Button variant="outline" type="button" onClick={() => setShowNew(false)}>Cancel</Button>
                            <Button type="submit">Create Draft</Button>
                        </div>
                    </form>
                </Card></div>
            )}

            {campaigns === undefined ? (
                <Loading fullScreen message="Loading campaigns..." showMessage />
            ) : campaigns.length === 0 ? (
                <EmptyState title="No campaigns yet" description="Create one to start outreach." />
            ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: "1.5rem" }}>
                    {campaigns.map((c: any) => (
                        <Card key={c._id} padding="md">
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                                <h3 style={{ margin: 0, fontSize: "1rem" }}>{c.name}</h3>
                                <Badge variant={STATUS_VARIANTS[c.status] || "default"} style={{ textTransform: "capitalize" }}>
                                    {c.status}
                                </Badge>
                            </div>
                            <p style={{ margin: "0.5rem 0", fontSize: "0.8rem", color: "#6b7280" }}>
                                📍 {c.location} • 🎯 {c.niche} • ⚖️ {c.complianceMarket}
                            </p>
                            <div style={{ display: "flex", gap: "1rem", fontSize: "0.8rem", color: "#374151", margin: "0.75rem 0" }}>
                                <span>📧 {c.totalSent ?? 0} sent</span>
                                <span>👀 {c.totalOpened ?? 0} opened</span>
                                <span>💬 {c.totalReplied ?? 0} replied</span>
                            </div>
                            <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.75rem" }}>
                                {c.status === "draft" && (
                                    <>
                                        <Button variant="outline" size="sm" onClick={() => update({ id: c._id, complianceAcknowledged: true })}>
                                            ✅ Acknowledge
                                        </Button>
                                        <Button size="sm" onClick={() => activate({ id: c._id })}>
                                            ▶️ Activate
                                        </Button>
                                    </>
                                )}
                                {c.status === "active" && (
                                    <Button variant="outline" size="sm" onClick={() => pause({ id: c._id })}>⏸ Pause</Button>
                                )}
                            </div>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    )
}
