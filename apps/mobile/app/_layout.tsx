import { Slot } from "expo-router"
import { ConvexAuthProvider } from "@convex-dev/auth/react"
import { ConvexReactClient } from "convex/react"
import { PostHogProvider } from "posthog-react-native"

const convex = new ConvexReactClient(process.env.EXPO_PUBLIC_CONVEX_URL ?? "")

export default function RootLayout() {
  return (
    <PostHogProvider
      apiKey={process.env.EXPO_PUBLIC_POSTHOG_KEY ?? ""}
      options={{ host: "https://app.posthog.com" }}
    >
      <ConvexAuthProvider client={convex}>
        <Slot />
      </ConvexAuthProvider>
    </PostHogProvider>
  )
}
