'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'

const navItems = [
  { href: '/', label: '홈', icon: '🏠' },
  { href: '/analyze', label: '분석하기', icon: '🎬' },
  { href: '/history', label: '기록실', icon: '📋' },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="fixed left-0 top-0 h-screen w-56 glass-card border-r border-glass-border flex flex-col py-8 px-4 z-40">
      {/* 로고 */}
      <div className="mb-10 px-2">
        <span className="text-accent font-bold text-xl tracking-tight">SquashVibe</span>
        <span className="text-foreground/40 text-sm block">AI Coach</span>
      </div>

      {/* 네비게이션 */}
      <nav className="flex flex-col gap-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link key={item.href} href={item.href}>
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
    </aside>
  )
}
