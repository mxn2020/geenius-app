import { useQuery } from "convex/react"
import { Card, Badge, Loading, EmptyState } from "@geenius-ui/react-css"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const listResellersQuery = "resellers:listResellers" as any

type ResellerProfile = {
    _id: string
    userId: string
    companyName: string
    logoUrl?: string
    primaryColor?: string
    customDomain?: string
    onboardingComplete?: boolean
    emailFromName?: string
    emailFromDomain?: string
    createdAt: number
}

export default function Resellers() {
    const resellers = useQuery(listResellersQuery) as ResellerProfile[] | undefined

    return (
        <div>
            <h2 style={styles.sectionTitle}>Reseller Management</h2>

            {resellers === undefined ? (
                <Loading>Loading resellers...</Loading>
            ) : resellers.length === 0 ? (
                <EmptyState title="No resellers" description="Reseller profiles will appear here once created." />
            ) : (
                <div style={styles.grid}>
                    {resellers.map((r) => (
                        <Card key={r._id} padding="md">
                            <div style={styles.cardHeader}>
                                {r.logoUrl ? (
                                    <img src={r.logoUrl} alt={r.companyName} style={styles.logo} />
                                ) : (
                                    <div style={{ ...styles.logo, backgroundColor: r.primaryColor || "#6366f1", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: "0.875rem" }}>
                                        {r.companyName.charAt(0).toUpperCase()}
                                    </div>
                                )}
                                <div style={{ flex: 1 }}>
                                    <span style={styles.companyName}>{r.companyName}</span>
                                    <Badge variant={r.onboardingComplete ? "default" : "outline"}>
                                        {r.onboardingComplete ? "Active" : "Onboarding"}
                                    </Badge>
                                </div>
                            </div>

                            <div style={styles.details}>
                                {r.emailFromName && (
                                    <p style={styles.detail}><strong>From:</strong> {r.emailFromName} ({r.emailFromDomain || "—"})</p>
                                )}
                                {r.customDomain && (
                                    <p style={styles.detail}><strong>Domain:</strong> {r.customDomain}</p>
                                )}
                                <p style={styles.detail}><strong>Created:</strong> {new Date(r.createdAt).toLocaleDateString()}</p>
                            </div>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    )
}

const styles: Record<string, React.CSSProperties> = {
    sectionTitle: { fontSize: "1.25rem", fontWeight: 600, marginBottom: "1rem" },
    grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "1rem" },
    cardHeader: { display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.75rem" },
    logo: { width: 40, height: 40, borderRadius: 8, objectFit: "cover" as const },
    companyName: { fontWeight: 600, fontSize: "1rem", marginRight: "0.5rem" },
    details: { borderTop: "1px solid #f3f4f6", paddingTop: "0.5rem" },
    detail: { margin: "0.25rem 0", fontSize: "0.8rem", color: "#6b7280" },
}
