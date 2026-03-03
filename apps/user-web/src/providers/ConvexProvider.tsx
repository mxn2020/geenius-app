import { ConvexReactClient } from "convex/react"
import { ConvexAuthProvider } from "@convex-dev/auth/react"
import type { ReactNode } from "react"

const convexUrl = import.meta.env.VITE_CONVEX_URL
const convex = convexUrl ? new ConvexReactClient(convexUrl) : null

export function ConvexProvider({ children }: { children: ReactNode }) {
  if (!convex) {
    return (
      <div style={{ padding: "2rem", textAlign: "center", fontFamily: "sans-serif" }}>
        <h1>Convex is not configured</h1>
        <p>Please ensure VITE_CONVEX_URL is set in your .env file.</p>
      </div>
    )
  }
  return (
    <ConvexAuthProvider client={convex}>
      {children}
    </ConvexAuthProvider>
  )
}
