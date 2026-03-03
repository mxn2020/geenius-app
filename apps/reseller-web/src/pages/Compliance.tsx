import { useState } from "react"
import { useQuery } from "convex/react"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const getRulesQuery = "compliance:getRulesForMarket" as any

type Market = "EU" | "US" | "UK" | "DACH"

const MARKET_INFO: Record<Market, { name: string; flag: string; regulation: string }> = {
    EU: { name: "European Union", flag: "🇪🇺", regulation: "GDPR" },
    US: { name: "United States", flag: "🇺🇸", regulation: "CAN-SPAM" },
    UK: { name: "United Kingdom", flag: "🇬🇧", regulation: "PECR" },
    DACH: { name: "DACH Region", flag: "🇩🇪", regulation: "UWG §7" },
}

const SEVERITY_COLORS: Record<string, string> = {
    critical: "#ef4444",
    warning: "#f59e0b",
    info: "#3b82f6",
}
const SEVERITY_ICONS: Record<string, string> = {
    critical: "🚫",
    warning: "⚠️",
    info: "ℹ️",
}

export default function Compliance() {
    const [market, setMarket] = useState<Market>("EU")
    const rules = useQuery(getRulesQuery, { market }) as any[] | undefined

    const info = MARKET_INFO[market]

    return (
        <div style={styles.container}>
            <h1 style={styles.title}>Compliance Center</h1>
            <p style={styles.subtitle}>
                Review regulations before launching campaigns. Non-compliance can result in significant fines.
            </p>

            <div style={styles.tabs}>
                {(["EU", "US", "UK", "DACH"] as Market[]).map((m) => (
                    <button key={m}
                        style={{ ...styles.tab, ...(market === m ? styles.tabActive : {}) }}
                        onClick={() => setMarket(m)}>
                        {MARKET_INFO[m].flag} {m}
                    </button>
                ))}
            </div>

            <div style={styles.marketHeader}>
                <h2 style={{ margin: 0 }}>{info.flag} {info.name}</h2>
                <span style={styles.regulation}>{info.regulation}</span>
            </div>

            {rules === undefined ? (
                <p>Loading rules...</p>
            ) : rules.length === 0 ? (
                <div style={styles.emptyRules}>
                    <p>No rules seeded yet. Run the <code>compliance:seedRules</code> mutation in the Convex dashboard.</p>
                </div>
            ) : (
                <div style={styles.rulesList}>
                    {rules.map((rule: any, i: number) => (
                        <div key={i} style={{
                            ...styles.ruleCard,
                            borderLeftColor: SEVERITY_COLORS[rule.severity] ?? "#6b7280",
                        }}>
                            <div style={styles.ruleHeader}>
                                <span>{SEVERITY_ICONS[rule.severity]} {rule.ruleName}</span>
                                <span style={{
                                    color: SEVERITY_COLORS[rule.severity],
                                    fontWeight: 600, fontSize: "0.75rem", textTransform: "uppercase" as const,
                                }}>
                                    {rule.severity}
                                </span>
                            </div>
                            <p style={styles.ruleDesc}>{rule.description}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

const styles: Record<string, React.CSSProperties> = {
    container: { padding: "2rem", maxWidth: 800 },
    title: { fontSize: "1.5rem", fontWeight: 700, marginBottom: "0.5rem" },
    subtitle: { color: "#6b7280", marginBottom: "1.5rem" },
    tabs: { display: "flex", gap: "0.5rem", marginBottom: "1.5rem" },
    tab: {
        padding: "0.6rem 1.2rem", border: "1px solid #d1d5db", borderRadius: 8,
        cursor: "pointer", background: "#fff", fontSize: "0.875rem", fontWeight: 500,
    },
    tabActive: { backgroundColor: "#111827", color: "#fff", borderColor: "#111827" },
    marketHeader: {
        display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1.5rem",
        padding: "1rem 1.5rem", backgroundColor: "#fff", borderRadius: 12,
    },
    regulation: {
        backgroundColor: "#f3f4f6", padding: "0.25rem 0.75rem", borderRadius: 20,
        fontSize: "0.8rem", fontWeight: 600, color: "#374151",
    },
    emptyRules: { backgroundColor: "#fff", padding: "2rem", borderRadius: 12, textAlign: "center", color: "#6b7280" },
    rulesList: { display: "flex", flexDirection: "column" as const, gap: "0.75rem" },
    ruleCard: {
        backgroundColor: "#fff", borderRadius: 12, padding: "1.25rem",
        borderLeft: "4px solid", boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
    },
    ruleHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem", fontWeight: 600 },
    ruleDesc: { margin: 0, fontSize: "0.875rem", color: "#4b5563", lineHeight: 1.5 },
}
