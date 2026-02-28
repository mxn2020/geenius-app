import * as crypto from "node:crypto"

interface GitHubAppAuth {
  appId: string
  privateKey: string
}

interface RepoCreationResult {
  id: number
  name: string
  full_name: string
  html_url: string
  clone_url: string
}

interface CommitStatusResult {
  state: "error" | "failure" | "pending" | "success"
}

interface CheckRunResult {
  status: string
  conclusion: string | null
}

export class GitHubService {
  private orgName: string
  private auth: GitHubAppAuth
  private installationToken?: string
  private tokenExpiry = 0

  constructor(orgName: string, appId: string, privateKey: string) {
    this.orgName = orgName
    this.auth = { appId, privateKey }
  }

  private generateJWT(): string {
    const now = Math.floor(Date.now() / 1000)
    const header = Buffer.from(JSON.stringify({ alg: "RS256", typ: "JWT" })).toString("base64url")
    const payload = Buffer.from(
      JSON.stringify({ iat: now - 60, exp: now + 600, iss: this.auth.appId })
    ).toString("base64url")
    const data = `${header}.${payload}`
    const sign = crypto.createSign("RSA-SHA256")
    sign.update(data)
    const sig = sign.sign(this.auth.privateKey, "base64url")
    return `${data}.${sig}`
  }

  private async getInstallationToken(): Promise<string> {
    if (this.installationToken && Date.now() < this.tokenExpiry) {
      return this.installationToken
    }
    const jwt = this.generateJWT()
    const installRes = await fetch(
      `https://api.github.com/orgs/${this.orgName}/installation`,
      { headers: { Authorization: `Bearer ${jwt}`, Accept: "application/vnd.github+json" } }
    )
    if (!installRes.ok) throw new Error(`GitHub: failed to get installation (${installRes.status})`)
    const install = await installRes.json() as { id: number }

    const tokenRes = await fetch(
      `https://api.github.com/app/installations/${install.id}/access_tokens`,
      { method: "POST", headers: { Authorization: `Bearer ${jwt}`, Accept: "application/vnd.github+json" } }
    )
    if (!tokenRes.ok) throw new Error(`GitHub: failed to get access token (${tokenRes.status})`)
    const tokenData = await tokenRes.json() as { token: string; expires_at: string }
    this.installationToken = tokenData.token
    this.tokenExpiry = new Date(tokenData.expires_at).getTime() - 60_000
    return this.installationToken
  }

  private async githubFetch(path: string, options: RequestInit = {}): Promise<Response> {
    const token = await this.getInstallationToken()
    return fetch(`https://api.github.com${path}`, {
      ...options,
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json",
        "Content-Type": "application/json",
        ...(options.headers ?? {}),
      },
    })
  }

  async createRepo(orgName: string, repoName: string): Promise<RepoCreationResult> {
    const res = await this.githubFetch(`/orgs/${orgName}/repos`, {
      method: "POST",
      body: JSON.stringify({ name: repoName, private: true, auto_init: false }),
    })
    if (!res.ok) throw new Error(`GitHub: failed to create repo (${res.status})`)
    return res.json() as Promise<RepoCreationResult>
  }

  async repoExists(orgName: string, repoName: string): Promise<boolean> {
    const res = await this.githubFetch(`/repos/${orgName}/${repoName}`)
    return res.status === 200
  }

  async pushTemplate(_repoName: string, _templatePath: string): Promise<void> {
    // Placeholder: in production, this would clone templatePath and push to repoName
  }

  async getBranchSHA(repoName: string, branch: string): Promise<string> {
    const res = await this.githubFetch(
      `/repos/${this.orgName}/${repoName}/git/ref/heads/${branch}`
    )
    if (!res.ok) throw new Error(`GitHub: failed to get branch SHA (${res.status})`)
    const data = await res.json() as { object: { sha: string } }
    return data.object.sha
  }

  async waitForCIPass(repoName: string, commitSHA: string, timeoutMs: number): Promise<void> {
    const deadline = Date.now() + timeoutMs
    while (Date.now() < deadline) {
      const res = await this.githubFetch(
        `/repos/${this.orgName}/${repoName}/commits/${commitSHA}/status`
      )
      if (res.ok) {
        const status = await res.json() as CommitStatusResult
        if (status.state === "success") return
        if (status.state === "failure" || status.state === "error") {
          throw new Error(`CI failed with state: ${status.state}`)
        }
      }
      await new Promise((r) => setTimeout(r, 10_000))
    }
    throw new Error("CI timed out")
  }

  async createDispatchEvent(repoName: string, eventType: string): Promise<void> {
    const res = await this.githubFetch(
      `/repos/${this.orgName}/${repoName}/dispatches`,
      { method: "POST", body: JSON.stringify({ event_type: eventType }) }
    )
    if (!res.ok) throw new Error(`GitHub: failed to create dispatch event (${res.status})`)
  }
}
