import { describe, it, expect } from "@jest/globals"
import { render, screen } from "@testing-library/react-native"
import { MissingConfigUI } from "../MissingConfigUI"

describe("Mobile MissingConfigUI Component", () => {
    it("should render a list of missing configurations", () => {
        const mockConfigs = [
            { key: "EXPO_PUBLIC_API_URL", description: "The API backend", isMissing: true },
            { key: "EXPO_PUBLIC_CONVEX_URL", description: "The DB backend", isMissing: false } // Present
        ]

        render(<MissingConfigUI configs={mockConfigs} />)

        // Verify header exists
        expect(screen.getByText("Missing Environment Configuration")).toBeTruthy()

        // Verify only the missing variable is flagged to the developer
        expect(screen.getByText("EXPO_PUBLIC_API_URL")).toBeTruthy()
    })
})
