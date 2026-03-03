import React, { useState } from "react"
import { useConvexAuth, useQuery } from "convex/react"
import { Button, Loading } from "@geenius-ui/react"
import Login from "./pages/Login"
import Dashboard from "./pages/Dashboard"
import Prospects from "./pages/Prospects"
import Campaigns from "./pages/Campaigns"
import Branding from "./pages/Branding"
import Billing from "./pages/Billing"
import Compliance from "./pages/Compliance"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const getMeQuery = "users:getMe" as any

type PageName = "dashboard" | "prospects" | "campaigns" | "branding" | "billing" | "compliance"

const NAV_ITEMS: { key: PageName; label: string; icon: string }[] = [
  { key: "dashboard", label: "Dashboard", icon: "📊" },
  { key: "prospects", label: "Prospects", icon: "🎯" },
  { key: "campaigns", label: "Campaigns", icon: "📧" },
  { key: "branding", label: "Branding", icon: "🎨" },
  { key: "billing", label: "Billing", icon: "💳" },
  { key: "compliance", label: "Compliance", icon: "⚖️" },
]

function ResellerPortal() {
  const me = useQuery(getMeQuery) as { role?: string; name?: string } | null | undefined
  const [page, setPage] = useState<PageName>("dashboard")

  if (me === undefined) {
    return <Loading fullScreen message="Loading..." showMessage />
  }

  if (!me || me.role !== "reseller") {
    return (
      <div style={styles.unauthorized}>
        <h2>🔒 Reseller Access Only</h2>
        <p>This portal is restricted to authorized resellers.</p>
        <p style={{ color: "#6b7280", fontSize: "0.875rem" }}>
          Contact support@geenius.app to apply for reseller access.
        </p>
      </div>
    )
  }

  const renderPage = () => {
    switch (page) {
      case "dashboard": return <Dashboard />
      case "prospects": return <Prospects />
      case "campaigns": return <Campaigns />
      case "branding": return <Branding />
      case "billing": return <Billing />
      case "compliance": return <Compliance />
    }
  }

  return (
    <div style={styles.layout}>
      <aside style={styles.sidebar}>
        <div style={styles.sidebarHeader}>
          <h2 style={styles.logo}>Geenius</h2>
          <span style={styles.badge}>Reseller</span>
        </div>
        <nav style={styles.nav}>
          {NAV_ITEMS.map((item) => (
            <button
              key={item.key}
              onClick={() => setPage(item.key)}
              style={{
                ...styles.navItem,
                ...(page === item.key ? styles.navItemActive : {}),
              }}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
        <div style={styles.sidebarFooter}>
          <p style={{ margin: 0, fontSize: "0.75rem", color: "#9ca3af" }}>
            Welcome, {me.name || "Reseller"}
          </p>
        </div>
      </aside>
      <main style={styles.main}>{renderPage()}</main>
    </div>
  )
}

function AppContent() {
  const { isAuthenticated, isLoading } = useConvexAuth()
  if (isLoading) {
    return <Loading fullScreen message="Loading..." showMessage />
  }
  return isAuthenticated ? <ResellerPortal /> : <Login />
}

export default function App() {
  return <AppContent />
}

const styles: Record<string, React.CSSProperties> = {
  unauthorized: {
    display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
    minHeight: "100vh", fontFamily: "system-ui, sans-serif", textAlign: "center",
  },
  layout: { display: "flex", minHeight: "100vh", fontFamily: "system-ui, sans-serif" },
  sidebar: {
    width: 240, backgroundColor: "#111827", color: "#fff", display: "flex",
    flexDirection: "column", padding: "1rem 0",
  },
  sidebarHeader: {
    padding: "0 1.5rem 1rem", borderBottom: "1px solid #1f2937",
    display: "flex", alignItems: "center", gap: "0.5rem",
  },
  logo: { margin: 0, fontSize: "1.25rem", fontWeight: 700 },
  badge: {
    fontSize: "0.625rem", backgroundColor: "#6366f1", padding: "0.15rem 0.5rem",
    borderRadius: 12, fontWeight: 600, textTransform: "uppercase" as const,
  },
  nav: { flex: 1, padding: "1rem 0.5rem", display: "flex", flexDirection: "column", gap: "0.25rem" },
  navItem: {
    background: "none", border: "none", color: "#9ca3af", padding: "0.75rem 1rem",
    borderRadius: 8, cursor: "pointer", fontSize: "0.875rem", textAlign: "left" as const,
    display: "flex", gap: "0.75rem", alignItems: "center", transition: "all 0.15s",
  },
  navItemActive: { backgroundColor: "#1f2937", color: "#fff" },
  sidebarFooter: { padding: "1rem 1.5rem", borderTop: "1px solid #1f2937" },
  main: { flex: 1, backgroundColor: "#f9fafb", overflow: "auto" },
}
