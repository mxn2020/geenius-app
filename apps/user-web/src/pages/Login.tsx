import { useState } from "react"
import { useAuth } from "../hooks/useAuth"
import { Button, Input, Card, Label } from "@geenius-ui/react-css"

export default function Login() {
  const { signIn, signUp } = useAuth()
  const [isRegistering, setIsRegistering] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)
    try {
      if (isRegistering) {
        await signUp(email, password)
      } else {
        await signIn(email, password)
      }
    } catch {
      setError(isRegistering ? "Failed to create account" : "Invalid email or password")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <Card padding="lg">
          <h1 style={styles.title}>Geenius User Portal</h1>
          <p style={styles.subtitle}>{isRegistering ? "Create your account" : "Sign in to your account"}</p>

          <form onSubmit={handleSubmit} style={styles.form}>
            {error && <div style={styles.error}>{error}</div>}

            <div style={styles.fieldGroup}>
              <Label>Email</Label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>

            <div style={styles.fieldGroup}>
              <Label>Password</Label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete={isRegistering ? "new-password" : "current-password"}
              />
            </div>

            <Button type="submit" disabled={loading} style={{ marginTop: "0.5rem" }}>
              {loading ? (isRegistering ? "Creating account..." : "Signing in...") : (isRegistering ? "Create Account" : "Sign In")}
            </Button>
          </form>

          <div style={styles.footer}>
            {isRegistering ? "Already have an account?" : "Don't have an account?"}
            <Button
              variant="ghost"
              style={styles.textButton}
              onClick={() => {
                setIsRegistering(!isRegistering)
                setError("")
              }}
            >
              {isRegistering ? "Sign In" : "Register"}
            </Button>
          </div>
        </Card>
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
    width: "100%",
    maxWidth: 400,
  },
  title: { fontSize: "1.75rem", fontWeight: 700, marginBottom: "0.25rem" },
  subtitle: { color: "#666", marginBottom: "1.5rem" },
  form: { display: "flex", flexDirection: "column", gap: "1rem" },
  fieldGroup: { display: "flex", flexDirection: "column", gap: "0.5rem" },
  footer: {
    marginTop: "1.5rem",
    textAlign: "center",
    fontSize: "0.875rem",
    color: "#666",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "0.5rem"
  },
  textButton: {
    color: "#6366f1",
    padding: 0,
    height: "auto",
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
