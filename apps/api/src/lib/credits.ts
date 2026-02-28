import type { AIModel } from "@geenius/shared-types"

const MODEL_CREDIT_RATES: Record<AIModel, { input: number; output: number }> = {
  "gpt-4o": { input: 5, output: 15 },
  "gpt-4o-mini": { input: 0.15, output: 0.6 },
  "claude-3-5-sonnet": { input: 3, output: 15 },
  "claude-3-haiku": { input: 0.25, output: 1.25 },
}

export function calculateCredits(
  model: AIModel,
  inputTokens: number,
  outputTokens: number
): number {
  const rates = MODEL_CREDIT_RATES[model]
  return Math.ceil(
    (inputTokens / 1000) * rates.input + (outputTokens / 1000) * rates.output
  )
}
