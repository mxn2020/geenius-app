export type LogLevel = "info" | "warn" | "error"

export interface JobContext {
  jobId: string
  projectId: string
  jobType: string
  log: (level: LogLevel, message: string) => Promise<void>
  convex: {
    query: <T>(fn: string, args: Record<string, unknown>) => Promise<T>
    mutation: <T>(fn: string, args: Record<string, unknown>) => Promise<T>
  }
}
