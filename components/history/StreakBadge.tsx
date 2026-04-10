'use client'

interface Props {
  streak: number
}

interface BadgeConfig {
  emoji: string
  label: string
  className: string
}

function getBadge(streak: number): BadgeConfig | null {
  if (streak >= 30) return {
    emoji: '🔥🔥🔥',
    label: '30일 연속',
    className: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
  }
  if (streak >= 7) return {
    emoji: '🔥🔥',
    label: '7일 연속',
    className: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
  }
  if (streak >= 3) return {
    emoji: '🔥',
    label: '3일 연속',
    className: 'bg-accent/20 text-accent border-accent/30',
  }
  return null
}

export function StreakBadge({ streak }: Props) {
  const badge = getBadge(streak)
  if (!badge) return null

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium border ${badge.className}`}
    >
      {badge.emoji} {badge.label}
    </span>
  )
}
