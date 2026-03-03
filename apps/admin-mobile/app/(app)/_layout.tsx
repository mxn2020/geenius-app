import { Tabs, Redirect } from "expo-router"
import { useConvexAuth, useQuery } from "convex/react"
import { View, Text, TouchableOpacity } from "react-native"
import { useAuthActions } from "@convex-dev/auth/react"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const getMeQuery = "users:getMe" as any

export default function AppLayout() {
  const { isAuthenticated, isLoading } = useConvexAuth()
  const user = useQuery(getMeQuery)
  const { signOut } = useAuthActions()

  if (isLoading || (isAuthenticated && user === undefined)) return null
  if (!isAuthenticated) return <Redirect href="/(auth)/login" />

  if (user && user.role !== "superAdmin") {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: 20 }}>
        <Text style={{ fontSize: 24, fontWeight: "bold", marginBottom: 10 }}>Unauthorized</Text>
        <Text style={{ textAlign: "center", marginBottom: 20 }}>You do not have administrative privileges to view this portal.</Text>
        <TouchableOpacity
          onPress={() => void signOut()}
          style={{ backgroundColor: "#e2e8f0", paddingVertical: 10, paddingHorizontal: 20, borderRadius: 8 }}
        >
          <Text>Sign Out</Text>
        </TouchableOpacity>
      </View>
    )
  }

  return (
    <Tabs>
      <Tabs.Screen name="index" options={{ title: "Projects" }} />
      <Tabs.Screen name="projects/new" options={{ title: "New Project" }} />
      <Tabs.Screen name="account" options={{ title: "Account" }} />
    </Tabs>
  )
}
