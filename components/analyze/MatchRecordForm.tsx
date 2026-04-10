'use client'

import { useState } from 'react'
import type { MatchRecord, MatchResult } from '@/lib/types'

const CONDITION_EMOJI = ['', '😴', '😪', '😊', '😄', '🔥']

interface MatchRecordFormProps {
  onChange: (record: MatchRecord) => void
}

export function MatchRecordForm({ onChange }: MatchRecordFormProps) {
  const [result, setResult] = useState<MatchResult>(null)
  const [condition, setCondition] = useState(3)
  const [memo, setMemo] = useState('')

  function update(patch: Partial<MatchRecord>) {
    const next = {
      result: patch.result !== undefined ? patch.result : result,
      condition: patch.condition !== undefined ? patch.condition : condition,
      memo: patch.memo !== undefined ? patch.memo : memo,
    }
    if (patch.result !== undefined) setResult(patch.result)
    if (patch.condition !== undefined) setCondition(patch.condition)
    if (patch.memo !== undefined) setMemo(patch.memo)
    onChange(next)
  }

  return (
    <div className="glass-card p-4 md:p-6 space-y-5 md:space-y-6">
      <h3 className="text-sm font-semibold text-foreground/60 uppercase tracking-wider">
        경기 기록 <span className="text-foreground/30">(선택)</span>
      </h3>

      {/* 승/패 토글 */}
      <div className="flex gap-3">
        {(['win', 'lose'] as const).map((r) => (
          <button
            key={r}
            onClick={() => update({ result: result === r ? null : r })}
            className={`flex-1 py-3 rounded-lg font-semibold text-sm transition-all
              ${result === r
                ? r === 'win'
                  ? 'bg-accent text-accent-foreground glow-accent'
                  : 'bg-red-500/80 text-white'
                : 'glass-card hover:border-white/20'
              }`}
          >
            {r === 'win' ? '🏆 승리' : '💪 패배'}
          </button>
        ))}
      </div>

      {/* 컨디션 슬라이더 */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-sm text-foreground/60">컨디션</span>
          <span className="text-2xl">{CONDITION_EMOJI[condition]}</span>
        </div>
        <input
          type="range"
          min={1}
          max={5}
          value={condition}
          onChange={(e) => update({ condition: Number(e.target.value) })}
          className="w-full accent-[#D4FF00]"
        />
        <div className="flex justify-between text-xs text-foreground/30">
          <span>최악</span>
          <span>최고</span>
        </div>
      </div>

      {/* 메모 */}
      <textarea
        placeholder="오늘 경기에서 신경 쓰인 점이 있나요? (선택)"
        value={memo}
        onChange={(e) => update({ memo: e.target.value })}
        rows={3}
        className="w-full bg-glass border border-glass-border rounded-lg px-4 py-3 text-sm text-foreground placeholder:text-foreground/30 resize-none focus:outline-none focus:border-accent/40"
      />
    </div>
  )
}
