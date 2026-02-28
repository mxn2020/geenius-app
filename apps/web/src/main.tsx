import React from "react"
import ReactDOM from "react-dom/client"
import App from "./App"
import { ConvexProvider } from "./providers/ConvexProvider"

const rootEl = document.getElementById("root")
if (!rootEl) throw new Error("No #root element")

ReactDOM.createRoot(rootEl).render(
  <React.StrictMode>
    <ConvexProvider>
      <App />
    </ConvexProvider>
  </React.StrictMode>
)
