import { useQuery, useMutation } from "convex/react"
import { useState } from "react"
import { Button, Card, Badge, Input, Loading, EmptyState } from "@geenius-ui/react-css"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const listUsersQuery = "users:listAll" as any
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const setRoleMutation = "users:setRole" as any

type User = {
    _id: string
    convexUserId: string
    role?: string
    createdAt: number
}

const ROLE_VARIANTS: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
    superAdmin: "destructive",
    reseller: "secondary",
    user: "outline",
}

export default function Users() {
    const users = useQuery(listUsersQuery) as User[] | undefined
    const setRole = useMutation(setRoleMutation)
    const [emailInput, setEmailInput] = useState("")
    const [roleInput, setRoleInput] = useState<"superAdmin" | "user" | "reseller">("user")
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState("")

    async function handleSetRole() {
        if (!emailInput.trim()) return
        setLoading(true)
        setMessage("")
        try {
            const result = await setRole({ email: emailInput.trim(), role: roleInput })
            setMessage(String(result))
            setEmailInput("")
        } catch (err) {
            setMessage(err instanceof Error ? err.message : "Failed to set role")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div>
            <h2 style={styles.sectionTitle}>User Management</h2>

            {/* Role assignment form */}
            <Card padding="md">
                <h3 style={{ margin: "0 0 1rem" }}>Set User Role</h3>
                <div style={{ display: "flex", gap: "0.5rem", alignItems: "flex-end", flexWrap: "wrap" }}>
                    <div style={{ flex: 1, minWidth: 200 }}>
                        <label style={styles.label}>Email</label>
                        <Input
                            placeholder="user@example.com"
                            value={emailInput}
                            onChange={(e) => setEmailInput(e.target.value)}
                        />
                    </div>
                    <div style={{ minWidth: 140 }}>
                        <label style={styles.label}>Role</label>
                        <select
                            value={roleInput}
                            onChange={(e) => setRoleInput(e.target.value as any)}
                            style={styles.select}
                        >
                            <option value="user">User</option>
                            <option value="reseller">Reseller</option>
                            <option value="superAdmin">Super Admin</option>
                        </select>
                    </div>
                    <Button onClick={handleSetRole} disabled={loading} size="sm">
                        {loading ? "Setting..." : "Set Role"}
                    </Button>
                </div>
                {message && (
                    <p style={{ marginTop: "0.5rem", fontSize: "0.875rem", color: message.startsWith("Success") ? "#22c55e" : "#ef4444" }}>
                        {message}
                    </p>
                )}
            </Card>

            {/* Users list */}
            <div style={{ marginTop: "1.5rem" }}>
                {users === undefined ? (
                    <Loading>Loading users...</Loading>
                ) : users.length === 0 ? (
                    <EmptyState title="No users" description="Users will appear here once they sign up." />
                ) : (
                    <div style={styles.grid}>
                        {users.map((user) => (
                            <Card key={user._id} padding="md">
                                <div style={styles.cardHeader}>
                                    <span style={styles.userId}>{user.convexUserId.slice(0, 12)}...</span>
                                    <Badge variant={ROLE_VARIANTS[user.role ?? "user"] ?? "outline"}>
                                        {user.role ?? "user"}
                                    </Badge>
                                </div>
                                <p style={styles.meta}>
                                    Created: {new Date(user.createdAt).toLocaleDateString()}
                                </p>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

const styles: Record<string, React.CSSProperties> = {
    sectionTitle: { fontSize: "1.25rem", fontWeight: 600, marginBottom: "1rem" },
    label: { display: "block", fontSize: "0.75rem", fontWeight: 600, color: "#6b7280", marginBottom: "0.25rem" },
    select: {
        width: "100%", padding: "0.5rem 0.75rem", borderRadius: 6,
        border: "1px solid #d1d5db", fontSize: "0.875rem", backgroundColor: "#fff",
    },
    grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "1rem" },
    cardHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" },
    userId: { fontWeight: 600, fontSize: "0.875rem", fontFamily: "monospace" },
    meta: { color: "#6b7280", fontSize: "0.75rem", margin: 0 },
}
