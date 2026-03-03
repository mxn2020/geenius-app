import { useQuery } from "convex/react"
import {
    Card,
    Alert,
    Badge,
    Loading,
} from "@geenius-ui/react-css"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const getUsageQuery = "resellers:getUsageStats" as any
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const getProfileQuery = "resellers:getProfile" as any

function KpiCard({ label, value, extra }: { label: string; value: string; extra?: string }) {
    return (
        <Card padding="md">
            <p style={{ margin: 0, fontSize: "0.8rem", color: "#6b7280" }}>{label}</p>
            <p style={{ margin: "0.25rem 0 0", fontSize: "1.75rem", fontWeight: 700, color: "#111827" }}>{value}</p>
            {extra && <p style={{ margin: 0, fontSize: "0.75rem", color: "#6b7280" }}>{extra}</p>}
        </Card>
    )
}

export default function Billing() {
    const profile = useQuery(getProfileQuery) as any
    const usage = useQuery(getUsageQuery, {}) as any

    const perProjectFee = 5
    const estimatedBill = (usage?.deployedProjects ?? 0) * perProjectFee

    if (profile === undefined) {
        return <Loading>Loading billing...</Loading>
    }

    return (
        <div style={{ padding: "2rem", maxWidth: 900 }}>
            <h1 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "1.5rem" }}>Billing & Usage</h1>

            {!profile?.stripeConnectAccountId ? (
                <div style={{ marginBottom: "2rem" }}><Alert variant="warning">
                    <strong>💳 Connect Stripe</strong>
                    <p style={{ margin: "0.25rem 0 0", fontSize: "0.875rem" }}>
                        You need to connect your Stripe account to activate billing.
                        Go to <strong>Branding</strong> → enter your Stripe Connect Account ID.
                    </p>
                </Alert></div>
            ) : (
                <div style={{ marginBottom: "2rem" }}><Alert variant="default">
                    <span style={{ fontWeight: 600 }}>✅ Stripe Connected</span>
                    <span style={{ color: "#6b7280", fontSize: "0.875rem", marginLeft: "1rem" }}>
                        Account: {profile.stripeConnectAccountId}
                    </span>
                </Alert></div>
            )}

            <h2 style={{ fontSize: "1.125rem", fontWeight: 600, margin: "1.5rem 0 1rem" }}>Current Month Usage</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "1rem", marginBottom: "2rem" }}>
                <KpiCard label="Deployed Projects" value={String(usage?.deployedProjects ?? 0)} />
                <KpiCard label="Emails Sent" value={String(usage?.emailsSent ?? 0)} />
                <KpiCard label="AI Credits Used" value={String(usage?.aiCreditsUsed ?? 0)} />
                <KpiCard label="Revenue Collected" value={`€${((usage?.revenueCollectedCents ?? 0) / 100).toFixed(2)}`} />
                <KpiCard label="Platform Fee" value={`€${((usage?.platformFeeCents ?? 0) / 100).toFixed(2)}`} />
                <KpiCard
                    label="Est. Monthly Bill"
                    value={`€${estimatedBill.toFixed(2)}`}
                    extra={`(${usage?.deployedProjects ?? 0} × €${perProjectFee}/project)`}
                />
            </div>

            <Card padding="lg">
                <h3 style={{ marginTop: 0 }}>Pricing Structure</h3>
                <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "1rem" }}>
                    <thead>
                        <tr>
                            <th style={thStyle}>Item</th>
                            <th style={thStyle}>Price</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr><td style={tdStyle}>Monthly Platform Access</td><td style={tdStyle}>€49/mo</td></tr>
                        <tr><td style={tdStyle}>Per Deployed Project</td><td style={tdStyle}>€5/mo</td></tr>
                        <tr><td style={tdStyle}>Email Credits (first 1,000)</td><td style={tdStyle}>Included</td></tr>
                        <tr><td style={tdStyle}>Additional Emails</td><td style={tdStyle}>€0.001/email</td></tr>
                        <tr><td style={tdStyle}>AI Research Credits</td><td style={tdStyle}>100/mo included</td></tr>
                    </tbody>
                </table>
            </Card>
        </div>
    )
}

const thStyle: React.CSSProperties = {
    textAlign: "left", padding: "0.5rem 1rem", borderBottom: "2px solid #e5e7eb",
    fontSize: "0.75rem", fontWeight: 600, color: "#6b7280", textTransform: "uppercase",
}
const tdStyle: React.CSSProperties = {
    padding: "0.5rem 1rem", borderBottom: "1px solid #f3f4f6", fontSize: "0.875rem",
}
