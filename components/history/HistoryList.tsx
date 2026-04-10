'use client'

import { useRouter } from 'next/navigation'
import type { AnalysisResult } from '@/lib/types'

interface Props {
  analyses: AnalysisResult[]
}

export function HistoryList({ analyses }: Props) {
  const router = useRouter()

  if (analyses.length === 0) {
    return (
      <div className="glass-card p-12 text-center">
        <p className="text-4xl mb-4">🎾</p>
        <p className="text-foreground/40">아직 분석 기록이 없습니다</p>
        <p className="text-foreground/30 text-sm mt-1">영상을 분석하면 여기에 기록이 쌓여요</p>
      </div>
    )
  }

  return (
    <ul className="space-y-3">
      {analyses.map((a) => (
        <li
          key={a.id}
          onClick={() => router.push(`/history/${a.id}`)}
          className="glass-card p-4 md:p-5 flex items-start md:items-center justify-between gap-3 hover:border-accent/30 cursor-pointer transition-colors"
        >
          <div className="space-y-1 min-w-0">
            <p className="text-xs md:text-sm text-foreground/60">
              {new Date(a.createdAt).toLocaleDateString('ko-KR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
            <p className="text-foreground/80 text-sm truncate">
              {a.praise[0] ?? '분석 완료'}
            </p>
          </div>
          <div className="flex-shrink-0 flex items-center gap-3">
            {a.matchRecord.result && (
              <span
                className={`text-xs px-3 py-1 rounded-full font-medium ${
                  a.matchRecord.result === 'win'
                    ? 'bg-accent/10 text-accent'
                    : 'bg-red-500/10 text-red-400'
                }`}
              >
                {a.matchRecord.result === 'win' ? '승' : '패'}
              </span>
            )}
          </div>
        </li>
      ))}
    </ul>
  )
}
