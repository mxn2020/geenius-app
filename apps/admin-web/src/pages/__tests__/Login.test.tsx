import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen, fireEvent } from "@testing-library/react"
import Login from "../Login"

// Mock the useAuth hook
const mockSignIn = vi.fn()
const mockSignUp = vi.fn()

vi.mock("../../hooks/useAuth", () => ({
    useAuth: () => ({
        signIn: mockSignIn,
        signUp: mockSignUp,
        user: null,
        isLoading: false,
        signOut: vi.fn(),
    })
}))

describe("Login Page Component", () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it("renders the sign in form by default", () => {
        render(<Login />)
        expect(screen.getByText("Geenius Admin")).toBeInTheDocument()
        expect(screen.getByText("Sign in to your account")).toBeInTheDocument()
        expect(screen.getByRole("button", { name: "Sign In" })).toBeInTheDocument()
    })

    it("toggles to registration mode when 'Register' is clicked", () => {
        render(<Login />)

        const registerToggle = screen.getByRole("button", { name: "Register" })
        fireEvent.click(registerToggle)

        expect(screen.getByText("Create your account")).toBeInTheDocument()
        expect(screen.getByRole("button", { name: "Create Account" })).toBeInTheDocument()
    })

    it("calls signIn with correct credentials on form submit", async () => {
        render(<Login />)

        const emailInput = screen.getByLabelText("Email")
        const passwordInput = screen.getByLabelText("Password")

        fireEvent.change(emailInput, { target: { value: "test@geenius.com" } })
        fireEvent.change(passwordInput, { target: { value: "password123" } })

        const submitButton = screen.getByRole("button", { name: "Sign In" })
        fireEvent.click(submitButton)

        expect(mockSignIn).toHaveBeenCalledWith("test@geenius.com", "password123")
    })

    it("calls signUp with correct credentials in register mode", async () => {
        render(<Login />)

        // Toggle to register
        fireEvent.click(screen.getByRole("button", { name: "Register" }))

        const emailInput = screen.getByLabelText("Email")
        const passwordInput = screen.getByLabelText("Password")

        fireEvent.change(emailInput, { target: { value: "newuser@geenius.com" } })
        fireEvent.change(passwordInput, { target: { value: "securepass" } })

        const submitButton = screen.getByRole("button", { name: "Create Account" })
        fireEvent.click(submitButton)

        expect(mockSignUp).toHaveBeenCalledWith("newuser@geenius.com", "securepass")
    })

    it("displays error message when signIn fails", async () => {
        mockSignIn.mockRejectedValueOnce(new Error("Auth failed"))

        render(<Login />)

        const emailInput = screen.getByLabelText("Email")
        const passwordInput = screen.getByLabelText("Password")

        fireEvent.change(emailInput, { target: { value: "test@geenius.com" } })
        fireEvent.change(passwordInput, { target: { value: "wrongpass" } })

        const submitButton = screen.getByRole("button", { name: "Sign In" })
        fireEvent.click(submitButton)

        // Let the async submit finish
        await screen.findByText("Invalid email or password")
        expect(screen.getByText("Invalid email or password")).toBeInTheDocument()
    })
})
