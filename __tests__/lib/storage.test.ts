// __tests__/lib/storage.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { saveAnalysis, getAnalyses, clearAnalyses } from '@/lib/storage'
import type { AnalysisResult } from '@/lib/types'

const mockAnalysis: AnalysisResult = {
  id: 'test-id-1',
  createdAt: '2026-04-07T00:00:00.000Z',
  matchRecord: { result: 'win', condition: 4, memo: '좋은 경기' },
  praise: ['서브가 정확했어요'],
  improvements: [{ timestamp: '00:15', message: '백핸드 개선 필요' }],
  drills: [{ name: '섀도우 연습', duration: '10분', difficulty: '보통', description: '기본기 훈련', completed: false }],
  skills: { accuracy: 70, power: 65, activity: 80 },
}

describe('storage', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('분석 결과를 저장하고 불러온다', () => {
    saveAnalysis(mockAnalysis)
    const results = getAnalyses()
    expect(results).toHaveLength(1)
    expect(results[0].id).toBe('test-id-1')
  })

  it('여러 분석 결과를 최신순으로 반환한다', () => {
    const older = { ...mockAnalysis, id: 'old', createdAt: '2026-04-01T00:00:00.000Z' }
    const newer = { ...mockAnalysis, id: 'new', createdAt: '2026-04-07T00:00:00.000Z' }
    saveAnalysis(older)
    saveAnalysis(newer)
    const results = getAnalyses()
    expect(results[0].id).toBe('new')
    expect(results[1].id).toBe('old')
  })

  it('clearAnalyses는 모든 기록을 삭제한다', () => {
    saveAnalysis(mockAnalysis)
    clearAnalyses()
    expect(getAnalyses()).toHaveLength(0)
  })

  it('같은 id로 저장하면 중복 없이 교체된다', () => {
    saveAnalysis(mockAnalysis)
    const updated = { ...mockAnalysis, praise: ['업데이트됨'] }
    saveAnalysis(updated)
    const results = getAnalyses()
    expect(results).toHaveLength(1)
    expect(results[0].praise[0]).toBe('업데이트됨')
  })
})
