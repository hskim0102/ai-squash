// lib/storage.ts
import type { AnalysisResult } from './types'

const STORAGE_KEY = 'squashvibe_analyses'

// 동일 id가 있으면 교체(upsert), 없으면 앞에 추가
export function saveAnalysis(result: AnalysisResult): void {
  const existing = getAnalyses()
  const filtered = existing.filter((a) => a.id !== result.id)
  const updated = [result, ...filtered]
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
}

export function getAnalyses(): AnalysisResult[] {
  if (typeof window === 'undefined') return []
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) return []
  try {
    const parsed = JSON.parse(raw) as AnalysisResult[]
    return parsed.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
  } catch {
    return []
  }
}

export function clearAnalyses(): void {
  localStorage.removeItem(STORAGE_KEY)
}
