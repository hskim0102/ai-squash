import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import type { AnalysisResult, DrillItem } from '@/lib/types'

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const deviceId = req.headers.get('x-device-id')
  if (!deviceId) {
    return NextResponse.json({ error: 'device_id 없음' }, { status: 400 })
  }

  const row = await prisma.analysis.findFirst({
    where: { id: params.id, deviceId },
  })
  if (!row) {
    return NextResponse.json({ error: '찾을 수 없음' }, { status: 404 })
  }

  const analysis: AnalysisResult = {
    id: row.id,
    createdAt: row.createdAt.toISOString(),
    matchRecord: row.matchRecord as AnalysisResult['matchRecord'],
    praise: row.praise as string[],
    improvements: row.improvements as AnalysisResult['improvements'],
    drills: row.drills as AnalysisResult['drills'],
    skills: row.skills as AnalysisResult['skills'],
    videoPath: row.videoPath ?? undefined,
  }

  return NextResponse.json(analysis)
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const deviceId = req.headers.get('x-device-id')
  if (!deviceId) {
    return NextResponse.json({ error: 'device_id 없음' }, { status: 400 })
  }

  const { drills }: { drills: DrillItem[] } = await req.json()

  const existing = await prisma.analysis.findFirst({
    where: { id: params.id, deviceId },
  })
  if (!existing) {
    return NextResponse.json({ error: '찾을 수 없음' }, { status: 404 })
  }

  await prisma.analysis.update({
    where: { id: params.id },
    data: { drills: drills as object[] },
  })

  return NextResponse.json({ ok: true })
}
