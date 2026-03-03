import React from "react"
import { useConvexAuth } from "convex/react"
import { useQuery } from "convex/react"
import { useAuthActions } from "@convex-dev/auth/react"
import { api } from "../../../convex/_generated/api"
import Login from "./pages/Login"
import Dashboard from "./pages/Dashboard"

function AppContent() {
  const { isAuthenticated, isLoading } = useConvexAuth()
  const user = useQuery(api.users.getMe)
  const { signOut } = useAuthActions()

  if (isLoading || (isAuthenticated && user === undefined)) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>
        <p>Loading...</p>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Login />
  }

  if (user && user.role !== "superAdmin") {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", flexDirection: "column" }}>
        <h1 style={{ fontSize: "2rem", marginBottom: "1rem" }}>Unauthorized</h1>
        <p>You do not have administrative privileges to view this portal.</p>
        <button
          onClick={void signOut}
          style={{ marginTop: "1rem", padding: "0.5rem 1rem", backgroundColor: "#e2e8f0", borderRadius: "0.25rem", cursor: "pointer" }}
        >
          Sign Out
        </button>
      </div>
    )
  }

  return <Dashboard />
}

export default function App() {
  return <AppContent />
}
