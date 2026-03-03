import { View, Text, StyleSheet } from "react-native"

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  creating: { bg: "#fef9c3", text: "#854d0e" },
  live:     { bg: "#dcfce7", text: "#166534" },
  suspended:{ bg: "#fee2e2", text: "#991b1b" },
  deleted:  { bg: "#f3f4f6", text: "#6b7280" },
  // domain statuses
  purchased:  { bg: "#ede9fe", text: "#5b21b6" },
  configuring:{ bg: "#fef9c3", text: "#854d0e" },
  verifying:  { bg: "#dbeafe", text: "#1e40af" },
  active:     { bg: "#dcfce7", text: "#166534" },
  failed:     { bg: "#fee2e2", text: "#991b1b" },
  // subscription statuses
  past_due: { bg: "#ffedd5", text: "#9a3412" },
  canceled: { bg: "#f3f4f6", text: "#6b7280" },
}

type Props = {
  status: string
}

export function StatusBadge({ status }: Props) {
  const colors = STATUS_COLORS[status] ?? { bg: "#f3f4f6", text: "#6b7280" }
  return (
    <View style={[styles.badge, { backgroundColor: colors.bg }]}>
      <Text style={[styles.text, { color: colors.text }]}>{status}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  text: {
    fontSize: 12,
    fontWeight: "600",
    textTransform: "capitalize",
  },
})
