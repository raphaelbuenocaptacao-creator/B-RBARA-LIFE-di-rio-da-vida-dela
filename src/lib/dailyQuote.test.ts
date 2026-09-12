import { describe, expect, it } from 'vitest'
import { DAILY_QUOTES, getDailyQuote } from './dailyQuote'

describe('getDailyQuote', () => {
  it('returns the same phrase for the same calendar date', () => {
    const date = new Date(2026, 8, 12)
    expect(getDailyQuote(date)).toBe(getDailyQuote(new Date(2026, 8, 12)))
  })

  it('always returns a phrase from the curated list', () => {
    expect(DAILY_QUOTES).toContain(getDailyQuote(new Date(2026, 8, 13)))
  })
})
