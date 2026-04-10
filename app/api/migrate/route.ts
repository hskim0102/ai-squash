import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import type { AnalysisResult } from '@/lib/types'

export async function POST(req: NextRequest) {
  const {
    deviceId,
    analyses,
  }: { deviceId: string; analyses: AnalysisResult[] } = await req.json()

  if (!deviceId || !Array.isArray(analyses) || analyses.length === 0) {
    return NextResponse.json({ ok: true, migrated: 0 })
  }

  await prisma.analysis.createMany({
    data: analyses.map((a) => ({
      id: a.id,
      deviceId,
      createdAt: new Date(a.createdAt),
      matchRecord: a.matchRecord,
      praise: a.praise,
      improvements: a.improvements,
      drills: a.drills,
      skills: a.skills,
      videoPath: a.videoPath ?? null,
    })),
    skipDuplicates: true,
  })

  return NextResponse.json({ ok: true, migrated: analyses.length })
}
