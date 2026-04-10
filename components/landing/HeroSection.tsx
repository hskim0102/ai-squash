'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'

export function HeroSection() {
  return (
    <section className="flex flex-col items-center justify-center min-h-[80vh] text-center px-4">
      {/* 배지 */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-6 px-4 py-1.5 rounded-full border border-accent/40 text-accent text-xs font-semibold tracking-widest uppercase"
      >
        AI Powered Squash Coach
      </motion.div>

      {/* 헤드라인 */}
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="text-4xl sm:text-5xl md:text-7xl font-bold leading-tight mb-6"
      >
        당신의 랠리를
        <br />
        <span className="text-accent">데이터로 증명</span>하세요
      </motion.h1>

      {/* 서브텍스트 */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="text-foreground/50 text-base md:text-lg mb-10 max-w-sm md:max-w-md px-2"
      >
        경기 영상을 업로드하면 AI가 자세를 분석하고
        오늘 당장 연습할 훈련 루틴을 알려드립니다
      </motion.p>

      {/* CTA 버튼 */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, delay: 0.3 }}
      >
        <Link href="/analyze">
          <motion.button
            whileHover={{ scale: 1.05, boxShadow: '0 0 32px #D4FF0080' }}
            whileTap={{ scale: 0.97 }}
            className="bg-accent text-accent-foreground font-bold px-8 md:px-10 py-3 md:py-4 rounded-full text-base md:text-lg transition-all"
          >
            영상 분석 시작하기 →
          </motion.button>
        </Link>
      </motion.div>

      {/* 장식 공 */}
      <motion.div
        animate={{ y: [-8, 8, -8] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        className="mt-20 text-6xl select-none"
      >
        🎾
      </motion.div>
    </section>
  )
}
