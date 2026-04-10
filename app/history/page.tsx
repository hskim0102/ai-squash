'use client'

import { useEffect, useState } from 'react'
import { getAnalyses } from '@/lib/storage'
import { calcStreak } from '@/lib/streak'
import { SkillRadarChart } from '@/components/history/RadarChart'
import { StreakBadge } from '@/components/history/StreakBadge'
import { HistoryList } from '@/components/history/HistoryList'
import type { AnalysisResult, SkillScores } from '@/lib/types'

function avgSkills(analyses: AnalysisResult[]): SkillScores {
  const keys: (keyof SkillScores)[] = ['accuracy', 'power', 'activity']
  const sums = Object.fromEntries(keys.map((k) => [k, 0])) as unknown as SkillScores
  for (const a of analyses) {
    for (const k of keys) sums[k] += a.skills[k] ?? 0
  }
  const n = analyses.length
  return Object.fromEntries(keys.map((k) => [k, Math.round(sums[k] / n)])) as unknown as SkillScores
}

export default function HistoryPage() {
  const [analyses, setAnalyses] = useState<AnalysisResult[]>([])

  useEffect(() => {
    getAnalyses().then(setAnalyses)
  }, [])

  const hasData = analyses.length > 0
  const streak = hasData ? calcStreak(analyses.map((a) => a.createdAt)) : 0
  const skills = hasData ? avgSkills(analyses) : null

  return (
    <div className="max-w-4xl mx-auto space-y-6 md:space-y-8">
      <div>
        <h1 className="text-xl md:text-2xl font-bold">기록실</h1>
        <p className="text-foreground/40 text-sm mt-1">나의 성장 히스토리</p>
      </div>

      {hasData && (
        <>
          {/* Zone 1: Stats bar */}
          <div className="glass-card p-4 flex items-center justify-between flex-wrap gap-3">
            <p className="text-sm text-foreground/60">
              총 <span className="text-foreground font-semibold">{analyses.length}회</span> 분석
            </p>
            <StreakBadge streak={streak} />
          </div>

          {/* Zone 2: Radar chart */}
          {skills && (
            <div className="glass-card p-4 md:p-6">
              <h2 className="text-sm font-semibold text-foreground/60 mb-4">스킬 레이더</h2>
              <SkillRadarChart skills={skills} />
            </div>
          )}
        </>
      )}

      {/* Zone 3: History list */}
      <HistoryList analyses={analyses} />
    </div>
  )
}
