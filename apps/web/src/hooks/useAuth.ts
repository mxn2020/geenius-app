import { useAuthActions } from "@convex-dev/auth/react"
import { useConvexAuth } from "convex/react"

export function useAuth() {
  const { signIn: convexSignIn, signOut: convexSignOut } = useAuthActions()
  const { isAuthenticated, isLoading } = useConvexAuth()

  async function signIn(email: string, password: string) {
    await convexSignIn("password", { email, password, flow: "signIn" })
  }

  async function signUp(email: string, password: string) {
    await convexSignIn("password", { email, password, flow: "signUp" })
  }

  async function signOut() {
    await convexSignOut()
  }

  return { signIn, signUp, signOut, isAuthenticated, isLoading }
}
