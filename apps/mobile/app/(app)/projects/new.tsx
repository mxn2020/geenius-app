import { useState, useEffect, useRef } from "react"
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Animated,
  ActivityIndicator,
} from "react-native"
import { router } from "expo-router"
import { useMutation } from "convex/react"
import { PlanCard } from "../../../src/components/PlanCard"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const createProjectMutation = "projects:createProject" as any

type Plan = "website" | "webapp" | "authdb" | "ai"

const PLANS: { plan: Plan; label: string; price: number; description: string }[] = [
  { plan: "website", label: "Website", price: 10, description: "Static site, landing page" },
  { plan: "webapp", label: "Web App", price: 20, description: "Full web application" },
  { plan: "authdb", label: "Auth + DB", price: 30, description: "Web app with auth & database" },
  { plan: "ai", label: "AI", price: 40, description: "Web app with AI capabilities" },
]

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40)
}

export default function NewProjectScreen() {
  const createProject = useMutation(createProjectMutation)
  const [step, setStep] = useState(1)
  const [name, setName] = useState("")
  const [slug, setSlug] = useState("")
  const [plan, setPlan] = useState<Plan>("webapp")
  const [slugEdited, setSlugEdited] = useState(false)
  const [checking, setChecking] = useState(false)
  const [slugAvailable, setSlugAvailable] = useState<boolean | null>(null)
  const [creating, setCreating] = useState(false)
  const [jobId, setJobId] = useState<string | null>(null)
  const checkTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const progressAnim = useRef(new Animated.Value(0)).current

  useEffect(() => {
    if (!slugEdited && name) {
      setSlug(slugify(name))
    }
  }, [name, slugEdited])

  useEffect(() => {
    if (!slug) {
      setSlugAvailable(null)
      return
    }
    setChecking(true)
    setSlugAvailable(null)
    if (checkTimer.current) clearTimeout(checkTimer.current)
    checkTimer.current = setTimeout(async () => {
      // Real-time slug check via API
      try {
        const res = await fetch(
          `${process.env.EXPO_PUBLIC_API_URL ?? ""}/projects/slug-check?slug=${encodeURIComponent(slug)}`
        )
        const data = (await res.json()) as { available?: boolean }
        setSlugAvailable(data.available ?? true)
      } catch {
        setSlugAvailable(true)
      } finally {
        setChecking(false)
      }
    }, 400)
    return () => {
      if (checkTimer.current) clearTimeout(checkTimer.current)
    }
  }, [slug])

  async function handleLaunch() {
    setCreating(true)
    setStep(4)
    Animated.loop(
      Animated.sequence([
        Animated.timing(progressAnim, { toValue: 1, duration: 2000, useNativeDriver: false }),
        Animated.timing(progressAnim, { toValue: 0, duration: 0, useNativeDriver: false }),
      ])
    ).start()
    try {
      const id = await createProject({ name, slug, plan })
      setJobId(id as string)
    } catch (e) {
      Alert.alert("Error", e instanceof Error ? e.message : "Failed to create project")
      setStep(3)
      setCreating(false)
    }
  }

  if (step === 1) {
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <Text style={styles.stepLabel}>Step 1 of 3</Text>
        <Text style={styles.title}>What are you building?</Text>

        <Text style={styles.label}>Project name</Text>
        <TextInput
          style={styles.input}
          placeholder="My Awesome App"
          placeholderTextColor="#999"
          value={name}
          onChangeText={setName}
          autoFocus
        />

        {name.length > 0 && (
          <Text style={styles.slugPreview}>
            Slug preview: <Text style={styles.slugValue}>{slugify(name)}</Text>
          </Text>
        )}

        <Text style={styles.label}>Choose a plan</Text>
        {PLANS.map((p) => (
          <PlanCard
            key={p.plan}
            plan={p.plan}
            label={p.label}
            price={p.price}
            description={p.description}
            selected={plan === p.plan}
            onSelect={() => setPlan(p.plan)}
          />
        ))}

        <TouchableOpacity
          style={[styles.button, !name && styles.buttonDisabled]}
          disabled={!name}
          onPress={() => setStep(2)}
        >
          <Text style={styles.buttonText}>Next →</Text>
        </TouchableOpacity>
      </ScrollView>
    )
  }

  if (step === 2) {
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <Text style={styles.stepLabel}>Step 2 of 3</Text>
        <Text style={styles.title}>Your subdomain</Text>

        <View style={styles.domainRow}>
          <TextInput
            style={styles.domainInput}
            value={slug}
            onChangeText={(v) => {
              setSlug(slugify(v))
              setSlugEdited(true)
            }}
            autoCapitalize="none"
            autoCorrect={false}
          />
          <Text style={styles.domainSuffix}>.geenius.app</Text>
        </View>

        {checking && <ActivityIndicator size="small" color="#6366f1" style={styles.checker} />}
        {!checking && slugAvailable === true && (
          <Text style={styles.available}>✓ Available</Text>
        )}
        {!checking && slugAvailable === false && (
          <Text style={styles.unavailable}>✗ Already taken</Text>
        )}

        <Text style={styles.domainFull}>{slug}.geenius.app</Text>

        <View style={styles.row}>
          <TouchableOpacity style={styles.backButton} onPress={() => setStep(1)}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.flexButton, (!slug || slugAvailable === false) && styles.buttonDisabled]}
            disabled={!slug || slugAvailable === false}
            onPress={() => setStep(3)}
          >
            <Text style={styles.buttonText}>Next →</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    )
  }

  if (step === 3) {
    const selectedPlan = PLANS.find((p) => p.plan === plan)!
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <Text style={styles.stepLabel}>Step 3 of 3</Text>
        <Text style={styles.title}>Review & Launch</Text>

        <View style={styles.summaryCard}>
          <Text style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Project: </Text>
            <Text style={styles.summaryValue}>{name}</Text>
          </Text>
          <Text style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>URL: </Text>
            <Text style={styles.summaryValue}>{slug}.geenius.app</Text>
          </Text>
          <Text style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Plan: </Text>
            <Text style={styles.summaryValue}>
              {selectedPlan.label} — €{selectedPlan.price}/mo
            </Text>
          </Text>
        </View>

        <View style={styles.row}>
          <TouchableOpacity style={styles.backButton} onPress={() => setStep(2)}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.button, styles.flexButton]} onPress={handleLaunch}>
            <Text style={styles.buttonText}>🚀 Launch Project</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    )
  }

  // Step 4 — building
  return (
    <View style={styles.centered}>
      <Text style={styles.buildingTitle}>Building your project...</Text>
      <ActivityIndicator size="large" color="#6366f1" style={styles.spinner} />

      {["Creating repository", "Pushing template", "Deploying", "Going live"].map(
        (stepLabel, i) => (
          <View key={stepLabel} style={styles.stepRow}>
            <View style={styles.stepDot} />
            <Text style={styles.stepText}>{stepLabel}</Text>
          </View>
        )
      )}

      {jobId && (
        <TouchableOpacity
          style={[styles.button, styles.doneButton]}
          onPress={() => router.replace(`/(app)/projects/${jobId}`)}
        >
          <Text style={styles.buttonText}>Open your site →</Text>
        </TouchableOpacity>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  content: { padding: 24, paddingBottom: 48 },
  centered: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24 },
  stepLabel: { fontSize: 13, color: "#999", marginBottom: 8 },
  title: { fontSize: 24, fontWeight: "700", marginBottom: 24 },
  label: { fontSize: 14, fontWeight: "600", color: "#333", marginBottom: 8 },
  input: {
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
    backgroundColor: "#fafafa",
    marginBottom: 8,
  },
  slugPreview: { fontSize: 13, color: "#999", marginBottom: 16 },
  slugValue: { color: "#6366f1", fontWeight: "500" },
  button: {
    backgroundColor: "#6366f1",
    borderRadius: 10,
    padding: 16,
    alignItems: "center",
    marginTop: 16,
  },
  buttonDisabled: { opacity: 0.4 },
  buttonText: { color: "#fff", fontWeight: "600", fontSize: 16 },
  flexButton: { flex: 1 },
  backButton: { paddingVertical: 16, paddingRight: 16 },
  backText: { color: "#6366f1", fontWeight: "500", fontSize: 16 },
  row: { flexDirection: "row", alignItems: "center", marginTop: 8 },
  domainRow: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 10,
    backgroundColor: "#fafafa",
    marginBottom: 8,
  },
  domainInput: { flex: 1, padding: 14, fontSize: 16 },
  domainSuffix: { paddingRight: 14, color: "#999", fontSize: 14 },
  domainFull: { fontSize: 14, color: "#6366f1", marginBottom: 8 },
  checker: { marginVertical: 8 },
  available: { color: "#22c55e", fontWeight: "500", marginBottom: 8 },
  unavailable: { color: "#ef4444", fontWeight: "500", marginBottom: 8 },
  summaryCard: {
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    backgroundColor: "#fafafa",
  },
  summaryRow: { marginBottom: 10, fontSize: 15 },
  summaryLabel: { fontWeight: "600" },
  summaryValue: { color: "#333" },
  buildingTitle: { fontSize: 22, fontWeight: "700", marginBottom: 24 },
  spinner: { marginBottom: 32 },
  stepRow: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  stepDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#6366f1",
    marginRight: 12,
  },
  stepText: { fontSize: 15, color: "#444" },
  doneButton: { marginTop: 32, paddingHorizontal: 32 },
})
