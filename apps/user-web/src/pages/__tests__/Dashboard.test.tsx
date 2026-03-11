import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen, fireEvent } from "@testing-library/react"
import Dashboard from "../Dashboard"

const mockSignOut = vi.fn()
vi.mock("../../hooks/useAuth", () => ({
    useAuth: () => ({
        signOut: mockSignOut
    })
}))

const mockCreateProject = vi.fn()
vi.mock("convex/react", () => ({
    useQuery: vi.fn().mockReturnValue([
        { _id: "proj1", name: "Alpha", slug: "alpha", plan: "ai", status: "live" }
    ]),
    useMutation: () => mockCreateProject,
}))

vi.mock("@tanstack/react-router", () => ({
    Link: ({ children, to }: any) => <a href={to}>{children}</a>
}))

describe("Dashboard Page Component (User Web)", () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it("renders existing projects", () => {
        render(<Dashboard />)
        expect(screen.getByText("Alpha")).toBeInTheDocument()
        expect(screen.getByText("alpha.geenius.app")).toBeInTheDocument()
        expect(screen.getByText("live")).toBeInTheDocument()
    })

    it("opens the create project form", () => {
        render(<Dashboard />)
        const newProjectBtn = screen.getByRole("button", { name: "+ New Project" })
        fireEvent.click(newProjectBtn)

        expect(screen.getByText("Launch a New Project")).toBeInTheDocument()
        expect(screen.getByLabelText("Project Name")).toBeInTheDocument()
    })

    it("auto-generates a slug from the project name", () => {
        render(<Dashboard />)
        fireEvent.click(screen.getByRole("button", { name: "+ New Project" }))

        const nameInput = screen.getByLabelText("Project Name")
        fireEvent.change(nameInput, { target: { value: "My Great App" } })

        const slugInput = screen.getByLabelText("Subdomain") as HTMLInputElement
        expect(slugInput.value).toBe("my-great-app")
    })

    it("submits the create project form with correct payload", async () => {
        render(<Dashboard />)
        fireEvent.click(screen.getByRole("button", { name: "+ New Project" }))

        fireEvent.change(screen.getByLabelText("Project Name"), { target: { value: "Omega App" } })

        const submitBtn = screen.getByRole("button", { name: /Launch Project/ })
        fireEvent.click(submitBtn)

        expect(mockCreateProject).toHaveBeenCalledWith({
            name: "Omega App",
            slug: "omega-app",
            plan: "webapp",
            prompt: undefined
        })
    })

    it("signs out the user", () => {
        render(<Dashboard />)
        fireEvent.click(screen.getByRole("button", { name: "Sign out" }))
        expect(mockSignOut).toHaveBeenCalled()
    })
})
