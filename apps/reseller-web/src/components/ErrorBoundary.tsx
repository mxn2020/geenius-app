import React from "react"

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("[ErrorBoundary]", error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback
      return (
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "center",
          minHeight: "100vh", fontFamily: "system-ui, sans-serif",
          flexDirection: "column", gap: "1rem", padding: "2rem",
        }}>
          <h1 style={{ fontSize: "1.5rem", color: "#ef4444" }}>Something went wrong</h1>
          <p style={{ color: "#6b7280", maxWidth: 480, textAlign: "center" }}>
            An unexpected error occurred. Please try refreshing the page.
          </p>
          <pre style={{
            background: "#f3f4f6", padding: "1rem", borderRadius: 8,
            fontSize: "0.8rem", maxWidth: 600, overflow: "auto", color: "#374151",
          }}>
            {this.state.error?.message}
          </pre>
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: "0.5rem 1.5rem", borderRadius: 6, border: "1px solid #d1d5db",
              background: "#fff", cursor: "pointer", fontSize: "0.875rem",
            }}
          >
            Refresh Page
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
