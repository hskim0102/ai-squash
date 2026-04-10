'use client'

import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from 'recharts'
import type { SkillScores } from '@/lib/types'

interface Props {
  skills: SkillScores
}

const LABEL_MAP: Record<string, string> = {
  accuracy: '정확도',
  power: '파워',
  activity: '활동량',
}

export function SkillRadarChart({ skills }: Props) {
  const data = Object.entries(skills).map(([key, value]) => ({
    subject: LABEL_MAP[key] ?? key,
    value,
  }))

  return (
    <ResponsiveContainer width="100%" height={260}>
      <RadarChart data={data}>
        <PolarGrid stroke="rgba(13,27,46,0.15)" />
        <PolarAngleAxis dataKey="subject" tick={{ fill: '#0D1B2E', fontSize: 13, fontWeight: 600 }} />
        <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
        <Radar
          dataKey="value"
          stroke="#0D1B2E"
          strokeWidth={2}
          fill="#C8F000"
          fillOpacity={0.55}
        />
      </RadarChart>
    </ResponsiveContainer>
  )
}
