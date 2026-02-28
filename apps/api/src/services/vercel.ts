interface VercelProject {
  id: string
  name: string
  url?: string
}

interface VercelDeployment {
  id: string
  url: string
  readyState: "INITIALIZING" | "ANALYZING" | "BUILDING" | "DEPLOYING" | "READY" | "ERROR" | "CANCELED"
}

interface EnvVar {
  key: string
  value: string
  target: string[]
  type: "plain" | "encrypted" | "secret"
}

export class VercelService {
  private apiToken: string
  private teamId?: string

  constructor(apiToken: string, teamId?: string) {
    this.apiToken = apiToken
    this.teamId = teamId
  }

  private teamQuery() {
    return this.teamId ? `?teamId=${this.teamId}` : ""
  }

  private async vercelFetch(path: string, options: RequestInit = {}): Promise<Response> {
    const qs = this.teamId ? (path.includes("?") ? `&teamId=${this.teamId}` : `?teamId=${this.teamId}`) : ""
    return fetch(`https://api.vercel.com${path}${qs}`, {
      ...options,
      headers: {
        Authorization: `Bearer ${this.apiToken}`,
        "Content-Type": "application/json",
        ...(options.headers ?? {}),
      },
    })
  }

  async createProject(name: string, repoId: string, envVars: EnvVar[]): Promise<VercelProject> {
    const res = await this.vercelFetch("/v9/projects", {
      method: "POST",
      body: JSON.stringify({
        name,
        gitRepository: { type: "github", repo: repoId },
        environmentVariables: envVars,
      }),
    })
    if (!res.ok) throw new Error(`Vercel: failed to create project (${res.status})`)
    return res.json() as Promise<VercelProject>
  }

  async getProject(name: string): Promise<VercelProject | null> {
    const res = await this.vercelFetch(`/v9/projects/${name}`)
    if (res.status === 404) return null
    if (!res.ok) throw new Error(`Vercel: failed to get project (${res.status})`)
    return res.json() as Promise<VercelProject>
  }

  async addDomain(projectId: string, domain: string): Promise<void> {
    const res = await this.vercelFetch(`/v9/projects/${projectId}/domains`, {
      method: "POST",
      body: JSON.stringify({ name: domain }),
    })
    if (!res.ok) throw new Error(`Vercel: failed to add domain (${res.status})`)
  }

  async removeDomain(projectId: string, domain: string): Promise<void> {
    const res = await this.vercelFetch(`/v9/projects/${projectId}/domains/${domain}`, {
      method: "DELETE",
    })
    if (!res.ok && res.status !== 404) throw new Error(`Vercel: failed to remove domain (${res.status})`)
  }

  async triggerDeploy(projectId: string): Promise<VercelDeployment> {
    const res = await this.vercelFetch("/v13/deployments", {
      method: "POST",
      body: JSON.stringify({ name: projectId, target: "production" }),
    })
    if (!res.ok) throw new Error(`Vercel: failed to trigger deploy (${res.status})`)
    return res.json() as Promise<VercelDeployment>
  }

  async getDeploymentStatus(deploymentId: string): Promise<VercelDeployment> {
    const res = await this.vercelFetch(`/v13/deployments/${deploymentId}`)
    if (!res.ok) throw new Error(`Vercel: failed to get deployment (${res.status})`)
    return res.json() as Promise<VercelDeployment>
  }

  async setEnvVars(projectId: string, vars: EnvVar[]): Promise<void> {
    const res = await this.vercelFetch(`/v9/projects/${projectId}/env`, {
      method: "POST",
      body: JSON.stringify(vars),
    })
    if (!res.ok) throw new Error(`Vercel: failed to set env vars (${res.status})`)
  }

  async waitForDomainVerification(projectId: string, domain: string, timeoutMs: number): Promise<void> {
    const deadline = Date.now() + timeoutMs
    while (Date.now() < deadline) {
      const res = await this.vercelFetch(`/v9/projects/${projectId}/domains/${domain}`)
      if (res.ok) {
        const data = await res.json() as { verified: boolean }
        if (data.verified) return
      }
      await new Promise((r) => setTimeout(r, 10_000))
    }
    throw new Error(`Domain ${domain} verification timed out`)
  }
}
