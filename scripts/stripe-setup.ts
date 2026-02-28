import Stripe from "stripe"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-12-18.acacia",
})

const PRODUCTS = [
  { name: "Geenius Website", plan: "website", priceEur: 10 },
  { name: "Geenius Web App", plan: "webapp", priceEur: 20 },
  { name: "Geenius Web App + Auth + DB", plan: "authdb", priceEur: 30 },
  { name: "Geenius Web App + Auth + DB + AI", plan: "ai", priceEur: 40 },
]

async function main() {
  console.log("Creating Stripe products and prices...")
  for (const product of PRODUCTS) {
    const p = await stripe.products.create({ name: product.name })
    const price = await stripe.prices.create({
      product: p.id,
      unit_amount: product.priceEur * 100,
      currency: "eur",
      recurring: { interval: "month" },
    })
    console.log(`STRIPE_PRICE_${product.plan.toUpperCase()}=${price.id}`)
  }
}

main().catch(console.error)
