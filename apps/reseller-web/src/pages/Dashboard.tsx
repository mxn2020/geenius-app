import { useQuery } from "convex/react"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const getProfileQuery = "resellers:getProfile" as any
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const getUsageQuery = "resellers:getUsageStats" as any
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const listProspectsQuery = "prospects:list" as any
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const listCampaignsQuery = "campaigns:list" as any

export default function Dashboard() {
  const profile = useQuery(getProfileQuery) as any
  const usage = useQuery(getUsageQuery, {}) as any
  const prospects = useQuery(listProspectsQuery, {}) as any[] | undefined
  const campaigns = useQuery(listCampaignsQuery) as any[] | undefined

  const wonProspects = prospects?.filter((p: any) => p.status === "won").length ?? 0
  const activeProspects = prospects?.filter((p: any) => p.status !== "lost").length ?? 0
  const activeCampaigns = campaigns?.filter((c: any) => c.status === "active").length ?? 0

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Dashboard</h1>

      {!profile?.onboardingComplete && (
        <div style={styles.onboardingBanner}>
          <span>🚀</span>
          <div>
            <strong>Complete your setup</strong>
            <p style={{ margin: 0, fontSize: "0.875rem", color: "#92400e" }}>
              Configure branding, Resend API key, and Stripe Connect to start prospecting.
            </p>
          </div>
        </div>
      )}

      <div style={styles.grid}>
        <div style={styles.card}>
          <p style={styles.cardLabel}>Active Prospects</p>
          <p style={styles.cardValue}>{activeProspects}</p>
        </div>
        <div style={styles.card}>
          <p style={styles.cardLabel}>Won Prospects</p>
          <p style={styles.cardValue}>{wonProspects}</p>
        </div>
        <div style={styles.card}>
          <p style={styles.cardLabel}>Active Campaigns</p>
          <p style={styles.cardValue}>{activeCampaigns}</p>
        </div>
        <div style={styles.card}>
          <p style={styles.cardLabel}>Deployed Projects</p>
          <p style={styles.cardValue}>{usage?.deployedProjects ?? 0}</p>
        </div>
        <div style={styles.card}>
          <p style={styles.cardLabel}>Emails Sent (this month)</p>
          <p style={styles.cardValue}>{usage?.emailsSent ?? 0}</p>
        </div>
        <div style={styles.card}>
          <p style={styles.cardLabel}>Revenue (this month)</p>
          <p style={styles.cardValue}>€{((usage?.revenueCollectedCents ?? 0) / 100).toFixed(2)}</p>
        </div>
      </div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  container: { padding: "2rem" },
  title: { fontSize: "1.5rem", fontWeight: 700, marginBottom: "1.5rem" },
  onboardingBanner: {
    backgroundColor: "#fef3c7", border: "1px solid #f59e0b", borderRadius: 12,
    padding: "1rem 1.5rem", marginBottom: "2rem", display: "flex", gap: "1rem", alignItems: "center",
  },
  grid: {
    display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "1rem",
  },
  card: {
    backgroundColor: "#fff", borderRadius: 12, padding: "1.5rem",
    boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
  },
  cardLabel: { margin: 0, fontSize: "0.875rem", color: "#6b7280" },
  cardValue: { margin: "0.5rem 0 0", fontSize: "2rem", fontWeight: 700, color: "#111827" },
}
