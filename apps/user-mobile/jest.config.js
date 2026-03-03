module.exports = {
    preset: "jest-expo",
    roots: ["<rootDir>"],
    setupFilesAfterEnv: ["@testing-library/jest-native/extend-expect"],
    transformIgnorePatterns: [
        "node_modules/(?!.*/?(react-native|@react-native|expo|@expo|react-navigation|@react-navigation|posthog-react-native|@unimodules|@convex-dev|is-network-error))"
    ]
}
