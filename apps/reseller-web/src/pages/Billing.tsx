import { useQuery } from "convex/react"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const getUsageQuery = "resellers:getUsageStats" as any
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const getProfileQuery = "resellers:getProfile" as any

export default function Billing() {
    const profile = useQuery(getProfileQuery) as any
    const usage = useQuery(getUsageQuery, {}) as any

    const perProjectFee = 5 // EUR per deployed project
    const estimatedBill = (usage?.deployedProjects ?? 0) * perProjectFee

    return (
        <div style={styles.container}>
            <h1 style={styles.title}>Billing & Usage</h1>

            {!profile?.stripeConnectAccountId ? (
                <div style={styles.setup}>
                    <h3>💳 Connect Stripe</h3>
                    <p>You need to connect your Stripe account to activate billing for your prospects.</p>
                    <p style={{ fontSize: "0.875rem", color: "#6b7280" }}>
                        Go to <strong>Branding</strong> → enter your Stripe Connect Account ID.
                    </p>
                </div>
            ) : (
                <div style={styles.connected}>
                    <span style={{ color: "#22c55e", fontWeight: 600 }}>✅ Stripe Connected</span>
                    <span style={{ color: "#6b7280", fontSize: "0.875rem" }}>
                        Account: {profile.stripeConnectAccountId}
                    </span>
                </div>
            )}

            <h2 style={styles.sectionTitle}>Current Month Usage</h2>
            <div style={styles.grid}>
                <div style={styles.card}>
                    <p style={styles.label}>Deployed Projects</p>
                    <p style={styles.value}>{usage?.deployedProjects ?? 0}</p>
                </div>
                <div style={styles.card}>
                    <p style={styles.label}>Emails Sent</p>
                    <p style={styles.value}>{usage?.emailsSent ?? 0}</p>
                </div>
                <div style={styles.card}>
                    <p style={styles.label}>AI Credits Used</p>
                    <p style={styles.value}>{usage?.aiCreditsUsed ?? 0}</p>
                </div>
                <div style={styles.card}>
                    <p style={styles.label}>Revenue Collected</p>
                    <p style={styles.value}>€{((usage?.revenueCollectedCents ?? 0) / 100).toFixed(2)}</p>
                </div>
                <div style={styles.card}>
                    <p style={styles.label}>Platform Fee</p>
                    <p style={styles.value}>€{((usage?.platformFeeCents ?? 0) / 100).toFixed(2)}</p>
                </div>
                <div style={styles.card}>
                    <p style={styles.label}>Est. Monthly Bill</p>
                    <p style={styles.value}>€{estimatedBill.toFixed(2)}</p>
                    <p style={{ margin: 0, fontSize: "0.75rem", color: "#6b7280" }}>
                        ({usage?.deployedProjects ?? 0} × €{perProjectFee}/project)
                    </p>
                </div>
            </div>

            <div style={styles.pricing}>
                <h3>Pricing Structure</h3>
                <table style={styles.table}>
                    <thead>
                        <tr>
                            <th style={styles.th}>Item</th>
                            <th style={styles.th}>Price</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr><td style={styles.td}>Monthly Platform Access</td><td style={styles.td}>€49/mo</td></tr>
                        <tr><td style={styles.td}>Per Deployed Project</td><td style={styles.td}>€5/mo</td></tr>
                        <tr><td style={styles.td}>Email Credits (first 1,000)</td><td style={styles.td}>Included</td></tr>
                        <tr><td style={styles.td}>Additional Emails</td><td style={styles.td}>€0.001/email</td></tr>
                        <tr><td style={styles.td}>AI Research Credits</td><td style={styles.td}>100/mo included</td></tr>
                    </tbody>
                </table>
            </div>
        </div>
    )
}

const styles: Record<string, React.CSSProperties> = {
    container: { padding: "2rem", maxWidth: 900 },
    title: { fontSize: "1.5rem", fontWeight: 700, marginBottom: "1.5rem" },
    setup: { backgroundColor: "#fef3c7", padding: "1.5rem", borderRadius: 12, marginBottom: "2rem", border: "1px solid #f59e0b" },
    connected: { backgroundColor: "#f0fdf4", padding: "1rem 1.5rem", borderRadius: 12, marginBottom: "2rem", display: "flex", justifyContent: "space-between", alignItems: "center", border: "1px solid #22c55e" },
    sectionTitle: { fontSize: "1.125rem", fontWeight: 600, margin: "1.5rem 0 1rem" },
    grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "1rem", marginBottom: "2rem" },
    card: { backgroundColor: "#fff", padding: "1.25rem", borderRadius: 12, boxShadow: "0 1px 3px rgba(0,0,0,0.08)" },
    label: { margin: 0, fontSize: "0.8rem", color: "#6b7280" },
    value: { margin: "0.25rem 0 0", fontSize: "1.75rem", fontWeight: 700, color: "#111827" },
    pricing: { backgroundColor: "#fff", padding: "1.5rem", borderRadius: 12, boxShadow: "0 1px 3px rgba(0,0,0,0.08)" },
    table: { width: "100%", borderCollapse: "collapse" as const, marginTop: "1rem" },
    th: { textAlign: "left" as const, padding: "0.5rem 1rem", borderBottom: "2px solid #e5e7eb", fontSize: "0.75rem", fontWeight: 600, color: "#6b7280", textTransform: "uppercase" as const },
    td: { padding: "0.5rem 1rem", borderBottom: "1px solid #f3f4f6", fontSize: "0.875rem" },
}
