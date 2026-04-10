'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { getAnalysis } from '@/lib/storage'
import { VideoPlayer } from '@/components/analyze/VideoPlayer'
import { FeedbackCard } from '@/components/analyze/FeedbackCard'
import { SkillRadarChart } from '@/components/history/RadarChart'
import { CommentSection } from '@/components/history/CommentSection'
import type { AnalysisResult } from '@/lib/types'

export default function HistoryDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [seekTo, setSeekTo] = useState<number | null>(null)

  useEffect(() => {
    getAnalysis(id).then((data) => {
      setResult(data)
      setLoading(false)
    })
  }, [id])

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto pt-8 text-center text-foreground/40">
        불러오는 중...
      </div>
    )
  }

  if (!result) {
    return (
      <div className="max-w-4xl mx-auto pt-8 text-center space-y-4">
        <p className="text-foreground/40">분석 기록을 찾을 수 없습니다</p>
        <button
          onClick={() => router.push('/history')}
          className="text-sm text-accent underline"
        >
          ← 기록실로 돌아가기
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 md:space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/history')}
            className="text-sm text-foreground/40 hover:text-foreground/70 transition-colors"
          >
            ← 기록실
          </button>
          <p className="text-foreground/60 text-sm">
            {new Date(result.createdAt).toLocaleDateString('ko-KR', {
              year: 'numeric', month: 'long', day: 'numeric',
            })}
          </p>
        </div>
        {result.matchRecord.result && (
          <span
            className={`text-xs px-3 py-1 rounded-full font-medium ${
              result.matchRecord.result === 'win'
                ? 'bg-accent/10 text-accent'
                : result.matchRecord.result === 'lose'
                ? 'bg-red-500/10 text-red-400'
                : ''
            }`}
          >
            {result.matchRecord.result === 'win' ? '승' : result.matchRecord.result === 'lose' ? '패' : ''}
          </span>
        )}
      </div>

      {/* Video */}
      {result.videoPath && (
        <VideoPlayer src={result.videoPath} seekTo={seekTo} />
      )}

      {/* Feedback */}
      <FeedbackCard
        praise={result.praise}
        improvements={result.improvements}
        onSeek={(s) => setSeekTo(s)}
      />

      {/* Drills */}
      <div className="glass-card p-4 md:p-6 space-y-4">
        <h2 className="text-sm font-semibold text-foreground/60">드릴 목록</h2>
        <ul className="space-y-3">
          {result.drills.map((drill, i) => (
            <li key={i} className="flex items-start gap-3">
              <span className={`mt-0.5 w-4 h-4 flex-shrink-0 rounded border ${
                drill.completed
                  ? 'bg-accent border-accent'
                  : 'border-glass-border'
              }`} />
              <div className="space-y-0.5 min-w-0">
                <p className="text-sm font-medium">{drill.name}</p>
                <p className="text-xs text-foreground/50">{drill.duration} · {drill.difficulty}</p>
                <p className="text-xs text-foreground/40">{drill.description}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Skill Radar */}
      <div className="glass-card p-4 md:p-6">
        <h2 className="text-sm font-semibold text-foreground/60 mb-4">스킬 레이더</h2>
        <SkillRadarChart skills={result.skills} />
      </div>

      {/* 응원 댓글 */}
      <CommentSection analysisId={id} />
    </div>
  )
}
