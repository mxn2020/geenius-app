import { render, screen } from "@testing-library/react"
import { describe, it, expect, vi } from "vitest"

vi.mock("@convex-dev/auth/react", () => ({
    useAuthActions: () => ({
        signIn: vi.fn(),
        signOut: vi.fn(),
    }),
}))

vi.mock("convex/react", () => ({
    useConvexAuth: () => ({ isAuthenticated: false, isLoading: false }),
    useQuery: () => undefined,
    useMutation: () => vi.fn(),
}))

import App from "../App"

describe("Reseller Web App", () => {
    it("renders the login form when not authenticated", () => {
        render(<App />)
        expect(screen.getByText("Sign in to your account")).toBeInTheDocument()
    })
})
