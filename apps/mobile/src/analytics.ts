import PostHog from "posthog-react-native"

let client: PostHog | null = null

export function initPostHog(apiKey: string, host?: string) {
  if (client) return
  client = new PostHog(apiKey, {
    host: host ?? "https://app.posthog.com",
    captureMode: "json",
  })
}

export function trackEvent(event: string, properties?: Record<string, unknown>) {
  client?.capture(event, properties)
}

export function identifyUser(userId: string, traits?: Record<string, unknown>) {
  client?.identify(userId, traits)
}

export function resetUser() {
  client?.reset()
}

export function getClient(): PostHog | null {
  return client
}
