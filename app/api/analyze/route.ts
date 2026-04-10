import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { GoogleAIFileManager } from '@google/generative-ai/server'
import { mkdir, writeFile } from 'fs/promises'
import path from 'path'
import { buildPrompt } from '@/lib/gemini'
import { prisma } from '@/lib/prisma'
import type { Prisma } from '@prisma/client'
import type { AnalyzeApiResponse, MatchRecord, ImprovementItem, DrillItem, SkillScores } from '@/lib/types'

const ALLOWED_MIME_TYPES = ['video/mp4', 'video/quicktime', 'video/webm', 'video/x-msvideo']
const ALLOWED_EXTENSIONS = ['mp4', 'mov', 'webm', 'avi']

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const videoFile = formData.get('video') as File
    const matchRecordRaw = formData.get('matchRecord') as string
    const rawDeviceId = (formData.get('deviceId') as string) || 'unknown'

    // Fix 1: Sanitize deviceId to prevent path traversal
    const deviceId = rawDeviceId.replace(/[^a-zA-Z0-9_-]/g, '_')
    const uploadBase = path.join(process.cwd(), 'public', 'uploads')
    const uploadDir = path.join(uploadBase, deviceId)
    if (!uploadDir.startsWith(uploadBase)) {
      return NextResponse.json({ error: '잘못된 요청입니다' }, { status: 400 })
    }

    // Fix 2: Guard on videoFile before JSON.parse
    if (!videoFile) {
      return NextResponse.json({ error: '영상 파일이 필요합니다' }, { status: 400 })
    }

    // Fix 2: Parse matchRecord after guard, wrapped in try/catch for 400
    let matchRecord: MatchRecord
    try {
      matchRecord = JSON.parse(matchRecordRaw)
    } catch {
      return NextResponse.json({ error: '매치 기록 형식이 올바르지 않습니다' }, { status: 400 })
    }

    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: 'API 키가 설정되지 않았습니다' }, { status: 500 })
    }

    // 분석 ID 생성
    const analysisId = crypto.randomUUID()

    // Fix 6: Restrict MIME type to allowlist
    const mimeType = ALLOWED_MIME_TYPES.includes(videoFile.type) ? videoFile.type : 'video/mp4'

    // Fix 7: Restrict file extension to allowlist
    const rawExt = (videoFile.type.split('/')[1] ?? 'mp4').split(';')[0]
    const ext = ALLOWED_EXTENSIONS.includes(rawExt) ? rawExt : 'mp4'

    // Fix 3: Replace sync fs calls with async fs/promises
    await mkdir(uploadDir, { recursive: true })
    const videoFilename = `${analysisId}.${ext}`
    const videoAbsPath = path.join(uploadDir, videoFilename)
    const videoPublicPath = `/uploads/${deviceId}/${videoFilename}`

    const bytes = await videoFile.arrayBuffer()
    await writeFile(videoAbsPath, Buffer.from(bytes))

    // Gemini File API로 업로드 (저장된 파일 사용)
    const fileManager = new GoogleAIFileManager(apiKey)
    const uploadResult = await fileManager.uploadFile(videoAbsPath, {
      mimeType,
      displayName: 'squash-analysis',
    })

    // 파일 처리 대기
    let geminiFile = await fileManager.getFile(uploadResult.file.name)
    let attempts = 0
    while (geminiFile.state === 'PROCESSING' && attempts < 30) {
      await new Promise((r) => setTimeout(r, 2000))
      geminiFile = await fileManager.getFile(uploadResult.file.name)
      attempts++
    }

    // Fix 4: Check state after loop exhaustion, not only FAILED
    if (geminiFile.state === 'FAILED') {
      return NextResponse.json({ error: '영상 처리에 실패했습니다' }, { status: 500 })
    }
    if (geminiFile.state !== 'ACTIVE') {
      return NextResponse.json({ error: '영상 처리 시간이 초과되었습니다' }, { status: 500 })
    }

    // Gemini 분석 요청
    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({ model: 'gemini-flash-lite-latest' })
    const prompt = buildPrompt(matchRecord)

    const result = await model.generateContent([
      { fileData: { mimeType: geminiFile.mimeType, fileUri: geminiFile.uri } },
      { text: prompt },
    ])

    const text = result.response.text().trim()
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      return NextResponse.json({ error: 'AI 응답 파싱 실패' }, { status: 500 })
    }

    let analysisData: Record<string, unknown>
    try {
      analysisData = JSON.parse(jsonMatch[0])
    } catch {
      return NextResponse.json({ error: 'AI 응답 파싱 실패' }, { status: 500 })
    }

    // Fix 5: Validate AI response fields
    if (
      !Array.isArray(analysisData.praise) ||
      !Array.isArray(analysisData.improvements) ||
      !Array.isArray(analysisData.drills) ||
      typeof analysisData.skills !== 'object' ||
      analysisData.skills === null
    ) {
      return NextResponse.json({ error: 'AI 응답 형식이 올바르지 않습니다' }, { status: 500 })
    }

    const praise = analysisData.praise as string[]
    const improvements = analysisData.improvements as ImprovementItem[]
    const drills = analysisData.drills as Omit<DrillItem, 'completed'>[]
    const skills = analysisData.skills as SkillScores

    // MySQL 저장
    await prisma.analysis.create({
      data: {
        id: analysisId,
        deviceId,
        matchRecord: matchRecord as unknown as Prisma.InputJsonValue,
        praise: praise as unknown as Prisma.InputJsonValue,
        improvements: improvements as unknown as Prisma.InputJsonValue,
        drills: drills as unknown as Prisma.InputJsonValue,
        skills: skills as unknown as Prisma.InputJsonValue,
        videoPath: videoPublicPath,
      },
    })

    const response: AnalyzeApiResponse = {
      id: analysisId,
      praise,
      improvements,
      drills,
      skills,
      videoPath: videoPublicPath,
    }

    return NextResponse.json(response)
  } catch (err) {
    console.error('[/api/analyze] error:', err)
    return NextResponse.json({ error: '분석 중 오류가 발생했습니다' }, { status: 500 })
  }
}
