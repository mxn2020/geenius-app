import { describe, it, expect } from "vitest"
import { calculateCredits } from "./credits.js"

describe("calculateCredits", () => {
  it("calculates credits for gpt-4o", () => {
    // 1000 input tokens = 5 credits, 1000 output tokens = 15 credits
    expect(calculateCredits("gpt-4o", 1000, 1000)).toBe(20)
  })

  it("calculates credits for gpt-4o-mini", () => {
    // 1000 input = 0.15, 1000 output = 0.6, total = 0.75 → ceil = 1
    expect(calculateCredits("gpt-4o-mini", 1000, 1000)).toBe(1)
  })

  it("calculates credits for claude-3-5-sonnet", () => {
    // 1000 input = 3, 1000 output = 15, total = 18
    expect(calculateCredits("claude-3-5-sonnet", 1000, 1000)).toBe(18)
  })

  it("calculates credits for claude-3-haiku", () => {
    // 1000 input = 0.25, 1000 output = 1.25, total = 1.5 → ceil = 2
    expect(calculateCredits("claude-3-haiku", 1000, 1000)).toBe(2)
  })

  it("returns minimum of 1 credit for very small requests", () => {
    const result = calculateCredits("gpt-4o-mini", 10, 10)
    expect(result).toBeGreaterThanOrEqual(1)
  })

  it("handles zero tokens", () => {
    expect(calculateCredits("gpt-4o", 0, 0)).toBe(0)
  })

  it("correctly scales with larger token counts", () => {
    // 10000 input at gpt-4o: 10 * 5 = 50, 5000 output: 5 * 15 = 75, total = 125
    expect(calculateCredits("gpt-4o", 10000, 5000)).toBe(125)
  })
})
