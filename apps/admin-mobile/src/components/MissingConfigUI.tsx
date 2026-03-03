import React from "react"
import { View, Text, StyleSheet, ScrollView } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"

interface MissingConfigUIProps {
    configs: {
        key: string
        description: string
        isMissing: boolean
    }[]
}

export const MissingConfigUI: React.FC<MissingConfigUIProps> = ({ configs }) => {
    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView contentContainerStyle={styles.container}>
                <View style={styles.card}>
                    <View style={styles.header}>
                        <Text style={styles.warningIcon}>⚠️</Text>
                        <Text style={styles.title}>Setup Required</Text>
                        <Text style={styles.subtitle}>
                            Please configure the following environment variables to run the Geenius app.
                        </Text>
                    </View>

                    <View style={styles.list}>
                        {configs.map((config) => (
                            <View
                                key={config.key}
                                style={[
                                    styles.configItem,
                                    config.isMissing ? styles.itemMissing : styles.itemPresent,
                                ]}
                            >
                                <Text style={styles.statusIcon}>{config.isMissing ? "❌" : "✅"}</Text>
                                <View style={styles.details}>
                                    <Text style={styles.configKey}>{config.key}</Text>
                                    <Text style={styles.configDesc}>{config.description}</Text>
                                </View>
                            </View>
                        ))}
                    </View>

                    <View style={styles.footer}>
                        <Text style={styles.footerText}>
                            Create a <Text style={styles.codeText}>.env</Text> file in this app's root directory and restart the Expo server.
                        </Text>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: "#111111",
    },
    container: {
        flexGrow: 1,
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
    },
    card: {
        width: "100%",
        maxWidth: 400,
        backgroundColor: "#1e1e1e",
        borderColor: "#333333",
        borderWidth: 1,
        borderRadius: 16,
        overflow: "hidden",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.5,
        shadowRadius: 15,
        elevation: 20,
    },
    header: {
        padding: 24,
        paddingBottom: 16,
        alignItems: "center",
        borderBottomWidth: 1,
        borderBottomColor: "#333333",
    },
    warningIcon: {
        fontSize: 48,
        marginBottom: 12,
    },
    title: {
        fontSize: 24,
        fontWeight: "600",
        color: "#ffffff",
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 15,
        color: "#a3a3a3",
        textAlign: "center",
        lineHeight: 22,
    },
    list: {
        padding: 24,
        gap: 16,
    },
    configItem: {
        flexDirection: "row",
        alignItems: "flex-start",
        padding: 16,
        borderRadius: 8,
        borderWidth: 1,
        backgroundColor: "#111111",
    },
    itemMissing: {
        borderColor: "#ef4444",
        backgroundColor: "rgba(239, 68, 68, 0.05)",
    },
    itemPresent: {
        borderColor: "#22c55e",
        backgroundColor: "rgba(34, 197, 94, 0.05)",
    },
    statusIcon: {
        fontSize: 20,
        marginRight: 16,
        marginTop: 2,
    },
    details: {
        flex: 1,
    },
    configKey: {
        fontFamily: "Courier",
        fontSize: 14,
        fontWeight: "600",
        color: "#ffffff",
        marginBottom: 4,
    },
    configDesc: {
        fontSize: 14,
        color: "#a3a3a3",
        lineHeight: 20,
    },
    footer: {
        padding: 20,
        backgroundColor: "rgba(0, 0, 0, 0.2)",
        borderTopWidth: 1,
        borderTopColor: "#333333",
        alignItems: "center",
    },
    footerText: {
        fontSize: 14,
        color: "#a3a3a3",
        textAlign: "center",
        lineHeight: 20,
    },
    codeText: {
        fontFamily: "Courier",
        color: "#ffffff",
        backgroundColor: "#111111",
        paddingHorizontal: 6,
        borderRadius: 4,
    },
})
