import { useState, useEffect } from "react"
import { useQuery, useMutation } from "convex/react"
import {
    Button,
    Input,
    Label,
    Section,
    AlertDialog,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogAction
} from "@geenius-ui/react"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const getProfileQuery = "resellers:getProfile" as any
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const upsertProfileMutation = "resellers:upsertProfile" as any

export default function Branding() {
    const profile = useQuery(getProfileQuery) as any
    const upsertProfile = useMutation(upsertProfileMutation)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [form, setForm] = useState({
        companyName: "",
        logoUrl: "",
        primaryColor: "#6366f1",
        customDomain: "",
        emailFromName: "",
        emailFromDomain: "",
        resendApiKey: "",
        stripeConnectAccountId: "",
    })

    useEffect(() => {
        if (profile) {
            setForm({
                companyName: profile.companyName || "",
                logoUrl: profile.logoUrl || "",
                primaryColor: profile.primaryColor || "#6366f1",
                customDomain: profile.customDomain || "",
                emailFromName: profile.emailFromName || "",
                emailFromDomain: profile.emailFromDomain || "",
                resendApiKey: profile.resendApiKey || "",
                stripeConnectAccountId: profile.stripeConnectAccountId || "",
            })
        }
    }, [profile])

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault()
        setSaving(true)
        setError(null)
        try {
            await upsertProfile(form)
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to save")
        } finally {
            setSaving(false)
        }
    }

    return (
        <div style={styles.container}>
            <h1 style={styles.title}>Branding & White-Label</h1>
            <p style={styles.subtitle}>Configure your brand identity. Your prospects will see your company, not Geenius.</p>

            <form onSubmit={handleSave} style={styles.form}>
                <Section>
                    <h3 style={styles.sectionTitle}>🏢 Company Identity</h3>
                    <div style={styles.inputGroup}>
                        <Label>Company Name</Label>
                        <Input required value={form.companyName}
                            onChange={(e) => setForm({ ...form, companyName: e.target.value })} />
                    </div>
                    <div style={styles.inputGroup}>
                        <Label>Logo URL</Label>
                        <Input placeholder="https://yourbrand.com/logo.png" value={form.logoUrl}
                            onChange={(e) => setForm({ ...form, logoUrl: e.target.value })} />
                    </div>
                    <div style={styles.inputGroup}>
                        <Label>Brand Color</Label>
                        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                            <input type="color" value={form.primaryColor}
                                onChange={(e) => setForm({ ...form, primaryColor: e.target.value })} />
                            <span style={{ fontSize: "0.875rem", color: "#6b7280" }}>{form.primaryColor}</span>
                        </div>
                    </div>
                </Section>

                <Section>
                    <h3 style={styles.sectionTitle}>🌐 Custom Domain</h3>
                    <div style={styles.inputGroup}>
                        <Label>Custom Domain (CNAME to Vercel)</Label>
                        <Input placeholder="app.yourbrand.com" value={form.customDomain}
                            onChange={(e) => setForm({ ...form, customDomain: e.target.value })} />
                    </div>
                </Section>

                <Section>
                    <h3 style={styles.sectionTitle}>📧 Email Configuration</h3>
                    <div style={styles.inputGroup}>
                        <Label>Sender Name</Label>
                        <Input placeholder="John from YourBrand" value={form.emailFromName}
                            onChange={(e) => setForm({ ...form, emailFromName: e.target.value })} />
                    </div>
                    <div style={styles.inputGroup}>
                        <Label>Sender Domain (configure SPF/DKIM in Resend)</Label>
                        <Input placeholder="yourbrand.com" value={form.emailFromDomain}
                            onChange={(e) => setForm({ ...form, emailFromDomain: e.target.value })} />
                    </div>
                    <div style={styles.inputGroup}>
                        <Label>Resend API Key</Label>
                        <Input type="password" placeholder="re_..." value={form.resendApiKey}
                            onChange={(e) => setForm({ ...form, resendApiKey: e.target.value })} />
                    </div>
                </Section>

                <Section>
                    <h3 style={styles.sectionTitle}>💳 Stripe Connect</h3>
                    <div style={styles.inputGroup}>
                        <Label>Stripe Connect Account ID</Label>
                        <Input placeholder="acct_..." value={form.stripeConnectAccountId}
                            onChange={(e) => setForm({ ...form, stripeConnectAccountId: e.target.value })} />
                    </div>
                </Section>

                <Button type="submit" disabled={saving} style={{ alignSelf: "flex-start", marginTop: "1rem" }}>
                    {saving ? "Saving..." : "Save Configuration"}
                </Button>
            </form>

            <AlertDialog open={!!error} onOpenChange={(open) => !open && setError(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Error</AlertDialogTitle>
                        <AlertDialogDescription>{error}</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogAction onClick={() => setError(null)}>OK</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}

const styles: Record<string, React.CSSProperties> = {
    container: { padding: "2rem", maxWidth: 800 },
    title: { fontSize: "1.5rem", fontWeight: 700, marginBottom: "0.5rem" },
    subtitle: { color: "#6b7280", marginBottom: "2rem" },
    form: { display: "flex", flexDirection: "column" as const, gap: "1.5rem" },
    sectionTitle: { margin: "0 0 1rem", fontSize: "1rem" },
    inputGroup: { display: "flex", flexDirection: "column" as const, gap: "0.5rem", marginBottom: "1rem" },
}

