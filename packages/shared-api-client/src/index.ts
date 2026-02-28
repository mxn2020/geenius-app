import type { Project, Job, Domain, AIAllowancePeriod } from "@geenius/shared-types"
import type { CreateProjectInput, PurchaseDomainInput, UpdateAIModelInput } from "@geenius/shared-validators"

export type ApiResponse<T> =
  | { ok: true; data: T }
  | { ok: false; error: string; code?: string }

export type ApiClientOptions = {
  baseUrl: string
  getToken: () => Promise<string | null>
}

export function createApiClient(options: ApiClientOptions) {
  const { baseUrl, getToken } = options

  async function request<T>(
    method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH",
    path: string,
    body?: unknown
  ): Promise<ApiResponse<T>> {
    const token = await getToken()
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    }
    if (token) {
      headers["Authorization"] = `Bearer ${token}`
    }

    try {
      const res = await fetch(`${baseUrl}${path}`, {
        method,
        headers,
        body: body !== undefined ? JSON.stringify(body) : undefined,
      })

      const json = await res.json() as unknown

      if (!res.ok) {
        const errJson = json as Record<string, unknown>
        return {
          ok: false,
          error: (typeof errJson["error"] === "string" ? errJson["error"] : "Request failed"),
          code: typeof errJson["code"] === "string" ? errJson["code"] : undefined,
        }
      }

      return { ok: true, data: json as T }
    } catch (err) {
      return {
        ok: false,
        error: err instanceof Error ? err.message : "Network error",
      }
    }
  }

  return {
    projects: {
      list: () => request<Project[]>("GET", "/projects"),
      get: (id: string) => request<Project>("GET", `/projects/${id}`),
      create: (input: CreateProjectInput) => request<Project>("POST", "/projects", input),
      delete: (id: string) => request<void>("DELETE", `/projects/${id}`),
    },
    jobs: {
      list: (projectId: string) => request<Job[]>("GET", `/projects/${projectId}/jobs`),
      get: (projectId: string, jobId: string) =>
        request<Job>("GET", `/projects/${projectId}/jobs/${jobId}`),
    },
    domains: {
      list: (projectId: string) => request<Domain[]>("GET", `/projects/${projectId}/domains`),
      purchase: (input: PurchaseDomainInput) =>
        request<Domain>("POST", `/projects/${input.projectId}/domains`, input),
    },
    ai: {
      getAllowance: (projectId: string) =>
        request<AIAllowancePeriod>("GET", `/projects/${projectId}/ai/allowance`),
      updateModel: (input: UpdateAIModelInput) =>
        request<void>("PATCH", `/projects/${input.projectId}/ai/model`, input),
    },
  }
}

export type ApiClient = ReturnType<typeof createApiClient>
