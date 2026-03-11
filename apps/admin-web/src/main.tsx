import React from "react"
import "@geenius-ui/react-css/styles"
import ReactDOM from "react-dom/client"
import App from "./App"
import { ConvexProvider } from "./providers/ConvexProvider"
import { MissingConfigUI } from "./components/MissingConfigUI"
import { ErrorBoundary } from "./components/ErrorBoundary"

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
      <ErrorBoundary>
        <MissingConfigUI configs={requiredConfigs} />
      </ErrorBoundary>
    </React.StrictMode>
  )
} else {
  ReactDOM.createRoot(rootEl).render(
    <React.StrictMode>
      <ErrorBoundary>
        <ConvexProvider>
          <App />
        </ConvexProvider>
      </ErrorBoundary>
    </React.StrictMode>
  )
}
