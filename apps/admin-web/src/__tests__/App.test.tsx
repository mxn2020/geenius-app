import { render, screen } from "@testing-library/react"
import { describe, it, expect, vi } from "vitest"

// Mock all external dependencies before importing components
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

describe("Admin Web App", () => {
    it("renders the login form when not authenticated", () => {
        render(<App />)
        expect(screen.getByText("Sign in to your account")).toBeInTheDocument()
    })

    it("shows sign-in and register buttons", () => {
        render(<App />)
        expect(screen.getByText("Sign In", { selector: "button[type='submit']" })).toBeInTheDocument()
        expect(screen.getByText("Register", { selector: "button[type='button']" })).toBeInTheDocument()
    })
})
