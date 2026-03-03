import React from "react"
import { useConvexAuth } from "convex/react"
import { useQuery } from "convex/react"
import { useAuthActions } from "@convex-dev/auth/react"
import { api } from "../../../convex/_generated/api"
import { Button, Card, Loading } from "@geenius-ui/react-css"
import Login from "./pages/Login"
import Dashboard from "./pages/Dashboard"

function AppContent() {
  const { isAuthenticated, isLoading } = useConvexAuth()
  const user = useQuery(api.users.getMe)
  const { signOut } = useAuthActions()

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

  return <Dashboard />
}

export default function App() {
  return <AppContent />
}
