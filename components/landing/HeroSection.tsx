'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'

export function HeroSection() {
  return (
    <section className="relative flex flex-col items-center justify-center min-h-[80vh] text-center px-4 overflow-hidden">

      {/* Background decorative blobs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        <div
          className="absolute -top-32 -right-32 w-96 h-96 rounded-full opacity-20"
          style={{ background: 'radial-gradient(circle, #C8F000 0%, transparent 70%)' }}
        />
        <div
          className="absolute -bottom-32 -left-32 w-80 h-80 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #0D1B2E 0%, transparent 70%)' }}
        />
        {/* Court lines */}
        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-center">
          <div
            className="w-full max-w-3xl h-px opacity-10"
            style={{ background: 'linear-gradient(90deg, transparent, #0D1B2E 30%, #0D1B2E 70%, transparent)' }}
          />
        </div>
        {/* Tin line */}
        <div
          className="absolute bottom-[18%] left-1/2 -translate-x-1/2 w-full max-w-3xl h-0.5 opacity-20"
          style={{ background: 'linear-gradient(90deg, transparent, #CC3300 20%, #CC3300 80%, transparent)' }}
        />
      </div>

      {/* Badge */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative mb-6 inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase"
        style={{
          background: 'rgba(13,27,46,0.08)',
          border: '1px solid rgba(13,27,46,0.15)',
          color: '#0D1B2E',
        }}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-[#C8F000] shadow-[0_0_6px_rgba(200,240,0,1)]" />
        창연쌤의 AI 스쿼시 코치
      </motion.div>

      {/* Headline */}
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="relative text-4xl sm:text-5xl md:text-7xl font-extrabold leading-tight mb-6 text-[#0D1B2E]"
      >
        당신의 랠리를
        <br />
        <span
          className="relative inline-block"
          style={{
            background: 'linear-gradient(135deg, #0D1B2E 0%, #1a3a5c 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          데이터로 증명
          {/* Underline accent */}
          <span
            className="absolute -bottom-2 left-0 right-0 h-1.5 rounded-full"
            style={{ background: 'linear-gradient(90deg, #C8F000, #a8d000)' }}
          />
        </span>
        하세요
      </motion.h1>

      {/* Sub-text */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="relative text-[#4A6080] text-base md:text-lg mb-10 max-w-sm md:max-w-md px-2"
      >
        경기 영상을 업로드하면 AI가 자세를 분석하고
        오늘 당장 연습할 훈련 루틴을 알려드립니다
      </motion.p>

      {/* CTA */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, delay: 0.3 }}
        className="relative"
      >
        <Link href="/analyze">
          <motion.button
            whileHover={{ scale: 1.04, boxShadow: '0 8px 32px rgba(200,240,0,0.5), 0 0 0 2px rgba(200,240,0,0.3)' }}
            whileTap={{ scale: 0.97 }}
            className="font-extrabold px-9 md:px-12 py-4 md:py-5 rounded-2xl text-base md:text-lg transition-all"
            style={{
              background: 'linear-gradient(135deg, #C8F000 0%, #a8d400 100%)',
              color: '#0D1B2E',
              boxShadow: '0 4px 24px rgba(200,240,0,0.4)',
            }}
          >
            영상 분석 시작하기 →
          </motion.button>
        </Link>
      </motion.div>

      {/* Stats row */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="relative mt-14 flex items-center gap-2 md:gap-0"
      >
        {[
          { value: 'AI 분석', label: '영상 자동 분석' },
          { value: '맞춤 훈련', label: '개인별 드릴 제공' },
          { value: '기록 추적', label: '성장 히스토리' },
        ].map((stat, i) => (
          <div key={stat.label} className="flex items-center">
            <div className="text-center px-5 md:px-8">
              <p className="font-extrabold text-[#0D1B2E] text-base md:text-lg">{stat.value}</p>
              <p className="text-[#4A6080] text-xs mt-0.5">{stat.label}</p>
            </div>
            {i < 2 && (
              <div className="w-px h-8 bg-[#0D1B2E]/12" />
            )}
          </div>
        ))}
      </motion.div>

      {/* Floating ball */}
      <motion.div
        animate={{ y: [-6, 6, -6] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        className="mt-14 text-5xl select-none"
      >
        🎾
      </motion.div>
    </section>
  )
}
