import React, { useState } from "react"
import { useConvexAuth } from "convex/react"
import { useQuery } from "convex/react"
import { useAuthActions } from "@convex-dev/auth/react"
import { api } from "../../../../packages/backend/convex/_generated/api"
import { Button, Card, Loading } from "@geenius-ui/react-css"
import Login from "./pages/Login"
import Dashboard from "./pages/Dashboard"
import Users from "./pages/Users"
import Jobs from "./pages/Jobs"
import Resellers from "./pages/Resellers"

type Tab = "dashboard" | "users" | "jobs" | "resellers"

const TABS: { key: Tab; label: string; icon: string }[] = [
  { key: "dashboard", label: "Dashboard", icon: "📊" },
  { key: "users", label: "Users", icon: "👥" },
  { key: "jobs", label: "Jobs", icon: "⚙️" },
  { key: "resellers", label: "Resellers", icon: "🏢" },
]

function AppContent() {
  const { isAuthenticated, isLoading } = useConvexAuth()
  const user = useQuery(api.users.getMe)
  const { signOut } = useAuthActions()
  const [activeTab, setActiveTab] = useState<Tab>("dashboard")

  if (isLoading || (isAuthenticated && user === undefined)) {
    return <Loading>Loading...</Loading>
  }

  if (!isAuthenticated) {
    return <Login />
  }

  if (user && user.role !== "superAdmin") {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", flexDirection: "column" as const }}>
        <Card padding="lg">
          <h1 style={{ fontSize: "1.5rem", marginBottom: "0.5rem", textAlign: "center" }}>🔒 Unauthorized</h1>
          <p style={{ color: "#6b7280", textAlign: "center", marginBottom: "1.5rem" }}>
            You do not have administrative privileges to view this portal.
          </p>
          <Button variant="outline" onClick={() => signOut()} style={{ width: "100%" }}>
            Sign Out
          </Button>
        </Card>
      </div>
    )
  }

  // Render tab content
  const renderContent = () => {
    switch (activeTab) {
      case "dashboard": return <Dashboard />
      case "users": return <Users />
      case "jobs": return <Jobs />
      case "resellers": return <Resellers />
      default: return <Dashboard />
    }
  }

  // If we're on the dashboard, render it directly (it has its own header)
  if (activeTab === "dashboard") {
    return (
      <div>
        <nav style={styles.nav}>
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{
                ...styles.navButton,
                ...(activeTab === tab.key ? styles.navButtonActive : {}),
              }}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </nav>
        <Dashboard />
      </div>
    )
  }

  // Other tabs get a standard layout
  return (
    <div style={styles.container}>
      <nav style={styles.nav}>
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            style={{
              ...styles.navButton,
              ...(activeTab === tab.key ? styles.navButtonActive : {}),
            }}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
        <div style={{ flex: 1 }} />
        <Button variant="outline" size="sm" onClick={() => signOut()}>
          Sign out
        </Button>
      </nav>
      <main style={styles.main}>
        {renderContent()}
      </main>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  container: { minHeight: "100vh", backgroundColor: "#f8f8f8", fontFamily: "system-ui, sans-serif" },
  nav: {
    display: "flex",
    alignItems: "center",
    gap: "0.25rem",
    padding: "0.5rem 2rem",
    backgroundColor: "#fff",
    borderBottom: "1px solid #e0e0e0",
  },
  navButton: {
    border: "none",
    background: "none",
    padding: "0.5rem 1rem",
    borderRadius: 6,
    cursor: "pointer",
    fontSize: "0.875rem",
    fontWeight: 500,
    color: "#6b7280",
    transition: "all 0.15s",
  },
  navButtonActive: {
    backgroundColor: "#eef2ff",
    color: "#6366f1",
    fontWeight: 600,
  },
  main: { maxWidth: 1200, margin: "0 auto", padding: "2rem" },
}

export default function App() {
  return <AppContent />
}
