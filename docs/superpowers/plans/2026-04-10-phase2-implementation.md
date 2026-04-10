# Phase 2 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** localStorage를 MySQL(Prisma)로 교체하고, 영상 파일을 로컬에 저장하며, `/history` 레이더 차트·스트릭 배지·상세 페이지를 추가한다.

**Architecture:** Prisma + MySQL(localhost:3306/aisquash)이 단일 데이터 소스. `device_id`(localStorage UUID)로 익명 사용자 구분. 영상은 `public/uploads/{deviceId}/{id}.ext`에 영구 저장. 클라이언트 데이터 접근은 모두 API Route 경유.

**Tech Stack:** Prisma 5, MySQL, recharts (기 설치), Next.js 14 App Router, Vitest

---

## 파일 맵

### 신규 생성
```
prisma/schema.prisma
lib/prisma.ts
lib/deviceId.ts          + lib/deviceId.test.ts
lib/streak.ts            + lib/streak.test.ts
app/api/analyses/route.ts
app/api/analyses/[id]/route.ts
app/api/migrate/route.ts
app/history/[id]/page.tsx
components/ClientProvider.tsx
components/history/RadarChart.tsx
components/history/StreakBadge.tsx
components/history/HistoryList.tsx
```

### 수정
```
lib/types.ts             — videoPath 추가, AnalyzeApiResponse에 id 추가
lib/storage.ts           — 전면 재작성 (async API 호출)
app/api/analyze/route.ts — 영상 저장 + DB 저장 추가
app/analyze/page.tsx     — saveAnalysis 제거, updateDrills 사용
app/history/page.tsx     — 3-zone 레이아웃
app/layout.tsx           — ClientProvider 래핑
next.config.mjs          — Prisma external packages
.gitignore               — public/uploads/ 추가
.env.local               — DATABASE_URL 추가
```

---

## Task 1: Prisma + MySQL 설치 및 스키마

**Files:**
- Create: `prisma/schema.prisma`
- Modify: `.env.local`

- [ ] **Step 1: Prisma 설치**

```bash
npm install prisma @prisma/client
npx prisma init --datasource-provider mysql
```

Expected: `prisma/schema.prisma`, `prisma/.env` 생성됨.  
`prisma/.env`는 무시 — `.env.local`에 설정할 것.

- [ ] **Step 2: .env.local에 DATABASE_URL 추가**

`.env.local`에 아래 줄 추가:
```
DATABASE_URL="mysql://root:root@localhost:3306/aisquash"
```

- [ ] **Step 3: schema.prisma 작성**

`prisma/schema.prisma` 전체 내용을 아래로 교체:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}

model Analysis {
  id           String   @id @default(uuid())
  deviceId     String
  createdAt    DateTime @default(now())
  matchRecord  Json
  praise       Json
  improvements Json
  drills       Json
  skills       Json
  videoPath    String?

  @@index([deviceId, createdAt])
}
```

- [ ] **Step 4: MySQL DB 생성 및 마이그레이션**

```bash
mysql -u root -proot -e "CREATE DATABASE IF NOT EXISTS aisquash;"
npx prisma migrate dev --name init
```

Expected 마지막 줄: `Your database is now in sync with your schema.`

- [ ] **Step 5: Prisma 클라이언트 생성 확인**

```bash
npx prisma generate
```

Expected: `Generated Prisma Client`

- [ ] **Step 6: Commit**

```bash
git add prisma/ package.json package-lock.json
git commit -m "feat: add Prisma schema for MySQL (localhost:3306/aisquash)"
```

---

## Task 2: lib/prisma.ts + lib/types.ts + next.config.mjs

**Files:**
- Create: `lib/prisma.ts`
- Modify: `lib/types.ts`, `next.config.mjs`

- [ ] **Step 1: lib/prisma.ts 생성**

```ts
import { PrismaClient } from '@prisma/client'

const globalForPrisma = global as unknown as { prisma: PrismaClient }

export const prisma =
  globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
```

- [ ] **Step 2: lib/types.ts 수정**

`AnalysisResult`에 `videoPath` 추가, `AnalyzeApiResponse`에 `id`와 `videoPath` 추가:

```ts
// lib/types.ts

export type MatchResult = 'win' | 'lose' | null

export interface MatchRecord {
  result: MatchResult
  condition: number
  memo: string
}

export interface ImprovementItem {
  timestamp: string
  message: string
}

export type DrillDifficulty = '쉬움' | '보통' | '어려움'

export interface DrillItem {
  name: string
  duration: string
  difficulty: DrillDifficulty
  description: string
  completed: boolean
}

export interface SkillScores {
  accuracy: number
  power: number
  activity: number
}

export interface AnalysisResult {
  id: string
  createdAt: string
  matchRecord: MatchRecord
  praise: string[]
  improvements: ImprovementItem[]
  drills: DrillItem[]
  skills: SkillScores
  videoPath?: string          // /uploads/{deviceId}/{id}.ext
}

export interface AnalyzeRequestBody {
  videoBase64: string
  videoMimeType: string
  matchRecord: MatchRecord
}

export interface AnalyzeApiResponse {
  id: string                  // 서버에서 생성한 DB ID
  praise: string[]
  improvements: ImprovementItem[]
  drills: Omit<DrillItem, 'completed'>[]
  skills: SkillScores
  videoPath?: string
}
```

- [ ] **Step 3: next.config.mjs 수정**

```js
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client', 'prisma'],
  },
}

export default nextConfig
```

- [ ] **Step 4: Commit**

```bash
git add lib/prisma.ts lib/types.ts next.config.mjs
git commit -m "feat: add Prisma singleton, update types for DB persistence"
```

---

## Task 3: lib/deviceId.ts (TDD)

**Files:**
- Create: `lib/deviceId.ts`, `lib/deviceId.test.ts`

- [ ] **Step 1: 실패 테스트 작성**

`lib/deviceId.test.ts`:

```ts
import { describe, it, expect, beforeEach } from 'vitest'
import { getDeviceId } from './deviceId'

describe('getDeviceId', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('생성된 ID가 UUID 형식이다', () => {
    const id = getDeviceId()
    expect(id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    )
  })

  it('두 번 호출해도 같은 ID를 반환한다', () => {
    expect(getDeviceId()).toBe(getDeviceId())
  })

  it('localStorage에 저장한다', () => {
    const id = getDeviceId()
    expect(localStorage.getItem('device_id')).toBe(id)
  })

  it('기존 device_id가 있으면 그것을 반환한다', () => {
    localStorage.setItem('device_id', 'existing-id-123')
    expect(getDeviceId()).toBe('existing-id-123')
  })
})
```

- [ ] **Step 2: 실패 확인**

```bash
npx vitest run lib/deviceId.test.ts
```

Expected: FAIL — `getDeviceId is not a function`

- [ ] **Step 3: 구현**

`lib/deviceId.ts`:

```ts
export function getDeviceId(): string {
  const existing = localStorage.getItem('device_id')
  if (existing) return existing
  const id = crypto.randomUUID()
  localStorage.setItem('device_id', id)
  return id
}
```

- [ ] **Step 4: 통과 확인**

```bash
npx vitest run lib/deviceId.test.ts
```

Expected: 4 tests PASS

- [ ] **Step 5: Commit**

```bash
git add lib/deviceId.ts lib/deviceId.test.ts
git commit -m "feat: add device ID management (localStorage UUID)"
```

---

## Task 4: GET /api/analyses

**Files:**
- Create: `app/api/analyses/route.ts`

- [ ] **Step 1: route.ts 생성**

```ts
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
```

- [ ] **Step 2: 동작 확인 (개발 서버 실행 후)**

```bash
curl -H "x-device-id: test-device" http://localhost:3000/api/analyses
```

Expected: `{"analyses":[]}`

- [ ] **Step 3: Commit**

```bash
git add app/api/analyses/route.ts
git commit -m "feat: add GET /api/analyses"
```

---

## Task 5: GET + PATCH /api/analyses/[id]

**Files:**
- Create: `app/api/analyses/[id]/route.ts`

- [ ] **Step 1: route.ts 생성**

```ts
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
```

- [ ] **Step 2: Commit**

```bash
git add app/api/analyses/
git commit -m "feat: add GET and PATCH /api/analyses/[id]"
```

---

## Task 6: POST /api/migrate

**Files:**
- Create: `app/api/migrate/route.ts`

- [ ] **Step 1: route.ts 생성**

```ts
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
```

- [ ] **Step 2: Commit**

```bash
git add app/api/migrate/route.ts
git commit -m "feat: add POST /api/migrate for localStorage data migration"
```

---

## Task 7: lib/storage.ts 재작성

**Files:**
- Modify: `lib/storage.ts`

- [ ] **Step 1: 전체 재작성**

```ts
import { getDeviceId } from './deviceId'
import type { AnalysisResult, DrillItem } from './types'

function headers() {
  return { 'x-device-id': getDeviceId() }
}

export async function getAnalyses(): Promise<AnalysisResult[]> {
  try {
    const res = await fetch('/api/analyses', { headers: headers() })
    if (!res.ok) return []
    const data = await res.json()
    return data.analyses as AnalysisResult[]
  } catch {
    return []
  }
}

export async function getAnalysis(id: string): Promise<AnalysisResult | null> {
  try {
    const res = await fetch(`/api/analyses/${id}`, { headers: headers() })
    if (!res.ok) return null
    return res.json()
  } catch {
    return null
  }
}

export async function updateDrills(id: string, drills: DrillItem[]): Promise<void> {
  await fetch(`/api/analyses/${id}`, {
    method: 'PATCH',
    headers: { ...headers(), 'Content-Type': 'application/json' },
    body: JSON.stringify({ drills }),
  })
}
```

- [ ] **Step 2: Commit**

```bash
git add lib/storage.ts
git commit -m "refactor: rewrite storage.ts as async API calls (replaces localStorage)"
```

---

## Task 8: app/analyze/page.tsx 업데이트

**Files:**
- Modify: `app/analyze/page.tsx`

- [ ] **Step 1: 전체 파일 교체**

```tsx
'use client'

import { useState, useRef } from 'react'
import { VideoUploader } from '@/components/analyze/VideoUploader'
import { MatchRecordForm } from '@/components/analyze/MatchRecordForm'
import { AnalysisLoader } from '@/components/analyze/AnalysisLoader'
import { VideoPlayer } from '@/components/analyze/VideoPlayer'
import { FeedbackCard } from '@/components/analyze/FeedbackCard'
import { DrillCarousel } from '@/components/analyze/DrillCarousel'
import { updateDrills } from '@/lib/storage'
import { getDeviceId } from '@/lib/deviceId'
import type { MatchRecord, AnalysisResult, AnalyzeApiResponse, DrillItem } from '@/lib/types'
import { motion, AnimatePresence } from 'framer-motion'

type PageState = 'upload' | 'loading' | 'result'

const DEFAULT_MATCH_RECORD: MatchRecord = { result: null, condition: 3, memo: '' }

export default function AnalyzePage() {
  const [state, setState] = useState<PageState>('upload')
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [videoUrl, setVideoUrl] = useState<string | null>(null)
  const [matchRecord, setMatchRecord] = useState<MatchRecord>(DEFAULT_MATCH_RECORD)
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [seekTo, setSeekTo] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loaderMsg, setLoaderMsg] = useState(0)
  const loaderInterval = useRef<ReturnType<typeof setInterval> | null>(null)

  function handleFileSelect(file: File) {
    setVideoFile(file)
    setVideoUrl(URL.createObjectURL(file))
  }

  async function handleAnalyze() {
    if (!videoFile) return
    setState('loading')
    setError(null)

    loaderInterval.current = setInterval(() => {
      setLoaderMsg((m) => m + 1)
    }, 3000)

    try {
      const formData = new FormData()
      formData.append('video', videoFile)
      formData.append('matchRecord', JSON.stringify(matchRecord))
      formData.append('deviceId', getDeviceId())

      const res = await fetch('/api/analyze', {
        method: 'POST',
        body: formData,
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || '분석 실패')
      }

      const data: AnalyzeApiResponse = await res.json()
      const analysisResult: AnalysisResult = {
        id: data.id,
        createdAt: new Date().toISOString(),
        matchRecord,
        praise: data.praise,
        improvements: data.improvements,
        drills: data.drills.map((d) => ({ ...d, completed: false })),
        skills: data.skills,
        videoPath: data.videoPath,
      }

      setResult(analysisResult)
      setState('result')
    } catch (err) {
      setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다')
      setState('upload')
    } finally {
      if (loaderInterval.current) clearInterval(loaderInterval.current)
    }
  }

  async function handleSaveDrills(drills: DrillItem[]) {
    if (!result) return
    await updateDrills(result.id, drills)
    setResult((prev) => (prev ? { ...prev, drills } : null))
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 md:space-y-8">
      <div>
        <h1 className="text-xl md:text-2xl font-bold">영상 분석하기</h1>
        <p className="text-foreground/40 text-sm mt-1">경기 영상을 업로드하면 AI가 분석해드립니다</p>
      </div>

      <AnimatePresence mode="wait">
        {state === 'upload' && (
          <motion.div
            key="upload"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            className="space-y-6"
          >
            <VideoUploader onFileSelect={handleFileSelect} />
            <MatchRecordForm onChange={setMatchRecord} />

            {error && (
              <div className="glass-card border-red-500/30 p-4 text-red-400 text-sm">
                {error}
              </div>
            )}

            <motion.button
              whileHover={videoFile ? { scale: 1.02, boxShadow: '0 0 24px #D4FF0060' } : {}}
              whileTap={videoFile ? { scale: 0.98 } : {}}
              onClick={handleAnalyze}
              disabled={!videoFile}
              className={`w-full py-3 md:py-4 rounded-xl font-bold text-base md:text-lg transition-all
                ${videoFile
                  ? 'bg-accent text-accent-foreground'
                  : 'bg-glass text-foreground/30 cursor-not-allowed border border-glass-border'
                }`}
            >
              {videoFile ? 'AI 분석 시작 →' : '영상을 먼저 업로드해주세요'}
            </motion.button>
          </motion.div>
        )}

        {state === 'loading' && (
          <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <AnalysisLoader messageIndex={loaderMsg} />
          </motion.div>
        )}

        {state === 'result' && result && (
          <motion.div
            key="result"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <VideoPlayer src={videoUrl ?? result.videoPath ?? ''} seekTo={seekTo} />
            <FeedbackCard
              praise={result.praise}
              improvements={result.improvements}
              onSeek={(s) => setSeekTo(s)}
            />
            <DrillCarousel drills={result.drills} onSave={handleSaveDrills} />
            <button
              onClick={() => { setState('upload'); setResult(null); setVideoFile(null); setVideoUrl(null) }}
              className="text-sm text-foreground/40 hover:text-foreground/70 underline"
            >
              다른 영상 분석하기
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add app/analyze/page.tsx
git commit -m "refactor: use server-generated id, async drills save"
```

---

## Task 9: ClientProvider + layout.tsx

**Files:**
- Create: `components/ClientProvider.tsx`
- Modify: `app/layout.tsx`

- [ ] **Step 1: components/ClientProvider.tsx 생성**

```tsx
'use client'

import { useEffect } from 'react'
import { getDeviceId } from '@/lib/deviceId'

const MIGRATION_DONE_KEY = 'squashvibe_migrated_v2'
const OLD_STORAGE_KEY = 'squashvibe_analyses'

export function ClientProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (localStorage.getItem(MIGRATION_DONE_KEY)) return

    const raw = localStorage.getItem(OLD_STORAGE_KEY)
    if (!raw) {
      localStorage.setItem(MIGRATION_DONE_KEY, '1')
      return
    }

    try {
      const analyses = JSON.parse(raw)
      const deviceId = getDeviceId()

      fetch('/api/migrate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deviceId, analyses }),
      }).then((res) => {
        if (res.ok) {
          localStorage.removeItem(OLD_STORAGE_KEY)
          localStorage.setItem(MIGRATION_DONE_KEY, '1')
        }
      })
    } catch {
      localStorage.setItem(MIGRATION_DONE_KEY, '1')
    }
  }, [])

  return <>{children}</>
}
```

- [ ] **Step 2: app/layout.tsx 수정**

```tsx
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Sidebar } from '@/components/layout/Sidebar'
import { ClientProvider } from '@/components/ClientProvider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'SquashVibe AI',
  description: '당신의 랠리를 데이터로 증명하세요',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko" className="dark">
      <body className={`${inter.className} bg-background`}>
        <ClientProvider>
          <Sidebar />
          <main className="md:ml-56 min-h-screen pt-14 md:pt-0 p-4 md:p-8">
            {children}
          </main>
        </ClientProvider>
      </body>
    </html>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add components/ClientProvider.tsx app/layout.tsx
git commit -m "feat: add ClientProvider with one-time migration trigger"
```

---

## Task 10: /api/analyze — 영상 저장 + DB 저장

**Files:**
- Modify: `app/api/analyze/route.ts`
- Modify: `.gitignore`

- [ ] **Step 1: route.ts 전체 교체**

```ts
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
        matchRecord,
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
```

- [ ] **Step 2: .gitignore에 uploads 추가**

`.gitignore` 하단에 추가:
```
# 업로드된 영상 파일
public/uploads/
```

- [ ] **Step 3: 빌드 확인**

```bash
npm run build
```

Expected: 오류 없음

- [ ] **Step 4: Commit**

```bash
git add app/api/analyze/route.ts .gitignore
git commit -m "feat: save video to public/uploads and persist analysis to MySQL"
```

---

## Task 11: lib/streak.ts (TDD)

**Files:**
- Create: `lib/streak.ts`, `lib/streak.test.ts`

- [ ] **Step 1: 실패 테스트 작성**

`lib/streak.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { calcStreak } from './streak'

function daysAgo(n: number): Date {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d
}

describe('calcStreak', () => {
  it('날짜 없으면 0 반환', () => {
    expect(calcStreak([])).toBe(0)
  })

  it('오늘만 있으면 1 반환', () => {
    expect(calcStreak([daysAgo(0)])).toBe(1)
  })

  it('오늘 + 어제 연속이면 2 반환', () => {
    expect(calcStreak([daysAgo(0), daysAgo(1)])).toBe(2)
  })

  it('3일 연속이면 3 반환', () => {
    expect(calcStreak([daysAgo(0), daysAgo(1), daysAgo(2)])).toBe(3)
  })

  it('오늘 없이 어제부터면 0 반환', () => {
    expect(calcStreak([daysAgo(1), daysAgo(2)])).toBe(0)
  })

  it('같은 날 여러 개 있어도 1일로 카운트', () => {
    expect(calcStreak([daysAgo(0), daysAgo(0), daysAgo(0)])).toBe(1)
  })

  it('중간에 하루 빠지면 끊김 (오늘+어제 = 2, 3일 전 무시)', () => {
    expect(calcStreak([daysAgo(0), daysAgo(1), daysAgo(3)])).toBe(2)
  })
})
```

- [ ] **Step 2: 실패 확인**

```bash
npx vitest run lib/streak.test.ts
```

Expected: FAIL — `calcStreak is not a function`

- [ ] **Step 3: 구현**

`lib/streak.ts`:

```ts
function toLocalDateStr(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function parseLocalDate(str: string): Date {
  const [y, m, d] = str.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export function calcStreak(dates: Date[]): number {
  if (dates.length === 0) return 0

  // 날짜 문자열로 변환 후 중복 제거, 최신순 정렬
  const unique = [...new Set(dates.map(toLocalDateStr))].sort((a, b) =>
    b.localeCompare(a)
  )

  const todayStr = toLocalDateStr(new Date())

  // 오늘 분석이 없으면 스트릭 없음
  if (unique[0] !== todayStr) return 0

  let streak = 1
  for (let i = 1; i < unique.length; i++) {
    const prev = parseLocalDate(unique[i - 1])
    const curr = parseLocalDate(unique[i])
    const diffDays = Math.round(
      (prev.getTime() - curr.getTime()) / (1000 * 60 * 60 * 24)
    )
    if (diffDays === 1) {
      streak++
    } else {
      break
    }
  }

  return streak
}
```

- [ ] **Step 4: 통과 확인**

```bash
npx vitest run lib/streak.test.ts
```

Expected: 7 tests PASS

- [ ] **Step 5: Commit**

```bash
git add lib/streak.ts lib/streak.test.ts
git commit -m "feat: add calcStreak with timezone-safe logic and tests"
```

---

## Task 12: SkillRadarChart 컴포넌트

**Files:**
- Create: `components/history/RadarChart.tsx`

- [ ] **Step 1: 컴포넌트 생성**

```tsx
'use client'

import {
  RadarChart as RechartsRadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  ResponsiveContainer,
  Tooltip,
} from 'recharts'
import type { SkillScores } from '@/lib/types'

interface SkillRadarChartProps {
  skillsList: SkillScores[]
}

function average(nums: number[]): number {
  if (nums.length === 0) return 0
  return Math.round(nums.reduce((a, b) => a + b, 0) / nums.length)
}

export function SkillRadarChart({ skillsList }: SkillRadarChartProps) {
  if (skillsList.length === 0) return null

  const recent = skillsList.slice(0, 5)
  const data = [
    { subject: '정확도', value: average(recent.map((s) => s.accuracy)), fullMark: 100 },
    { subject: '파워',   value: average(recent.map((s) => s.power)),    fullMark: 100 },
    { subject: '활동량', value: average(recent.map((s) => s.activity)), fullMark: 100 },
  ]

  return (
    <div className="glass-card p-6">
      <h3 className="text-sm font-semibold text-foreground/60 uppercase tracking-wider mb-4">
        실력 분석{' '}
        <span className="text-foreground/30 normal-case font-normal">
          (최근 {recent.length}회 평균)
        </span>
      </h3>
      <ResponsiveContainer width="100%" height={220}>
        <RechartsRadarChart data={data}>
          <PolarGrid stroke="rgba(255,255,255,0.1)" />
          <PolarAngleAxis
            dataKey="subject"
            tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }}
          />
          <Radar
            name="실력"
            dataKey="value"
            stroke="#D4FF00"
            fill="#D4FF00"
            fillOpacity={0.2}
          />
          <Tooltip
            contentStyle={{
              background: '#111',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '8px',
              color: '#fff',
              fontSize: '12px',
            }}
          />
        </RechartsRadarChart>
      </ResponsiveContainer>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add components/history/RadarChart.tsx
git commit -m "feat: add SkillRadarChart with recharts"
```

---

## Task 13: StreakBadge 컴포넌트

**Files:**
- Create: `components/history/StreakBadge.tsx`

- [ ] **Step 1: 컴포넌트 생성**

```tsx
interface StreakBadgeProps {
  streak: number
  totalCount: number
}

const BADGES = [
  { days: 3,  icon: '🔥', label: '열정 스타터' },
  { days: 7,  icon: '⚡', label: '주간 챔피언' },
  { days: 30, icon: '👑', label: '레전드 플레이어' },
]

export function StreakBadge({ streak, totalCount }: StreakBadgeProps) {
  return (
    <div className="glass-card p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-foreground/50">현재 연속 분석</p>
          <p className="text-2xl font-bold text-accent">{streak}일 🔥</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-foreground/50">총 분석 횟수</p>
          <p className="text-2xl font-bold">{totalCount}회</p>
        </div>
      </div>

      <div className="flex gap-3">
        {BADGES.map((badge) => {
          const achieved = streak >= badge.days
          return (
            <div
              key={badge.days}
              className={`flex-1 flex flex-col items-center gap-1 p-3 rounded-xl border transition-all
                ${achieved
                  ? 'border-accent/30 bg-accent/5'
                  : 'border-glass-border opacity-30'
                }`}
            >
              <span className="text-2xl">{badge.icon}</span>
              <span className="text-xs font-bold">{badge.days}일</span>
              <span className="text-xs text-foreground/50 text-center leading-tight">
                {badge.label}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add components/history/StreakBadge.tsx
git commit -m "feat: add StreakBadge component (3/7/30일)"
```

---

## Task 14: HistoryList 컴포넌트

**Files:**
- Create: `components/history/HistoryList.tsx`

- [ ] **Step 1: 컴포넌트 생성**

```tsx
import Link from 'next/link'
import type { AnalysisResult } from '@/lib/types'

interface HistoryListProps {
  analyses: AnalysisResult[]
}

export function HistoryList({ analyses }: HistoryListProps) {
  if (analyses.length === 0) {
    return (
      <div className="glass-card p-12 text-center">
        <p className="text-4xl mb-4">🎾</p>
        <p className="text-foreground/40">아직 분석 기록이 없습니다</p>
        <p className="text-foreground/30 text-sm mt-1">
          영상을 분석하면 여기에 기록이 쌓여요
        </p>
      </div>
    )
  }

  return (
    <ul className="space-y-3">
      {analyses.map((a) => (
        <li key={a.id}>
          <Link href={`/history/${a.id}`}>
            <div className="glass-card p-4 md:p-5 flex items-start md:items-center justify-between gap-3 hover:border-accent/30 transition-colors cursor-pointer">
              <div className="space-y-1 min-w-0">
                <p className="text-xs md:text-sm text-foreground/60">
                  {new Date(a.createdAt).toLocaleDateString('ko-KR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
                <p className="text-foreground/80 text-sm truncate">
                  {a.praise[0] ?? '분석 완료'}
                </p>
              </div>
              <div className="flex-shrink-0 flex items-center gap-2">
                {a.matchRecord.result && (
                  <span
                    className={`text-xs px-3 py-1 rounded-full font-medium ${
                      a.matchRecord.result === 'win'
                        ? 'bg-accent/10 text-accent'
                        : 'bg-red-500/10 text-red-400'
                    }`}
                  >
                    {a.matchRecord.result === 'win' ? '승' : '패'}
                  </span>
                )}
                <span className="text-foreground/30 text-sm">→</span>
              </div>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add components/history/HistoryList.tsx
git commit -m "feat: add HistoryList with navigation to /history/[id]"
```

---

## Task 15: /history 페이지 3-zone 개편

**Files:**
- Modify: `app/history/page.tsx`

- [ ] **Step 1: 전체 재작성**

```tsx
'use client'

import { useEffect, useState } from 'react'
import { getAnalyses } from '@/lib/storage'
import { calcStreak } from '@/lib/streak'
import { SkillRadarChart } from '@/components/history/RadarChart'
import { StreakBadge } from '@/components/history/StreakBadge'
import { HistoryList } from '@/components/history/HistoryList'
import type { AnalysisResult } from '@/lib/types'

export default function HistoryPage() {
  const [analyses, setAnalyses] = useState<AnalysisResult[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getAnalyses().then((data) => {
      setAnalyses(data)
      setLoading(false)
    })
  }, [])

  const streak = calcStreak(analyses.map((a) => new Date(a.createdAt)))
  const hasData = analyses.length > 0

  return (
    <div className="max-w-4xl mx-auto space-y-6 md:space-y-8">
      <div>
        <h1 className="text-xl md:text-2xl font-bold">기록실</h1>
        <p className="text-foreground/40 text-sm mt-1">나의 성장 히스토리</p>
      </div>

      {loading ? (
        <div className="glass-card p-12 text-center">
          <p className="text-foreground/40 text-sm">불러오는 중...</p>
        </div>
      ) : (
        <>
          {hasData && (
            <>
              <SkillRadarChart skillsList={analyses.map((a) => a.skills)} />
              <StreakBadge streak={streak} totalCount={analyses.length} />
            </>
          )}
          <HistoryList analyses={analyses} />
        </>
      )}
    </div>
  )
}
```

- [ ] **Step 2: 빌드 확인**

```bash
npm run build
```

Expected: 오류 없음

- [ ] **Step 3: Commit**

```bash
git add app/history/page.tsx
git commit -m "feat: redesign /history with radar chart, streak badges, and list"
```

---

## Task 16: /history/[id] 상세 페이지

**Files:**
- Create: `app/history/[id]/page.tsx`

- [ ] **Step 1: 페이지 생성**

```tsx
'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { getAnalysis, updateDrills } from '@/lib/storage'
import { VideoPlayer } from '@/components/analyze/VideoPlayer'
import { FeedbackCard } from '@/components/analyze/FeedbackCard'
import { DrillCarousel } from '@/components/analyze/DrillCarousel'
import { SkillRadarChart } from '@/components/history/RadarChart'
import type { AnalysisResult, DrillItem } from '@/lib/types'

export default function HistoryDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [seekTo, setSeekTo] = useState<number | null>(null)

  useEffect(() => {
    getAnalysis(id).then((data) => {
      setAnalysis(data)
      setLoading(false)
    })
  }, [id])

  async function handleSaveDrills(drills: DrillItem[]) {
    if (!analysis) return
    await updateDrills(analysis.id, drills)
    setAnalysis((prev) => (prev ? { ...prev, drills } : null))
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="glass-card p-12 text-center">
          <p className="text-foreground/40 text-sm">불러오는 중...</p>
        </div>
      </div>
    )
  }

  if (!analysis) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="glass-card p-12 text-center">
          <p className="text-4xl mb-4">🎾</p>
          <p className="text-foreground/40">분석 기록을 찾을 수 없습니다</p>
          <button
            onClick={() => router.push('/history')}
            className="mt-4 text-sm text-accent hover:underline"
          >
            기록실로 돌아가기
          </button>
        </div>
      </div>
    )
  }

  const dateStr = new Date(analysis.createdAt).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return (
    <div className="max-w-4xl mx-auto space-y-6 md:space-y-8">
      {/* 헤더 */}
      <div className="flex items-center gap-3 flex-wrap">
        <button
          onClick={() => router.push('/history')}
          className="text-foreground/40 hover:text-foreground/70 text-sm transition-colors"
        >
          ← 기록실
        </button>
        <span className="text-foreground/60 text-sm">{dateStr}</span>
        {analysis.matchRecord.result && (
          <span
            className={`text-xs px-3 py-1 rounded-full font-medium ${
              analysis.matchRecord.result === 'win'
                ? 'bg-accent/10 text-accent'
                : 'bg-red-500/10 text-red-400'
            }`}
          >
            {analysis.matchRecord.result === 'win' ? '승' : '패'}
          </span>
        )}
      </div>

      {/* 영상 */}
      {analysis.videoPath ? (
        <VideoPlayer src={analysis.videoPath} seekTo={seekTo} />
      ) : (
        <div className="glass-card p-8 text-center text-foreground/40 text-sm">
          🎬 영상 파일이 없습니다 (이전 분석 기록)
        </div>
      )}

      {/* 피드백 */}
      <FeedbackCard
        praise={analysis.praise}
        improvements={analysis.improvements}
        onSeek={analysis.videoPath ? (s) => setSeekTo(s) : () => {}}
      />

      {/* 훈련 루틴 */}
      <DrillCarousel drills={analysis.drills} onSave={handleSaveDrills} />

      {/* 스킬 레이더 차트 */}
      <SkillRadarChart skillsList={[analysis.skills]} />
    </div>
  )
}
```

- [ ] **Step 2: 최종 빌드 확인**

```bash
npm run build
```

Expected: 오류 없음, 전 페이지 정상 빌드

- [ ] **Step 3: 전체 테스트 실행**

```bash
npx vitest run
```

Expected: 11 tests PASS (deviceId 4 + streak 7)

- [ ] **Step 4: Commit**

```bash
git add app/history/
git commit -m "feat: add /history/[id] detail page"
```

---

## 완료 체크리스트

- [ ] MySQL `aisquash` DB에 `Analysis` 테이블 생성됨
- [ ] 앱 첫 로드 시 localStorage 기존 데이터 자동 마이그레이션
- [ ] `/api/analyze` 호출 시 `public/uploads/`에 영상 파일 저장
- [ ] `/history` 레이더 차트 + 스트릭 배지 표시
- [ ] `/history/[id]` 영상 재생 + 피드백 + 드릴 + 레이더 차트
- [ ] `npx vitest run` → 11 tests PASS
- [ ] `npm run build` → 오류 없음
