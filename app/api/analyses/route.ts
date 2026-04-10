import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import type { AnalysisResult } from '@/lib/types'

export async function GET(req: NextRequest) {
  const deviceId = req.headers.get('x-device-id')
  if (!deviceId) {
    return NextResponse.json({ error: 'device_id 없음' }, { status: 400 })
  }

  const rows = await prisma.analysis.findMany({
    where: { deviceId },
    orderBy: { createdAt: 'desc' },
  })

  const analyses: AnalysisResult[] = rows.map((row) => ({
    id: row.id,
    createdAt: row.createdAt.toISOString(),
    matchRecord: row.matchRecord as AnalysisResult['matchRecord'],
    praise: row.praise as string[],
    improvements: row.improvements as AnalysisResult['improvements'],
    drills: row.drills as AnalysisResult['drills'],
    skills: row.skills as AnalysisResult['skills'],
    videoPath: row.videoPath ?? undefined,
  }))

  return NextResponse.json({ analyses })
}
