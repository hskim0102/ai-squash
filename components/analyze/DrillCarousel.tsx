// components/analyze/DrillCarousel.tsx
'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { DrillItem, DrillDifficulty } from '@/lib/types'

const DIFFICULTY_COLOR: Record<DrillDifficulty, string> = {
  '쉬움': 'bg-green-500/20 text-green-400',
  '보통': 'bg-yellow-500/20 text-yellow-400',
  '어려움': 'bg-red-500/20 text-red-400',
}

interface DrillCarouselProps {
  drills: DrillItem[]
  onSave: (drills: DrillItem[]) => void
}

export function DrillCarousel({ drills: initialDrills, onSave }: DrillCarouselProps) {
  const [drills, setDrills] = useState(initialDrills)
  const [current, setCurrent] = useState(0)

  function toggleComplete(index: number) {
    setDrills((prev) =>
      prev.map((d, i) => (i === index ? { ...d, completed: !d.completed } : d))
    )
  }

  const drill = drills[current]

  return (
    <div className="glass-card p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground/60 uppercase tracking-wider">
          오늘의 훈련 루틴
        </h3>
        <span className="text-xs text-foreground/40">
          {current + 1} / {drills.length}
        </span>
      </div>

      {/* 카드 */}
      <motion.div
        key={current}
        initial={{ opacity: 0, x: 30 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -30 }}
        transition={{ duration: 0.2 }}
        className="bg-glass border border-glass-border rounded-xl p-5 space-y-3"
      >
        <div className="flex items-start justify-between gap-2">
          <h4 className="font-semibold text-foreground">{drill.name}</h4>
          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${DIFFICULTY_COLOR[drill.difficulty]}`}>
            {drill.difficulty}
          </span>
        </div>
        <p className="text-sm text-foreground/60">⏱ {drill.duration}</p>
        <p className="text-sm text-foreground/70 leading-relaxed">{drill.description}</p>
        <button
          onClick={() => toggleComplete(current)}
          className={`w-full py-2.5 rounded-lg text-sm font-semibold transition-all
            ${drill.completed
              ? 'bg-green-500/20 text-green-400 border border-green-500/30'
              : 'bg-glass border border-glass-border hover:border-accent/40 text-foreground/70'
            }`}
        >
          {drill.completed ? <><span>완료!</span><span> ✓</span></> : '완료'}
        </button>
      </motion.div>

      {/* 네비게이션 */}
      <div className="flex gap-2">
        <button
          onClick={() => setCurrent((c) => Math.max(0, c - 1))}
          disabled={current === 0}
          className="flex-1 py-2 rounded-lg glass-card text-sm disabled:opacity-30 hover:border-white/20"
        >
          ← 이전
        </button>
        <button
          onClick={() => setCurrent((c) => Math.min(drills.length - 1, c + 1))}
          disabled={current === drills.length - 1}
          className="flex-1 py-2 rounded-lg glass-card text-sm disabled:opacity-30 hover:border-white/20"
        >
          다음 →
        </button>
      </div>

      {/* 인디케이터 */}
      <div className="flex justify-center gap-1.5">
        {drills.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`w-1.5 h-1.5 rounded-full transition-all
              ${i === current ? 'bg-accent w-4' : drills[i].completed ? 'bg-green-500' : 'bg-glass-border'}`}
          />
        ))}
      </div>

      {/* 저장 버튼 */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => onSave(drills)}
        className="w-full py-3 rounded-lg bg-accent/10 border border-accent/30 text-accent text-sm font-semibold hover:bg-accent/20 transition-colors"
        aria-label="루틴 저장"
      >
        루틴 저장 💾
      </motion.button>
    </div>
  )
}
