import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from "react-native"
import { router } from "expo-router"
import { useAuth } from "../../src/hooks/useAuth"

export default function AccountScreen() {
  const { signOut } = useAuth()

  async function handleSignOut() {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: async () => {
          await signOut()
          router.replace("/(auth)/login")
        },
      },
    ])
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Account</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Plan & Billing</Text>
        <TouchableOpacity style={styles.row}>
          <Text style={styles.rowText}>Manage subscription</Text>
          <Text style={styles.chevron}>›</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Support</Text>
        <TouchableOpacity style={styles.row}>
          <Text style={styles.rowText}>Documentation</Text>
          <Text style={styles.chevron}>›</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.row}>
          <Text style={styles.rowText}>Contact support</Text>
          <Text style={styles.chevron}>›</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
        <Text style={styles.signOutText}>Sign Out</Text>
      </TouchableOpacity>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8f8f8" },
  content: { padding: 16 },
  title: { fontSize: 28, fontWeight: "700", marginBottom: 24 },
  section: {
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 16,
    overflow: "hidden",
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "600",
    color: "#999",
    textTransform: "uppercase",
    padding: 12,
    paddingBottom: 4,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 14,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  rowText: { fontSize: 16, color: "#333" },
  chevron: { color: "#999", fontSize: 20 },
  signOutButton: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ef4444",
    marginTop: 8,
  },
  signOutText: { color: "#ef4444", fontWeight: "600", fontSize: 16 },
})
