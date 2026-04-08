// app/history/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { getAnalyses } from '@/lib/storage'
import type { AnalysisResult } from '@/lib/types'

export default function HistoryPage() {
  const [analyses, setAnalyses] = useState<AnalysisResult[]>([])

  useEffect(() => {
    setAnalyses(getAnalyses())
  }, [])

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold">기록실</h1>
        <p className="text-foreground/40 text-sm mt-1">나의 성장 히스토리</p>
      </div>

      {analyses.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <p className="text-4xl mb-4">🎾</p>
          <p className="text-foreground/40">아직 분석 기록이 없습니다</p>
          <p className="text-foreground/30 text-sm mt-1">영상을 분석하면 여기에 기록이 쌓여요</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {analyses.map((a) => (
            <li key={a.id} className="glass-card p-5 flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm text-foreground/60">
                  {new Date(a.createdAt).toLocaleDateString('ko-KR', {
                    year: 'numeric', month: 'long', day: 'numeric'
                  })}
                </p>
                <p className="text-foreground/80 text-sm">
                  {a.praise[0] ?? '분석 완료'}
                </p>
              </div>
              <div className="flex items-center gap-3">
                {a.matchRecord.result && (
                  <span className={`text-xs px-3 py-1 rounded-full font-medium
                    ${a.matchRecord.result === 'win'
                      ? 'bg-accent/10 text-accent'
                      : 'bg-red-500/10 text-red-400'
                    }`}>
                    {a.matchRecord.result === 'win' ? '승' : '패'}
                  </span>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      <div className="glass-card p-6 text-center border border-accent/10">
        <p className="text-foreground/40 text-sm">레이더 차트 & 스트릭 배지는 Phase 2에서 추가됩니다</p>
      </div>
    </div>
  )
}
