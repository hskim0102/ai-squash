// __tests__/lib/gemini.test.ts
import { describe, it, expect } from 'vitest'
import { buildPrompt } from '@/lib/gemini'
import type { MatchRecord } from '@/lib/types'

describe('buildPrompt', () => {
  it('승리 결과를 프롬프트에 포함한다', () => {
    const record: MatchRecord = { result: 'win', condition: 5, memo: '' }
    const prompt = buildPrompt(record)
    expect(prompt).toContain('승리')
    expect(prompt).toContain('컨디션: 5')
  })

  it('패배 결과를 프롬프트에 포함한다', () => {
    const record: MatchRecord = { result: 'lose', condition: 2, memo: '피로함' }
    const prompt = buildPrompt(record)
    expect(prompt).toContain('패배')
    expect(prompt).toContain('피로함')
  })

  it('경기 기록 없이도 프롬프트가 생성된다', () => {
    const record: MatchRecord = { result: null, condition: 3, memo: '' }
    const prompt = buildPrompt(record)
    expect(typeof prompt).toBe('string')
    expect(prompt.length).toBeGreaterThan(100)
  })

  it('JSON 형식 출력 지시가 포함된다', () => {
    const record: MatchRecord = { result: null, condition: 3, memo: '' }
    const prompt = buildPrompt(record)
    expect(prompt).toContain('JSON')
    expect(prompt).toContain('praise')
    expect(prompt).toContain('drills')
  })
})
