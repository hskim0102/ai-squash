// app/api/analyze/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { buildPrompt } from '@/lib/gemini'
import type { AnalyzeApiResponse, MatchRecord } from '@/lib/types'

const DIFY_BASE_URL = process.env.DIFY_BASE_URL ?? 'https://api.dify.ai/v1'

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const videoFile = formData.get('video') as File
    const matchRecordRaw = formData.get('matchRecord') as string
    const matchRecord: MatchRecord = JSON.parse(matchRecordRaw)

    if (!videoFile) {
      return NextResponse.json({ error: '영상 파일이 필요합니다' }, { status: 400 })
    }

    const apiKey = process.env.DIFY_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: 'API 키가 설정되지 않았습니다' }, { status: 500 })
    }

    // 1. Dify 파일 업로드
    const uploadFormData = new FormData()
    uploadFormData.append('file', videoFile)
    uploadFormData.append('user', 'squashvibe-user')

    const uploadRes = await fetch(`${DIFY_BASE_URL}/files/upload`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}` },
      body: uploadFormData,
    })

    if (!uploadRes.ok) {
      const err = await uploadRes.json()
      return NextResponse.json({ error: `파일 업로드 실패: ${err.message ?? uploadRes.statusText}` }, { status: 500 })
    }

    const uploadData = await uploadRes.json()
    const uploadFileId: string = uploadData.id

    // 2. Dify 채팅으로 분석 요청
    const prompt = buildPrompt(matchRecord)

    const chatRes = await fetch(`${DIFY_BASE_URL}/chat-messages`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: {},
        query: prompt,
        files: [
          {
            type: 'video',
            transfer_method: 'local_file',
            upload_file_id: uploadFileId,
          },
        ],
        response_mode: 'blocking',
        user: 'squashvibe-user',
      }),
    })

    if (!chatRes.ok) {
      const err = await chatRes.json()
      return NextResponse.json({ error: `분석 요청 실패: ${err.message ?? chatRes.statusText}` }, { status: 500 })
    }

    const chatData = await chatRes.json()
    const raw: string = chatData.answer?.trim() ?? ''

    // 마크다운 코드블록 제거 후 JSON 추출
    const stripped = raw.replace(/```(?:json)?\s*/gi, '').replace(/```/g, '').trim()
    const jsonMatch = stripped.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      console.error('[/api/analyze] 파싱 실패. 원본 응답:', raw)
      return NextResponse.json({ error: 'AI 응답 파싱 실패' }, { status: 500 })
    }

    const analysisData: AnalyzeApiResponse = JSON.parse(jsonMatch[0])
    return NextResponse.json(analysisData)
  } catch (err) {
    console.error('[/api/analyze] error:', err)
    return NextResponse.json({ error: '분석 중 오류가 발생했습니다' }, { status: 500 })
  }
}
