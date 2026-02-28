import { Tabs, Redirect } from "expo-router"
import { useConvexAuth } from "convex/react"

export default function AppLayout() {
  const { isAuthenticated, isLoading } = useConvexAuth()

  if (isLoading) return null
  if (!isAuthenticated) return <Redirect href="/(auth)/login" />

  return (
    <Tabs>
      <Tabs.Screen name="index" options={{ title: "Projects" }} />
      <Tabs.Screen name="projects/new" options={{ title: "New Project" }} />
      <Tabs.Screen name="account" options={{ title: "Account" }} />
    </Tabs>
  )
}
