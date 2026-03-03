import { Slot } from "expo-router"
import { ConvexProvider } from "../src/providers/ConvexProvider"
import { PostHogProvider } from "posthog-react-native"
import { MissingConfigUI } from "../src/components/MissingConfigUI"

export default function RootLayout() {
  const requiredConfigs = [
    {
      key: "EXPO_PUBLIC_CONVEX_URL",
      description: "The URL of your Convex development environment.",
      isMissing: !process.env.EXPO_PUBLIC_CONVEX_URL,
      isRequired: true
    },
    {
      key: "EXPO_PUBLIC_POSTHOG_KEY",
      description: "Your PostHog analytics tracking key. (Optional)",
      isMissing: !process.env.EXPO_PUBLIC_POSTHOG_KEY || process.env.EXPO_PUBLIC_POSTHOG_KEY.startsWith("your-"),
      isRequired: false
    },
    {
      key: "EXPO_PUBLIC_API_URL",
      description: "The backend orchestration API URL.",
      isMissing: !process.env.EXPO_PUBLIC_API_URL,
      isRequired: true
    }
  ]

  const missingRequired = requiredConfigs.filter(c => c.isMissing && c.isRequired)

  if (missingRequired.length > 0) {
    return <MissingConfigUI configs={requiredConfigs} />
  }

  const posthogKey = process.env.EXPO_PUBLIC_POSTHOG_KEY
  const hasValidPosthog = posthogKey && !posthogKey.startsWith("your-")

  const AppContent = (
    <ConvexProvider>
      <Slot />
    </ConvexProvider>
  )

  if (!hasValidPosthog) {
    return AppContent
  }

  return (
    <PostHogProvider
      apiKey={process.env.EXPO_PUBLIC_POSTHOG_KEY ?? ""}
      options={{ host: "https://app.posthog.com" }}
    >
      <ConvexProvider>
        <Slot />
      </ConvexProvider>
    </PostHogProvider>
  )
}
