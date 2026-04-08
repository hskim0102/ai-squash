// app/api/analyze/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { GoogleAIFileManager } from '@google/generative-ai/server'
import { writeFileSync, unlinkSync } from 'fs'
import path from 'path'
import os from 'os'
import { buildPrompt } from '@/lib/gemini'
import type { AnalyzeApiResponse, MatchRecord } from '@/lib/types'

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const videoFile = formData.get('video') as File
    const matchRecordRaw = formData.get('matchRecord') as string
    const matchRecord: MatchRecord = JSON.parse(matchRecordRaw)

    if (!videoFile) {
      return NextResponse.json({ error: '영상 파일이 필요합니다' }, { status: 400 })
    }

    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: 'API 키가 설정되지 않았습니다' }, { status: 500 })
    }

    // 영상을 OS 임시 디렉토리에 저장 (Windows 호환)
    const bytes = await videoFile.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const tmpPath = path.join(os.tmpdir(), `squash-${Date.now()}.mp4`)
    writeFileSync(tmpPath, buffer)

    // Gemini File API로 업로드
    const fileManager = new GoogleAIFileManager(apiKey)
    const uploadResult = await fileManager.uploadFile(tmpPath, {
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
      unlinkSync(tmpPath)
      return NextResponse.json({ error: '영상 처리에 실패했습니다' }, { status: 500 })
    }

    // 분석 요청
    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })
    const prompt = buildPrompt(matchRecord)

    const result = await model.generateContent([
      { fileData: { mimeType: geminiFile.mimeType, fileUri: geminiFile.uri } },
      { text: prompt },
    ])

    // 임시 파일 삭제
    unlinkSync(tmpPath)

    const text = result.response.text().trim()
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      return NextResponse.json({ error: 'AI 응답 파싱 실패' }, { status: 500 })
    }

    const analysisData: AnalyzeApiResponse = JSON.parse(jsonMatch[0])
    return NextResponse.json(analysisData)
  } catch (err) {
    console.error('[/api/analyze] error:', err)
    return NextResponse.json({ error: '분석 중 오류가 발생했습니다' }, { status: 500 })
  }
}
