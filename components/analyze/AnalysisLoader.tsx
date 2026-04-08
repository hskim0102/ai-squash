'use client'

import { motion } from 'framer-motion'

const messages = [
  '영상을 분석하고 있어요...',
  '자세를 살펴보는 중이에요...',
  '훈련 루틴을 준비하고 있어요...',
  '거의 다 됐어요!',
]

interface AnalysisLoaderProps {
  messageIndex?: number
}

export function AnalysisLoader({ messageIndex = 0 }: AnalysisLoaderProps) {
  const message = messages[messageIndex % messages.length]

  return (
    <div className="flex flex-col items-center justify-center py-20 gap-10">
      {/* 공 튀는 애니메이션 */}
      <div className="relative h-24 flex items-end justify-center">
        <motion.div
          animate={{ y: [0, -60, 0] }}
          transition={{
            duration: 0.7,
            repeat: Infinity,
            ease: ['easeIn', 'easeOut'],
          }}
          className="text-4xl select-none"
        >
          🎾
        </motion.div>
        {/* 그림자 */}
        <motion.div
          animate={{ scaleX: [1, 0.4, 1], opacity: [0.4, 0.15, 0.4] }}
          transition={{ duration: 0.7, repeat: Infinity }}
          className="absolute bottom-0 w-8 h-2 bg-accent/30 rounded-full blur-sm"
        />
      </div>

      {/* 메시지 */}
      <motion.p
        key={message}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-foreground/60 text-sm"
      >
        {message}
      </motion.p>

      {/* 점 로딩 */}
      <div className="flex gap-1.5">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            animate={{ opacity: [0.2, 1, 0.2] }}
            transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
            className="w-1.5 h-1.5 rounded-full bg-accent"
          />
        ))}
      </div>
    </div>
  )
}
