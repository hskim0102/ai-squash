'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'

const navItems = [
  { href: '/', label: '홈', icon: '🏠' },
  { href: '/analyze', label: '분석하기', icon: '🎬' },
  { href: '/history', label: '기록실', icon: '📋' },
]

function BrandLogo() {
  return (
    <div className="mb-10 px-2">
      {/* Lime dot + label */}
      <div className="flex items-center gap-2 mb-2">
        <span className="w-2.5 h-2.5 rounded-full bg-[#C8F000] flex-shrink-0 shadow-[0_0_8px_rgba(200,240,0,0.8)]" />
        <span className="text-white/50 text-xs font-semibold tracking-[0.15em] uppercase">AI Coach</span>
      </div>
      <div className="leading-tight">
        <span className="text-white/70 font-medium text-sm block">창연쌤의</span>
        <span className="text-[#C8F000] font-extrabold text-xl tracking-tight block leading-none">
          스쿼시 교실
        </span>
      </div>
      {/* Tin line */}
      <div className="mt-4 h-px w-full bg-gradient-to-r from-transparent via-[#CC3300]/70 to-transparent" />
    </div>
  )
}

function NavLinks({ pathname, onClose }: { pathname: string; onClose?: () => void }) {
  return (
    <nav className="flex flex-col gap-1.5">
      {navItems.map((item) => {
        const isActive = pathname === item.href
        return (
          <Link key={item.href} href={item.href} onClick={onClose}>
            <motion.div
              whileHover={{ x: 4 }}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm font-medium
                ${isActive
                  ? 'bg-[#C8F000] text-[#0D1B2E] shadow-[0_0_16px_rgba(200,240,0,0.4)]'
                  : 'text-white/55 hover:text-white hover:bg-white/8'
                }`}
            >
              <span className="text-base">{item.icon}</span>
              <span>{item.label}</span>
              {isActive && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[#0D1B2E]/40" />
              )}
            </motion.div>
          </Link>
        )
      })}
    </nav>
  )
}

export function Sidebar() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      {/* Desktop: 고정 사이드바 */}
      <aside
        className="hidden md:flex fixed left-0 top-0 h-screen w-56 flex-col py-8 px-4 z-40"
        style={{
          background: `linear-gradient(180deg, #0D1B2E 0%, #112036 100%)`,
          borderRight: '1px solid rgba(255,255,255,0.07)',
        }}
      >
        {/* Top accent line */}
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[#C8F000]/60 to-transparent" />

        <BrandLogo />
        <NavLinks pathname={pathname} />

        {/* Bottom section */}
        <div className="mt-auto px-2 space-y-3">
          <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
          <div className="flex items-center gap-2 px-1">
            <span className="text-xl">🎾</span>
            <div>
              <p className="text-white/30 text-[10px] leading-tight">함께 성장하는</p>
              <p className="text-white/50 text-xs font-medium">스쿼시의 즐거움</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile: 상단 헤더 바 */}
      <header
        className="md:hidden fixed top-0 left-0 right-0 h-14 flex items-center justify-between px-4 z-40"
        style={{
          background: 'rgba(13,27,46,0.97)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(255,255,255,0.07)',
        }}
      >
        {/* Top accent */}
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[#C8F000]/60 to-transparent" />

        <div className="flex items-center gap-2.5">
          <span className="w-2 h-2 rounded-full bg-[#C8F000] shadow-[0_0_6px_rgba(200,240,0,0.8)]" />
          <div className="leading-none">
            <span className="text-white/50 text-[10px] font-medium block">창연쌤의</span>
            <span className="text-[#C8F000] font-extrabold text-base leading-tight">스쿼시 교실</span>
          </div>
        </div>

        <button
          onClick={() => setIsOpen(true)}
          className="p-2 rounded-lg transition-colors"
          style={{ background: 'rgba(255,255,255,0.08)' }}
          aria-label="메뉴 열기"
        >
          <div className="flex flex-col gap-1.5 w-5">
            <span className="w-full h-0.5 bg-white/70 rounded block" />
            <span className="w-full h-0.5 bg-white/70 rounded block" />
            <span className="w-3 h-0.5 bg-white/70 rounded block" />
          </div>
        </button>
      </header>

      {/* Mobile: 드로어 */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              key="overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setIsOpen(false)}
              className="md:hidden fixed inset-0 bg-black/60 z-50"
            />
            <motion.aside
              key="drawer"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="md:hidden fixed left-0 top-0 h-screen w-64 flex flex-col py-8 px-4 z-50"
              style={{
                background: `linear-gradient(180deg, #0D1B2E 0%, #112036 100%)`,
                borderRight: '1px solid rgba(255,255,255,0.07)',
              }}
            >
              <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[#C8F000]/60 to-transparent" />

              <div className="flex items-start justify-between mb-10 px-2">
                <BrandLogo />
                <button
                  onClick={() => setIsOpen(false)}
                  className="mt-1 p-2 rounded-lg text-white/40 hover:text-white/70 text-lg leading-none transition-colors"
                  style={{ background: 'rgba(255,255,255,0.06)' }}
                  aria-label="메뉴 닫기"
                >
                  ✕
                </button>
              </div>
              <NavLinks pathname={pathname} onClose={() => setIsOpen(false)} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
