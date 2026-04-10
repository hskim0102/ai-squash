import { describe, it, expect } from 'vitest'
import { calcStreak } from '../streak'

function dateStr(daysAgo: number): string {
  const d = new Date()
  d.setDate(d.getDate() - daysAgo)
  d.setHours(12, 0, 0, 0)
  return d.toISOString()
}

describe('calcStreak', () => {
  it('returns 0 for empty array', () => {
    expect(calcStreak([])).toBe(0)
  })

  it('returns 1 if only today has upload', () => {
    expect(calcStreak([dateStr(0)])).toBe(1)
  })

  it('returns 1 if only yesterday has upload', () => {
    expect(calcStreak([dateStr(1)])).toBe(1)
  })

  it('returns 0 if only two days ago has upload', () => {
    expect(calcStreak([dateStr(2)])).toBe(0)
  })

  it('returns 3 for consecutive 3-day streak ending today', () => {
    expect(calcStreak([dateStr(0), dateStr(1), dateStr(2)])).toBe(3)
  })

  it('returns 2 for consecutive 2-day streak ending yesterday', () => {
    expect(calcStreak([dateStr(1), dateStr(2)])).toBe(2)
  })

  it('ignores gap days', () => {
    expect(calcStreak([dateStr(0), dateStr(2)])).toBe(1)
  })

  it('counts correctly with duplicates in same day', () => {
    expect(calcStreak([dateStr(0), dateStr(0), dateStr(1)])).toBe(2)
  })
})
