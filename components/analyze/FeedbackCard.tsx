'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import type { ImprovementItem } from '@/lib/types'

function parseTimestampToSeconds(ts: string): number {
  const [mm, ss] = ts.split(':').map(Number)
  return mm * 60 + ss
}

interface FeedbackCardProps {
  praise: string[]
  improvements: ImprovementItem[]
  onSeek: (seconds: number) => void
}

export function FeedbackCard({ praise, improvements, onSeek }: FeedbackCardProps) {
  const [tab, setTab] = useState<'praise' | 'improve'>('praise')

  return (
    <div className="glass-card p-6">
      {/* 탭 헤더 */}
      <div className="flex gap-2 mb-6">
        {(['praise', 'improve'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-5 py-2 rounded-full text-sm font-semibold transition-all
              ${tab === t
                ? t === 'praise'
                  ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                  : 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                : 'text-foreground/40 hover:text-foreground/70'
              }`}
          >
            {t === 'praise' ? '칭찬할 점' : '개선할 점'}
          </button>
        ))}
      </div>

      {/* 탭 내용 */}
      {tab === 'praise' ? (
        <motion.ul
          key="praise"
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-3"
        >
          {praise.map((item, i) => (
            <li key={i} className="flex gap-3 items-start">
              <span className="text-green-400 mt-0.5">✓</span>
              <span className="text-foreground/80 text-sm">{item}</span>
            </li>
          ))}
        </motion.ul>
      ) : (
        <motion.ul
          key="improve"
          initial={{ opacity: 0, x: 8 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-4"
        >
          {improvements.map((item, i) => (
            <li key={i} className="flex gap-3 items-start">
              <button
                onClick={() => onSeek(parseTimestampToSeconds(item.timestamp))}
                className="flex-shrink-0 px-2 py-0.5 rounded bg-accent/10 text-accent text-xs font-mono hover:bg-accent/20 transition-colors"
              >
                {item.timestamp}
              </button>
              <span className="text-foreground/80 text-sm">{item.message}</span>
            </li>
          ))}
        </motion.ul>
      )}
    </div>
  )
}
