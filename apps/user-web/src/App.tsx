import React, { useEffect } from "react"
import { useConvexAuth, useMutation } from "convex/react"
import { createRouter, createRoute, createRootRoute, RouterProvider, Outlet } from "@tanstack/react-router"
import { Loading } from "@geenius-ui/react-css"
import Login from "./pages/Login"
import Dashboard from "./pages/Dashboard"
import ProjectDetail from "./pages/ProjectDetail"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ensureUserMutation = "users:ensureUser" as any

const rootRoute = createRootRoute({
  component: AppLayout,
})

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: Dashboard,
})

const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/dashboard",
  component: Dashboard,
})

const projectRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/project/$projectId",
  component: ProjectDetail,
})

const routeTree = rootRoute.addChildren([indexRoute, dashboardRoute, projectRoute])
const router = createRouter({ routeTree })

function AppLayout() {
  const { isAuthenticated, isLoading } = useConvexAuth()
  const ensureUser = useMutation(ensureUserMutation)

  useEffect(() => {
    if (isAuthenticated) {
      ensureUser().catch(() => {
        // User already exists, ignore
      })
    }
  }, [isAuthenticated])

  if (isLoading) {
    return <Loading>Loading...</Loading>
  }

  return isAuthenticated ? <Outlet /> : <Login />
}

export default function App() {
  return <RouterProvider router={router} />
}
