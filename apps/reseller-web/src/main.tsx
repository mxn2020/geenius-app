import React from "react"
import ReactDOM from "react-dom/client"
import App from "./App"
import { ConvexProvider } from "./providers/ConvexProvider"
import { MissingConfigUI } from "./components/MissingConfigUI"

const rootEl = document.getElementById("root")
if (!rootEl) throw new Error("No #root element")

const requiredConfigs = [
  {
    key: "VITE_CONVEX_URL",
    description: "The URL of your Convex development environment.",
    isMissing: !import.meta.env.VITE_CONVEX_URL,
  },
  {
    key: "VITE_POSTHOG_KEY",
    description: "Your PostHog analytics tracking key. (Optional)",
    isMissing: !import.meta.env.VITE_POSTHOG_KEY || import.meta.env.VITE_POSTHOG_KEY.startsWith("your-"),
    isRequired: false
  },
  {
    key: "VITE_API_URL",
    description: "The backend orchestration API URL.",
    isMissing: !import.meta.env.VITE_API_URL,
    isRequired: true
  }
]

const missingRequired = requiredConfigs.filter(c => c.isMissing && c.isRequired)

if (missingRequired.length > 0) {
  ReactDOM.createRoot(rootEl).render(
    <React.StrictMode>
      <MissingConfigUI configs={requiredConfigs} />
    </React.StrictMode>
  )
} else {
  // If PostHog isn't strictly provided, don't wrap the app in it (skip it logically)
  ReactDOM.createRoot(rootEl).render(
    <React.StrictMode>
      <ConvexProvider>
        <App />
      </ConvexProvider>
    </React.StrictMode>
  )
}
