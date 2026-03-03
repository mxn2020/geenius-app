import { ConvexReactClient } from "convex/react"
import { ConvexAuthProvider } from "@convex-dev/auth/react"
import type { ReactNode } from "react"
import { Text, View } from "react-native"

const convexUrl = process.env.EXPO_PUBLIC_CONVEX_URL
const convex = convexUrl ? new ConvexReactClient(convexUrl) : null

export function ConvexProvider({ children }: { children: ReactNode }) {
  if (!convex) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 20 }}>
        <Text style={{ fontSize: 20, fontWeight: "bold" }}>Convex is not configured</Text>
        <Text style={{ textAlign: "center", marginTop: 10 }}>
          Please ensure EXPO_PUBLIC_CONVEX_URL is set in your environment.
        </Text>
      </View>
    )
  }
  return <ConvexAuthProvider client={convex}>{children}</ConvexAuthProvider>
}
