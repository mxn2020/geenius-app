import { useState } from "react"
import { useQuery } from "convex/react"
import {
    Button,
    Card,
    Badge,
    Loading,
    EmptyState,
} from "@geenius-ui/react-css"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const getRulesQuery = "compliance:getRulesForMarket" as any

type Market = "EU" | "US" | "UK" | "DACH"

const MARKET_INFO: Record<Market, { name: string; flag: string; regulation: string }> = {
    EU: { name: "European Union", flag: "🇪🇺", regulation: "GDPR" },
    US: { name: "United States", flag: "🇺🇸", regulation: "CAN-SPAM" },
    UK: { name: "United Kingdom", flag: "🇬🇧", regulation: "PECR" },
    DACH: { name: "DACH Region", flag: "🇩🇪", regulation: "UWG §7" },
}

const SEVERITY_VARIANTS: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
    critical: "destructive",
    warning: "outline",
    info: "secondary",
}
const SEVERITY_ICONS: Record<string, string> = {
    critical: "🚫",
    warning: "⚠️",
    info: "ℹ️",
}

const SEVERITY_BORDERS: Record<string, string> = {
    critical: "#ef4444",
    warning: "#f59e0b",
    info: "#3b82f6",
}

export default function Compliance() {
    const [market, setMarket] = useState<Market>("EU")
    const rules = useQuery(getRulesQuery, { market }) as any[] | undefined

    const info = MARKET_INFO[market]

    return (
        <div style={{ padding: "2rem", maxWidth: 800 }}>
            <h1 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "0.5rem" }}>Compliance Center</h1>
            <p style={{ color: "#6b7280", marginBottom: "1.5rem" }}>
                Review regulations before launching campaigns. Non-compliance can result in significant fines.
            </p>

            <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.5rem" }}>
                {(["EU", "US", "UK", "DACH"] as Market[]).map((m) => (
                    <Button
                        key={m}
                        variant={market === m ? "default" : "outline"}
                        size="sm"
                        onClick={() => setMarket(m)}
                    >
                        {MARKET_INFO[m].flag} {m}
                    </Button>
                ))}
            </div>

            <div style={{ marginBottom: "1.5rem" }}><Card padding="md">
                <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                    <h2 style={{ margin: 0 }}>{info.flag} {info.name}</h2>
                    <Badge variant="secondary">{info.regulation}</Badge>
                </div>
            </Card></div>

            {rules === undefined ? (
                <Loading>Loading rules...</Loading>
            ) : rules.length === 0 ? (
                <EmptyState title="No rules seeded yet" description="Run the compliance:seedRules mutation in the Convex dashboard." />
            ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                    {rules.map((rule: any, i: number) => (
                        <Card
                            key={i}
                            padding="md"
                        >
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                                <span style={{ fontWeight: 600 }}>{SEVERITY_ICONS[rule.severity]} {rule.ruleName}</span>
                                <Badge variant={SEVERITY_VARIANTS[rule.severity] || "default"}>
                                    {rule.severity}
                                </Badge>
                            </div>
                            <p style={{ margin: 0, fontSize: "0.875rem", color: "#4b5563", lineHeight: 1.5 }}>
                                {rule.description}
                            </p>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    )
}
