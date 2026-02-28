import { View, Text, TouchableOpacity, StyleSheet } from "react-native"

type Props = {
  plan: string
  label: string
  price: number
  description: string
  selected: boolean
  onSelect: () => void
}

export function PlanCard({ plan, label, price, description, selected, onSelect }: Props) {
  return (
    <TouchableOpacity
      style={[styles.card, selected && styles.cardSelected]}
      onPress={onSelect}
      activeOpacity={0.8}
    >
      <View style={styles.left}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.description}>{description}</Text>
      </View>
      <View style={styles.priceContainer}>
        <Text style={[styles.price, selected && styles.priceSelected]}>€{price}</Text>
        <Text style={styles.period}>/mo</Text>
      </View>
      {selected && <View style={styles.checkmark}><Text style={styles.checkmarkText}>✓</Text></View>}
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#e0e0e0",
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    backgroundColor: "#fff",
  },
  cardSelected: {
    borderColor: "#6366f1",
    backgroundColor: "#eef2ff",
  },
  left: { flex: 1 },
  label: { fontSize: 16, fontWeight: "600", color: "#111" },
  description: { fontSize: 13, color: "#888", marginTop: 2 },
  priceContainer: { flexDirection: "row", alignItems: "flex-end", marginRight: 8 },
  price: { fontSize: 20, fontWeight: "700", color: "#333" },
  priceSelected: { color: "#6366f1" },
  period: { fontSize: 12, color: "#999", marginBottom: 2 },
  checkmark: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "#6366f1",
    alignItems: "center",
    justifyContent: "center",
  },
  checkmarkText: { color: "#fff", fontWeight: "700", fontSize: 13 },
})
