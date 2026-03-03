import { render, screen, fireEvent } from "@testing-library/react"
import { describe, it, expect, vi } from "vitest"
import Login from "../Login"

// Mock the Auth Context
vi.mock("../../hooks/useAuth", () => ({
    useAuth: () => ({
        signIn: vi.fn(),
        signUp: vi.fn(),
    }),
}))

describe("Login Component", () => {
    it("should initially render the Sign In form", () => {
        render(<Login />)
        expect(screen.getByText("Sign in to your account")).toBeInTheDocument()
        expect(screen.getByText("Sign In", { selector: "button[type='submit']" })).toBeInTheDocument()
    })

    it("should toggle to the Create Account form when Register is clicked", () => {
        render(<Login />)

        const registerButton = screen.getByText("Register", { selector: "button[type='button']" })
        fireEvent.click(registerButton)

        expect(screen.getByText("Create your account")).toBeInTheDocument()
        expect(screen.getByText("Create Account", { selector: "button[type='submit']" })).toBeInTheDocument()
    })
})
