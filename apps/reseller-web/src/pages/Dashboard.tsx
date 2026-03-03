import { useQuery } from "convex/react"
import {
  Card,
  Badge,
  Alert,
  Loading,
} from "@geenius-ui/react"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const getProfileQuery = "resellers:getProfile" as any
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const getUsageQuery = "resellers:getUsageStats" as any
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const listProspectsQuery = "prospects:list" as any
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const listCampaignsQuery = "campaigns:list" as any

function KpiCard({ label, value }: { label: string; value: string | number }) {
  return (
    <Card padding="md">
      <p style={{ margin: 0, fontSize: "0.8rem", color: "#6b7280" }}>{label}</p>
      <p style={{ margin: "0.5rem 0 0", fontSize: "2rem", fontWeight: 700, color: "#111827" }}>{value}</p>
    </Card>
  )
}

export default function Dashboard() {
  const profile = useQuery(getProfileQuery) as any
  const usage = useQuery(getUsageQuery, {}) as any
  const prospects = useQuery(listProspectsQuery, {}) as any[] | undefined
  const campaigns = useQuery(listCampaignsQuery) as any[] | undefined

  const wonProspects = prospects?.filter((p: any) => p.status === "won").length ?? 0
  const activeProspects = prospects?.filter((p: any) => p.status !== "lost").length ?? 0
  const activeCampaigns = campaigns?.filter((c: any) => c.status === "active").length ?? 0

  if (profile === undefined) {
    return <Loading fullScreen message="Loading dashboard..." showMessage />
  }

  return (
    <div style={{ padding: "2rem" }}>
      <h1 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "1.5rem" }}>Dashboard</h1>

      {!profile?.onboardingComplete && (
        <div style={{ marginBottom: "2rem" }}><Alert variant="warning">
          <strong>🚀 Complete your setup</strong>
          <p style={{ margin: "0.25rem 0 0", fontSize: "0.875rem" }}>
            Configure branding, Resend API key, and Stripe Connect to start prospecting.
          </p>
        </Alert></div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "1rem" }}>
        <KpiCard label="Active Prospects" value={activeProspects} />
        <KpiCard label="Won Prospects" value={wonProspects} />
        <KpiCard label="Active Campaigns" value={activeCampaigns} />
        <KpiCard label="Deployed Projects" value={usage?.deployedProjects ?? 0} />
        <KpiCard label="Emails Sent (this month)" value={usage?.emailsSent ?? 0} />
        <KpiCard label="Revenue (this month)" value={`€${((usage?.revenueCollectedCents ?? 0) / 100).toFixed(2)}`} />
      </div>
    </div>
  )
}
