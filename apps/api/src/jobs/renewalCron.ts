import type { ConvexHttpClient } from "convex/browser"

export function startRenewalCron(convex: ConvexHttpClient): NodeJS.Timeout {
  function scheduleNextRun(): NodeJS.Timeout {
    const now = new Date()
    const nextRun = new Date()
    nextRun.setUTCHours(2, 0, 0, 0)
    if (nextRun <= now) {
      nextRun.setUTCDate(nextRun.getUTCDate() + 1)
    }
    const delay = nextRun.getTime() - now.getTime()
    return setTimeout(() => {
      runRenewalCheck(convex).catch(console.error)
      scheduleNextRun()
    }, delay)
  }

  return scheduleNextRun()
}

async function runRenewalCheck(convex: ConvexHttpClient): Promise<void> {
  console.log("[renewalCron] checking for domain renewals...")
  const thirtyDaysFromNow = Date.now() + 30 * 24 * 60 * 60 * 1000

  // In production: query Convex for domains where renewalDate <= thirtyDaysFromNow,
  // then for each: charge via Stripe, call namecheap.renewDomain, update renewalDate
  void thirtyDaysFromNow
  void convex
  console.log("[renewalCron] done")
}
