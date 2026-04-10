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

function NavLinks({ pathname, onClose }: { pathname: string; onClose?: () => void }) {
  return (
    <nav className="flex flex-col gap-2">
      {navItems.map((item) => {
        const isActive = pathname === item.href
        return (
          <Link key={item.href} href={item.href} onClick={onClose}>
            <motion.div
              whileHover={{ x: 4 }}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-sm font-medium
                ${isActive
                  ? 'bg-accent text-accent-foreground glow-accent'
                  : 'text-foreground/60 hover:text-foreground hover:bg-glass'
                }`}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
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
      <aside className="hidden md:flex fixed left-0 top-0 h-screen w-56 glass-card border-r border-glass-border flex-col py-8 px-4 z-40">
        <div className="mb-10 px-2">
          <span className="text-accent font-bold text-xl tracking-tight">SquashVibe</span>
          <span className="text-foreground/40 text-sm block">AI Coach</span>
        </div>
        <NavLinks pathname={pathname} />
      </aside>

      {/* Mobile: 상단 헤더 바 */}
      <header className="md:hidden fixed top-0 left-0 right-0 h-14 bg-background/90 backdrop-blur-sm border-b border-glass-border flex items-center justify-between px-4 z-40">
        <div className="flex items-center gap-2">
          <span className="text-accent font-bold text-lg tracking-tight">SquashVibe</span>
          <span className="text-foreground/30 text-xs">AI Coach</span>
        </div>
        <button
          onClick={() => setIsOpen(true)}
          className="p-2 rounded-lg hover:bg-glass transition-colors"
          aria-label="메뉴 열기"
        >
          <div className="flex flex-col gap-1 w-5">
            <span className="w-full h-0.5 bg-foreground/70 rounded block" />
            <span className="w-full h-0.5 bg-foreground/70 rounded block" />
            <span className="w-3 h-0.5 bg-foreground/70 rounded block" />
          </div>
        </button>
      </header>

      {/* Mobile: 드로어 오버레이 */}
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
              className="md:hidden fixed left-0 top-0 h-screen w-64 bg-background border-r border-glass-border flex flex-col py-8 px-4 z-50"
            >
              <div className="flex items-center justify-between mb-10 px-2">
                <div>
                  <span className="text-accent font-bold text-xl tracking-tight">SquashVibe</span>
                  <span className="text-foreground/40 text-sm block">AI Coach</span>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 rounded-lg hover:bg-glass transition-colors text-foreground/50 text-lg leading-none"
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
