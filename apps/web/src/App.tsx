import React from "react"
import { useConvexAuth } from "convex/react"
import Login from "./pages/Login"
import Dashboard from "./pages/Dashboard"

function AppContent() {
  const { isAuthenticated, isLoading } = useConvexAuth()

  if (isLoading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>
        <p>Loading...</p>
      </div>
    )
  }

  return isAuthenticated ? <Dashboard /> : <Login />
}

export default function App() {
  return <AppContent />
}
