import type { ConvexHttpClient } from "convex/browser"
import { NamecheapService } from "../services/namecheap.js"
import { StripeService } from "../services/stripe.js"
import { env } from "../env.js"

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

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const domains = await convex.query("domains:listExpiring" as any, {
      beforeTimestamp: thirtyDaysFromNow,
    })

    if (!domains || domains.length === 0) {
      console.log("[renewalCron] no domains expiring within 30 days")
      return
    }

    const namecheap = new NamecheapService(
      env.NAMECHEAP_API_USER,
      env.NAMECHEAP_API_KEY,
      env.NAMECHEAP_CLIENT_IP
    )

    const stripe = new StripeService(env.STRIPE_SECRET_KEY)

    for (const domain of domains) {
      try {
        // Get renewal price
        const priceCents = await namecheap.getPrice(domain.domainName)

        // Charge the project owner via Stripe
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const project = await convex.query("projects:workerGetProject" as any, { id: domain.projectId })
        if (!project) {
          console.warn(`[renewalCron] project ${domain.projectId} not found for domain ${domain.domainName}`)
          continue
        }

        // Create and confirm PaymentIntent
        const intent = await stripe.createPaymentIntent(priceCents, "eur", {
          type: "domain_renewal",
          domainName: domain.domainName,
          projectId: String(domain.projectId),
        })

        // Verify payment succeeded
        const confirmedIntent = await stripe.getPaymentIntent(intent.id)
        if (confirmedIntent.status !== "succeeded" && confirmedIntent.status !== "requires_capture") {
          console.warn(
            `[renewalCron] payment not confirmed for domain ${domain.domainName} (status: ${confirmedIntent.status})`
          )
          continue
        }

        // Renew the domain only after payment is confirmed
        await namecheap.renewDomain(domain.domainName)

        // Update renewal date in Convex (1 year from current renewal)
        const newRenewalDate = (domain.renewalDate ?? Date.now()) + 365 * 24 * 60 * 60 * 1000
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await convex.mutation("domains:updateDomainRenewal" as any, {
          id: domain._id,
          renewalDate: newRenewalDate,
          renewalPriceCents: priceCents,
        })

        console.log(`[renewalCron] renewed domain ${domain.domainName}`)
      } catch (err) {
        console.error(`[renewalCron] failed to renew ${domain.domainName}:`, err)
      }
    }
  } catch (err) {
    console.error("[renewalCron] check failed:", err)
  }

  console.log("[renewalCron] done")
}
