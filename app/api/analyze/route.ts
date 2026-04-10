import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { GoogleAIFileManager } from '@google/generative-ai/server'
import { writeFileSync, mkdirSync } from 'fs'
import path from 'path'
import { buildPrompt } from '@/lib/gemini'
import { prisma } from '@/lib/prisma'
import type { AnalyzeApiResponse, MatchRecord } from '@/lib/types'

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const videoFile = formData.get('video') as File
    const matchRecordRaw = formData.get('matchRecord') as string
    const deviceId = (formData.get('deviceId') as string) || 'unknown'
    const matchRecord: MatchRecord = JSON.parse(matchRecordRaw)

    if (!videoFile) {
      return NextResponse.json({ error: '영상 파일이 필요합니다' }, { status: 400 })
    }

    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: 'API 키가 설정되지 않았습니다' }, { status: 500 })
    }

    // 분석 ID 생성
    const analysisId = crypto.randomUUID()

    // 영상을 public/uploads/{deviceId}/{analysisId}.{ext} 에 영구 저장
    const ext = (videoFile.type.split('/')[1] ?? 'mp4').split(';')[0]
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', deviceId)
    mkdirSync(uploadDir, { recursive: true })
    const videoFilename = `${analysisId}.${ext}`
    const videoAbsPath = path.join(uploadDir, videoFilename)
    const videoPublicPath = `/uploads/${deviceId}/${videoFilename}`

    const bytes = await videoFile.arrayBuffer()
    writeFileSync(videoAbsPath, Buffer.from(bytes))

    // Gemini File API로 업로드 (저장된 파일 사용)
    const fileManager = new GoogleAIFileManager(apiKey)
    const uploadResult = await fileManager.uploadFile(videoAbsPath, {
      mimeType: videoFile.type || 'video/mp4',
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

    if (geminiFile.state === 'FAILED') {
      return NextResponse.json({ error: '영상 처리에 실패했습니다' }, { status: 500 })
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

    const analysisData = JSON.parse(jsonMatch[0])

    // MySQL 저장
    await prisma.analysis.create({
      data: {
        id: analysisId,
        deviceId,
        matchRecord: matchRecord as object,
        praise: analysisData.praise,
        improvements: analysisData.improvements,
        drills: analysisData.drills,
        skills: analysisData.skills,
        videoPath: videoPublicPath,
      },
    })

    const response: AnalyzeApiResponse = {
      id: analysisId,
      praise: analysisData.praise,
      improvements: analysisData.improvements,
      drills: analysisData.drills,
      skills: analysisData.skills,
      videoPath: videoPublicPath,
    }

    return NextResponse.json(response)
  } catch (err) {
    console.error('[/api/analyze] error:', err)
    return NextResponse.json({ error: '분석 중 오류가 발생했습니다' }, { status: 500 })
  }
}
