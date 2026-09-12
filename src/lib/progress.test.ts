import { describe, expect, it } from 'vitest'
import { calculateCompletionRate } from './progress'

describe('calculateCompletionRate', () => {
  it('returns zero when there are no goals', () => {
    expect(calculateCompletionRate(0, 0)).toBe(0)
  })

  it('returns a rounded percentage', () => {
    expect(calculateCompletionRate(4, 6)).toBe(67)
  })

  it('never exceeds one hundred', () => {
    expect(calculateCompletionRate(8, 6)).toBe(100)
  })
})
