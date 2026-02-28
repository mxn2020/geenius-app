import posthog from "posthog-js"

let initialized = false

export function initPostHog(apiKey: string, host?: string) {
  if (initialized) return
  posthog.init(apiKey, {
    api_host: host ?? "https://app.posthog.com",
    capture_pageview: true,
    capture_pageleave: true,
    autocapture: false,
    persistence: "localStorage",
  })
  initialized = true
}

export function trackEvent(event: string, properties?: Record<string, unknown>) {
  if (!initialized) return
  posthog.capture(event, properties)
}

export function identifyUser(userId: string, traits?: Record<string, unknown>) {
  if (!initialized) return
  posthog.identify(userId, traits)
}

export function resetUser() {
  if (!initialized) return
  posthog.reset()
}
