import { useState } from "react"
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native"
import { useLocalSearchParams } from "expo-router"
import { useQuery } from "convex/react"
import { StatusBadge } from "../../../../src/components/StatusBadge"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const getDomainsQuery = "domains:listDomains" as any

export default function DomainManagement() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const domains = useQuery(getDomainsQuery, { projectId: id })
  const [domainInput, setDomainInput] = useState("")
  const [purchasing, setPurchasing] = useState(false)

  async function handlePurchase() {
    if (!domainInput.trim()) {
      Alert.alert("Error", "Enter a domain name")
      return
    }
    setPurchasing(true)
    try {
      const res = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL ?? ""}/projects/${id}/domains`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ domainName: domainInput.trim() }),
        }
      )
      if (!res.ok) throw new Error("Failed to purchase domain")
      Alert.alert("Success", "Domain purchase initiated")
      setDomainInput("")
    } catch (e) {
      Alert.alert("Error", e instanceof Error ? e.message : "Failed")
    } finally {
      setPurchasing(false)
    }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Domain Management</Text>

      <Text style={styles.sectionTitle}>Custom Domain</Text>
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          placeholder="example.com"
          placeholderTextColor="#999"
          autoCapitalize="none"
          autoCorrect={false}
          value={domainInput}
          onChangeText={setDomainInput}
        />
        <TouchableOpacity
          style={[styles.addButton, purchasing && styles.buttonDisabled]}
          onPress={handlePurchase}
          disabled={purchasing}
        >
          {purchasing ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.addButtonText}>Add</Text>
          )}
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>Existing Domains</Text>
      {domains === undefined ? (
        <ActivityIndicator size="small" color="#6366f1" />
      ) : domains.length === 0 ? (
        <Text style={styles.emptyText}>No custom domains yet</Text>
      ) : (
        domains.map((domain: { _id: string; domainName: string; status: string }) => (
          <View key={domain._id} style={styles.domainRow}>
            <Text style={styles.domainName}>{domain.domainName}</Text>
            <StatusBadge status={domain.status} />
          </View>
        ))
      )}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  content: { padding: 24 },
  title: { fontSize: 22, fontWeight: "700", marginBottom: 24 },
  sectionTitle: { fontSize: 16, fontWeight: "600", marginBottom: 12, color: "#333" },
  inputRow: { flexDirection: "row", gap: 8, marginBottom: 24 },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    backgroundColor: "#fafafa",
  },
  addButton: {
    backgroundColor: "#6366f1",
    borderRadius: 10,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonDisabled: { opacity: 0.5 },
  addButtonText: { color: "#fff", fontWeight: "600" },
  emptyText: { color: "#999", fontStyle: "italic" },
  domainRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  domainName: { fontSize: 15, color: "#333" },
})
