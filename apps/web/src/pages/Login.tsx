import { useState } from "react"
import { useAuth } from "../hooks/useAuth"

export default function Login() {
  const { signIn } = useAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)
    try {
      await signIn(email, password)
    } catch {
      setError("Invalid email or password")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>Geenius Admin</h1>
        <p style={styles.subtitle}>Sign in to your account</p>

        <form onSubmit={handleSubmit} style={styles.form}>
          {error && <div style={styles.error}>{error}</div>}

          <label style={styles.label}>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={styles.input}
            required
            autoComplete="email"
          />

          <label style={styles.label}>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={styles.input}
            required
            autoComplete="current-password"
          />

          <button type="submit" style={styles.button} disabled={loading}>
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f8f8f8",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: "2rem",
    width: "100%",
    maxWidth: 400,
    boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
  },
  title: { fontSize: "1.75rem", fontWeight: 700, marginBottom: "0.25rem" },
  subtitle: { color: "#666", marginBottom: "1.5rem" },
  form: { display: "flex", flexDirection: "column", gap: "0.5rem" },
  label: { fontSize: "0.875rem", fontWeight: 600, color: "#333" },
  input: {
    padding: "0.75rem",
    borderRadius: 8,
    border: "1px solid #e0e0e0",
    fontSize: "1rem",
    marginBottom: "0.5rem",
  },
  button: {
    backgroundColor: "#6366f1",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    padding: "0.875rem",
    fontSize: "1rem",
    fontWeight: 600,
    cursor: "pointer",
    marginTop: "0.5rem",
  },
  error: {
    backgroundColor: "#fee2e2",
    color: "#991b1b",
    borderRadius: 8,
    padding: "0.75rem",
    marginBottom: "0.5rem",
    fontSize: "0.875rem",
  },
}
