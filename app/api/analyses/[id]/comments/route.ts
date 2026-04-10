import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

type Params = { params: { id: string } }

export async function GET(_req: NextRequest, { params }: Params) {
  const comments = await prisma.comment.findMany({
    where: { analysisId: params.id },
    orderBy: { createdAt: 'asc' },
    select: { id: true, author: true, content: true, createdAt: true },
  })
  return NextResponse.json(comments)
}

export async function POST(req: NextRequest, { params }: Params) {
  const body = await req.json()
  const content: string = (body.content ?? '').trim().slice(0, 500)
  const author: string = (body.author ?? '').trim().slice(0, 50) || '응원자'

  if (!content) {
    return NextResponse.json({ error: '내용을 입력해주세요' }, { status: 400 })
  }

  // analysisId 존재 확인
  const analysis = await prisma.analysis.findUnique({
    where: { id: params.id },
    select: { id: true },
  })
  if (!analysis) {
    return NextResponse.json({ error: '기록을 찾을 수 없습니다' }, { status: 404 })
  }

  const comment = await prisma.comment.create({
    data: { analysisId: params.id, author, content },
    select: { id: true, author: true, content: true, createdAt: true },
  })

  return NextResponse.json(comment, { status: 201 })
}
