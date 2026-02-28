import type { JobType } from "@geenius/shared-types"

const MAX_RETRIES = 3
const RETRY_DELAY_MS = 1_000

export class JobQueueService {
  private queueUrl: string

  constructor(queueUrl: string) {
    this.queueUrl = queueUrl
  }

  async pushJob(jobId: string, type: JobType, projectId: string): Promise<void> {
    let lastError: Error | undefined
    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      try {
        const res = await fetch(`${this.queueUrl}/jobs`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ jobId, type, projectId }),
        })
        if (!res.ok) throw new Error(`JobQueue: dispatch failed with status ${res.status}`)
        return
      } catch (err) {
        lastError = err instanceof Error ? err : new Error(String(err))
        if (attempt < MAX_RETRIES - 1) {
          await new Promise((r) => setTimeout(r, RETRY_DELAY_MS * (attempt + 1)))
        }
      }
    }
    throw lastError
  }
}
