# SquashVibe AI MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 스쿼시 경기 영상을 Gemini로 분석하여 AI 피드백 + 맞춤 훈련 루틴을 제공하는 Next.js 14 MVP 앱을 구축한다.

**Architecture:** Next.js 14 App Router 기반 SPA. 클라이언트에서 영상을 `/api/analyze` 로 전송하면 Gemini 1.5 Pro가 분석 후 JSON을 반환한다. 결과는 localStorage에 저장하며 로그인 없이 동작한다.

**Tech Stack:** Next.js 14, TypeScript, Tailwind CSS, Shadcn UI, Framer Motion, @google/generative-ai, Vitest, React Testing Library

---

## 파일 구조

```
ai-squash/
├── app/
│   ├── globals.css                     # CSS 변수 + 글로벌 스타일
│   ├── layout.tsx                      # 루트 레이아웃 (사이드바 포함)
│   ├── page.tsx                        # 랜딩 페이지
│   ├── analyze/
│   │   └── page.tsx                    # 분석 페이지 (전체 흐름 조율)
│   ├── history/
│   │   └── page.tsx                    # 기록실 (Phase 2 스텁)
│   └── api/
│       └── analyze/
│           └── route.ts                # POST /api/analyze → Gemini 호출
├── components/
│   ├── layout/
│   │   └── Sidebar.tsx                 # 좌측 네비게이션 사이드바
│   ├── landing/
│   │   └── HeroSection.tsx             # 랜딩 히어로 섹션
│   └── analyze/
│       ├── VideoUploader.tsx           # 드래그앤드롭 업로더
│       ├── MatchRecordForm.tsx         # 경기 기록 입력 폼
│       ├── AnalysisLoader.tsx          # 공 튀는 로딩 애니메이션
│       ├── VideoPlayer.tsx             # 타임스탬프 점프 가능한 플레이어
│       ├── FeedbackCard.tsx            # 칭찬/개선 탭 카드
│       └── DrillCarousel.tsx           # 훈련 루틴 카드 슬라이더
├── lib/
│   ├── types.ts                        # 모든 TypeScript 인터페이스
│   ├── storage.ts                      # localStorage 헬퍼
│   └── gemini.ts                       # 프롬프트 빌더 (순수 함수)
├── __tests__/
│   ├── lib/storage.test.ts             # storage 유닛 테스트
│   ├── lib/gemini.test.ts              # 프롬프트 빌더 유닛 테스트
│   ├── components/FeedbackCard.test.tsx
│   └── components/DrillCarousel.test.tsx
├── vitest.config.ts
├── vitest.setup.ts
└── tailwind.config.ts
```

---

## Task 1: 프로젝트 부트스트랩

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.js` (자동 생성)
- Create: `.env.local`

- [ ] **Step 1: Next.js 14 앱 생성**

```bash
cd D:/Project/ai-squash
npx create-next-app@14 . --typescript --tailwind --eslint --app --no-src-dir --import-alias "@/*"
```

프롬프트 응답: 모두 기본값 사용 (Enter)

Expected: `ai-squash/` 디렉토리에 Next.js 파일들이 생성됨

- [ ] **Step 2: 추가 의존성 설치**

```bash
npm install framer-motion @google/generative-ai recharts
npm install -D vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/jest-dom @types/testing-library__jest-dom
```

- [ ] **Step 3: Shadcn UI 초기화**

```bash
npx shadcn-ui@latest init
```

프롬프트 응답:
- Style: Default
- Base color: Slate
- CSS variables: Yes

- [ ] **Step 4: 자주 쓸 Shadcn 컴포넌트 추가**

```bash
npx shadcn-ui@latest add button card tabs badge slider
```

- [ ] **Step 5: `.env.local` 생성**

```
GEMINI_API_KEY=your_gemini_api_key_here
```

- [ ] **Step 6: 커밋**

```bash
git add -A
git commit -m "chore: bootstrap Next.js 14 project with dependencies"
```

---

## Task 2: Vitest 설정

**Files:**
- Create: `vitest.config.ts`
- Create: `vitest.setup.ts`
- Modify: `package.json` (test 스크립트 추가)

- [ ] **Step 1: `vitest.config.ts` 작성**

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    globals: true,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
})
```

- [ ] **Step 2: `vitest.setup.ts` 작성**

```typescript
// vitest.setup.ts
import '@testing-library/jest-dom'
```

- [ ] **Step 3: `package.json`에 test 스크립트 추가**

`package.json`의 `"scripts"` 섹션에 추가:
```json
"test": "vitest",
"test:run": "vitest run"
```

- [ ] **Step 4: 설정 동작 확인**

```bash
npm run test:run
```

Expected: `No test files found` 또는 `0 tests passed` (에러 없음)

- [ ] **Step 5: 커밋**

```bash
git add vitest.config.ts vitest.setup.ts package.json
git commit -m "chore: add Vitest + React Testing Library"
```

---

## Task 3: Tailwind 커스텀 테마

**Files:**
- Modify: `tailwind.config.ts`
- Modify: `app/globals.css`

- [ ] **Step 1: `tailwind.config.ts` 수정**

```typescript
// tailwind.config.ts
import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#0A0A0A',
        foreground: '#FAFAFA',
        accent: {
          DEFAULT: '#D4FF00',
          foreground: '#0A0A0A',
        },
        glass: {
          DEFAULT: 'rgba(255,255,255,0.05)',
          border: 'rgba(255,255,255,0.1)',
        },
        card: {
          DEFAULT: 'rgba(255,255,255,0.04)',
          foreground: '#FAFAFA',
        },
      },
      backdropBlur: {
        xs: '2px',
      },
      animation: {
        'bounce-ball': 'bounceBall 0.8s ease-in-out infinite',
        'glow-pulse': 'glowPulse 2s ease-in-out infinite',
      },
      keyframes: {
        bounceBall: {
          '0%, 100%': { transform: 'translateY(0)', animationTimingFunction: 'ease-in' },
          '50%': { transform: 'translateY(-40px)', animationTimingFunction: 'ease-out' },
        },
        glowPulse: {
          '0%, 100%': { boxShadow: '0 0 8px #D4FF00' },
          '50%': { boxShadow: '0 0 24px #D4FF00, 0 0 48px #D4FF0040' },
        },
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}

export default config
```

- [ ] **Step 2: `app/globals.css` 수정**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 4%;
    --foreground: 0 0% 98%;
    --card: 0 0% 4%;
    --card-foreground: 0 0% 98%;
    --border: 0 0% 14%;
    --input: 0 0% 14%;
    --primary: 74 100% 50%;
    --primary-foreground: 0 0% 4%;
    --radius: 0.75rem;
  }

  body {
    @apply bg-background text-foreground;
    font-family: 'Inter', system-ui, sans-serif;
  }
}

@layer utilities {
  .glass-card {
    @apply bg-glass border border-glass-border backdrop-blur-sm rounded-xl;
  }

  .glow-accent {
    @apply shadow-[0_0_16px_#D4FF0060];
  }
}
```

- [ ] **Step 3: 앱 실행으로 확인**

```bash
npm run dev
```

Expected: `http://localhost:3000` 에서 다크 배경 페이지 확인

- [ ] **Step 4: 커밋**

```bash
git add tailwind.config.ts app/globals.css
git commit -m "style: configure dark theme with Neon Lime accent"
```

---

## Task 4: TypeScript 타입 정의

**Files:**
- Create: `lib/types.ts`

- [ ] **Step 1: `lib/types.ts` 작성**

```typescript
// lib/types.ts

export type MatchResult = 'win' | 'lose' | null

export interface MatchRecord {
  result: MatchResult
  condition: number        // 1~5
  memo: string
}

export interface ImprovementItem {
  timestamp: string        // "00:15" 형식
  message: string
}

export type DrillDifficulty = '쉬움' | '보통' | '어려움'

export interface DrillItem {
  name: string
  duration: string         // "10분" 형식
  difficulty: DrillDifficulty
  description: string
  completed: boolean
}

export interface SkillScores {
  accuracy: number         // 0~100
  power: number            // 0~100
  activity: number         // 0~100
}

export interface AnalysisResult {
  id: string               // crypto.randomUUID()
  createdAt: string        // ISO 날짜 문자열
  matchRecord: MatchRecord
  praise: string[]
  improvements: ImprovementItem[]
  drills: DrillItem[]
  skills: SkillScores
}

export interface AnalyzeRequestBody {
  videoBase64: string
  videoMimeType: string
  matchRecord: MatchRecord
}

export interface AnalyzeApiResponse {
  praise: string[]
  improvements: ImprovementItem[]
  drills: Omit<DrillItem, 'completed'>[]
  skills: SkillScores
}
```

- [ ] **Step 2: 타입 오류 없음 확인**

```bash
npx tsc --noEmit
```

Expected: 출력 없음 (오류 없음)

- [ ] **Step 3: 커밋**

```bash
git add lib/types.ts
git commit -m "feat: define TypeScript types for analysis domain"
```

---

## Task 5: Storage 헬퍼 (TDD)

**Files:**
- Create: `lib/storage.ts`
- Create: `__tests__/lib/storage.test.ts`

- [ ] **Step 1: 실패하는 테스트 작성**

```typescript
// __tests__/lib/storage.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { saveAnalysis, getAnalyses, clearAnalyses } from '@/lib/storage'
import type { AnalysisResult } from '@/lib/types'

const mockAnalysis: AnalysisResult = {
  id: 'test-id-1',
  createdAt: '2026-04-07T00:00:00.000Z',
  matchRecord: { result: 'win', condition: 4, memo: '좋은 경기' },
  praise: ['서브가 정확했어요'],
  improvements: [{ timestamp: '00:15', message: '백핸드 개선 필요' }],
  drills: [{ name: '섀도우 연습', duration: '10분', difficulty: '보통', description: '기본기 훈련', completed: false }],
  skills: { accuracy: 70, power: 65, activity: 80 },
}

describe('storage', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('분석 결과를 저장하고 불러온다', () => {
    saveAnalysis(mockAnalysis)
    const results = getAnalyses()
    expect(results).toHaveLength(1)
    expect(results[0].id).toBe('test-id-1')
  })

  it('여러 분석 결과를 최신순으로 반환한다', () => {
    const older = { ...mockAnalysis, id: 'old', createdAt: '2026-04-01T00:00:00.000Z' }
    const newer = { ...mockAnalysis, id: 'new', createdAt: '2026-04-07T00:00:00.000Z' }
    saveAnalysis(older)
    saveAnalysis(newer)
    const results = getAnalyses()
    expect(results[0].id).toBe('new')
    expect(results[1].id).toBe('old')
  })

  it('clearAnalyses는 모든 기록을 삭제한다', () => {
    saveAnalysis(mockAnalysis)
    clearAnalyses()
    expect(getAnalyses()).toHaveLength(0)
  })

  it('같은 id로 저장하면 중복 없이 교체된다', () => {
    saveAnalysis(mockAnalysis)
    const updated = { ...mockAnalysis, praise: ['업데이트됨'] }
    saveAnalysis(updated)
    const results = getAnalyses()
    expect(results).toHaveLength(1)
    expect(results[0].praise[0]).toBe('업데이트됨')
  })
})
```

- [ ] **Step 2: 테스트 실패 확인**

```bash
npm run test:run -- __tests__/lib/storage.test.ts
```

Expected: FAIL - `Cannot find module '@/lib/storage'`

- [ ] **Step 3: `lib/storage.ts` 구현**

```typescript
// lib/storage.ts
import type { AnalysisResult } from './types'

const STORAGE_KEY = 'squashvibe_analyses'

// 동일 id가 있으면 교체(upsert), 없으면 앞에 추가
export function saveAnalysis(result: AnalysisResult): void {
  const existing = getAnalyses()
  const filtered = existing.filter((a) => a.id !== result.id)
  const updated = [result, ...filtered]
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
}

export function getAnalyses(): AnalysisResult[] {
  if (typeof window === 'undefined') return []
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) return []
  try {
    const parsed = JSON.parse(raw) as AnalysisResult[]
    return parsed.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
  } catch {
    return []
  }
}

export function clearAnalyses(): void {
  localStorage.removeItem(STORAGE_KEY)
}
```

- [ ] **Step 4: 테스트 통과 확인**

```bash
npm run test:run -- __tests__/lib/storage.test.ts
```

Expected: PASS - 4 tests passed

- [ ] **Step 5: 커밋**

```bash
git add lib/storage.ts __tests__/lib/storage.test.ts
git commit -m "feat: add localStorage storage helpers with upsert and tests"
```

---

## Task 6: 루트 레이아웃 + 사이드바

**Files:**
- Create: `components/layout/Sidebar.tsx`
- Modify: `app/layout.tsx`

- [ ] **Step 1: `components/layout/Sidebar.tsx` 작성**

```tsx
// components/layout/Sidebar.tsx
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'

const navItems = [
  { href: '/', label: '홈', icon: '🏠' },
  { href: '/analyze', label: '분석하기', icon: '🎬' },
  { href: '/history', label: '기록실', icon: '📋' },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="fixed left-0 top-0 h-screen w-56 glass-card border-r border-glass-border flex flex-col py-8 px-4 z-40">
      {/* 로고 */}
      <div className="mb-10 px-2">
        <span className="text-accent font-bold text-xl tracking-tight">SquashVibe</span>
        <span className="text-foreground/40 text-sm block">AI Coach</span>
      </div>

      {/* 네비게이션 */}
      <nav className="flex flex-col gap-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link key={item.href} href={item.href}>
              <motion.div
                whileHover={{ x: 4 }}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-sm font-medium
                  ${isActive
                    ? 'bg-accent text-accent-foreground glow-accent'
                    : 'text-foreground/60 hover:text-foreground hover:bg-glass'
                  }`}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </motion.div>
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
```

- [ ] **Step 2: `app/layout.tsx` 수정**

```tsx
// app/layout.tsx
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Sidebar } from '@/components/layout/Sidebar'

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
        <Sidebar />
        <main className="ml-56 min-h-screen p-8">
          {children}
        </main>
      </body>
    </html>
  )
}
```

- [ ] **Step 3: 브라우저에서 사이드바 확인**

```bash
npm run dev
```

Expected: 좌측에 사이드바 표시, `홈/분석하기/기록실` 링크 동작

- [ ] **Step 4: 커밋**

```bash
git add components/layout/Sidebar.tsx app/layout.tsx
git commit -m "feat: add sidebar navigation layout"
```

---

## Task 7: 랜딩 페이지

**Files:**
- Create: `components/landing/HeroSection.tsx`
- Modify: `app/page.tsx`

- [ ] **Step 1: `components/landing/HeroSection.tsx` 작성**

```tsx
// components/landing/HeroSection.tsx
'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'

export function HeroSection() {
  return (
    <section className="flex flex-col items-center justify-center min-h-[80vh] text-center px-4">
      {/* 배지 */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-6 px-4 py-1.5 rounded-full border border-accent/40 text-accent text-xs font-semibold tracking-widest uppercase"
      >
        AI Powered Squash Coach
      </motion.div>

      {/* 헤드라인 */}
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="text-5xl md:text-7xl font-bold leading-tight mb-6"
      >
        당신의 랠리를
        <br />
        <span className="text-accent">데이터로 증명</span>하세요
      </motion.h1>

      {/* 서브텍스트 */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="text-foreground/50 text-lg mb-10 max-w-md"
      >
        경기 영상을 업로드하면 AI가 자세를 분석하고
        <br />오늘 당장 연습할 훈련 루틴을 알려드립니다
      </motion.p>

      {/* CTA 버튼 */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, delay: 0.3 }}
      >
        <Link href="/analyze">
          <motion.button
            whileHover={{ scale: 1.05, boxShadow: '0 0 32px #D4FF0080' }}
            whileTap={{ scale: 0.97 }}
            className="bg-accent text-accent-foreground font-bold px-10 py-4 rounded-full text-lg transition-all"
          >
            영상 분석 시작하기 →
          </motion.button>
        </Link>
      </motion.div>

      {/* 장식 공 */}
      <motion.div
        animate={{ y: [-8, 8, -8] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        className="mt-20 text-6xl select-none"
      >
        🎾
      </motion.div>
    </section>
  )
}
```

- [ ] **Step 2: `app/page.tsx` 수정**

```tsx
// app/page.tsx
import { HeroSection } from '@/components/landing/HeroSection'

export default function HomePage() {
  return <HeroSection />
}
```

- [ ] **Step 3: 브라우저에서 랜딩 페이지 확인**

```bash
npm run dev
```

Expected: `http://localhost:3000` 에서 히어로 섹션 + Neon Lime 강조 확인

- [ ] **Step 4: 커밋**

```bash
git add components/landing/HeroSection.tsx app/page.tsx
git commit -m "feat: add landing page hero section"
```

---

## Task 8: VideoUploader 컴포넌트

**Files:**
- Create: `components/analyze/VideoUploader.tsx`

- [ ] **Step 1: `components/analyze/VideoUploader.tsx` 작성**

```tsx
// components/analyze/VideoUploader.tsx
'use client'

import { useState, useRef, DragEvent, ChangeEvent } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface VideoUploaderProps {
  onFileSelect: (file: File) => void
}

export function VideoUploader({ onFileSelect }: VideoUploaderProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)
  const [fileName, setFileName] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  function handleFile(file: File) {
    if (!file.type.startsWith('video/')) return
    const url = URL.createObjectURL(file)
    setPreview(url)
    setFileName(file.name)
    onFileSelect(file)
  }

  function onDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  function onInputChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
  }

  return (
    <div>
      <motion.div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={onDrop}
        animate={isDragging ? { scale: 1.02 } : { scale: 1 }}
        className={`glass-card border-2 border-dashed cursor-pointer transition-colors p-10 text-center
          ${isDragging ? 'border-accent bg-accent/5' : 'border-glass-border hover:border-accent/40'}`}
      >
        <input
          ref={inputRef}
          type="file"
          accept="video/*"
          className="hidden"
          onChange={onInputChange}
        />

        <AnimatePresence mode="wait">
          {preview ? (
            <motion.div
              key="preview"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center gap-3"
            >
              <video
                src={preview}
                className="w-48 h-28 object-cover rounded-lg border border-glass-border"
                muted
              />
              <p className="text-foreground/70 text-sm truncate max-w-xs">{fileName}</p>
              <p className="text-accent text-xs">클릭하여 다시 선택</p>
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center gap-4"
            >
              <div className="text-5xl">🎬</div>
              <div>
                <p className="text-foreground font-medium">영상을 드래그하거나 클릭하세요</p>
                <p className="text-foreground/40 text-sm mt-1">최대 1분 클립 권장 · MP4, MOV, AVI</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}
```

- [ ] **Step 2: 커밋**

```bash
git add components/analyze/VideoUploader.tsx
git commit -m "feat: add drag-and-drop video uploader component"
```

---

## Task 9: MatchRecordForm 컴포넌트

**Files:**
- Create: `components/analyze/MatchRecordForm.tsx`

- [ ] **Step 1: `components/analyze/MatchRecordForm.tsx` 작성**

```tsx
// components/analyze/MatchRecordForm.tsx
'use client'

import { useState } from 'react'
import type { MatchRecord, MatchResult } from '@/lib/types'

const CONDITION_EMOJI = ['', '😴', '😪', '😊', '😄', '🔥']

interface MatchRecordFormProps {
  onChange: (record: MatchRecord) => void
}

export function MatchRecordForm({ onChange }: MatchRecordFormProps) {
  const [result, setResult] = useState<MatchResult>(null)
  const [condition, setCondition] = useState(3)
  const [memo, setMemo] = useState('')

  function update(patch: Partial<MatchRecord>) {
    const next = {
      result: patch.result !== undefined ? patch.result : result,
      condition: patch.condition !== undefined ? patch.condition : condition,
      memo: patch.memo !== undefined ? patch.memo : memo,
    }
    if (patch.result !== undefined) setResult(patch.result)
    if (patch.condition !== undefined) setCondition(patch.condition)
    if (patch.memo !== undefined) setMemo(patch.memo)
    onChange(next)
  }

  return (
    <div className="glass-card p-6 space-y-6">
      <h3 className="text-sm font-semibold text-foreground/60 uppercase tracking-wider">
        경기 기록 <span className="text-foreground/30">(선택)</span>
      </h3>

      {/* 승/패 토글 */}
      <div className="flex gap-3">
        {(['win', 'lose'] as const).map((r) => (
          <button
            key={r}
            onClick={() => update({ result: result === r ? null : r })}
            className={`flex-1 py-3 rounded-lg font-semibold text-sm transition-all
              ${result === r
                ? r === 'win'
                  ? 'bg-accent text-accent-foreground glow-accent'
                  : 'bg-red-500/80 text-white'
                : 'glass-card hover:border-white/20'
              }`}
          >
            {r === 'win' ? '🏆 승리' : '💪 패배'}
          </button>
        ))}
      </div>

      {/* 컨디션 슬라이더 */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-sm text-foreground/60">컨디션</span>
          <span className="text-2xl">{CONDITION_EMOJI[condition]}</span>
        </div>
        <input
          type="range"
          min={1}
          max={5}
          value={condition}
          onChange={(e) => update({ condition: Number(e.target.value) })}
          className="w-full accent-[#D4FF00]"
        />
        <div className="flex justify-between text-xs text-foreground/30">
          <span>최악</span>
          <span>최고</span>
        </div>
      </div>

      {/* 메모 */}
      <textarea
        placeholder="오늘 경기에서 신경 쓰인 점이 있나요? (선택)"
        value={memo}
        onChange={(e) => update({ memo: e.target.value })}
        rows={3}
        className="w-full bg-glass border border-glass-border rounded-lg px-4 py-3 text-sm text-foreground placeholder:text-foreground/30 resize-none focus:outline-none focus:border-accent/40"
      />
    </div>
  )
}
```

- [ ] **Step 2: 커밋**

```bash
git add components/analyze/MatchRecordForm.tsx
git commit -m "feat: add match record form with condition slider"
```

---

## Task 10: Gemini 프롬프트 빌더 (TDD)

**Files:**
- Create: `lib/gemini.ts`
- Create: `__tests__/lib/gemini.test.ts`

- [ ] **Step 1: 실패하는 테스트 작성**

```typescript
// __tests__/lib/gemini.test.ts
import { describe, it, expect } from 'vitest'
import { buildPrompt } from '@/lib/gemini'
import type { MatchRecord } from '@/lib/types'

describe('buildPrompt', () => {
  it('승리 결과를 프롬프트에 포함한다', () => {
    const record: MatchRecord = { result: 'win', condition: 5, memo: '' }
    const prompt = buildPrompt(record)
    expect(prompt).toContain('승리')
    expect(prompt).toContain('컨디션: 5')
  })

  it('패배 결과를 프롬프트에 포함한다', () => {
    const record: MatchRecord = { result: 'lose', condition: 2, memo: '피로함' }
    const prompt = buildPrompt(record)
    expect(prompt).toContain('패배')
    expect(prompt).toContain('피로함')
  })

  it('경기 기록 없이도 프롬프트가 생성된다', () => {
    const record: MatchRecord = { result: null, condition: 3, memo: '' }
    const prompt = buildPrompt(record)
    expect(typeof prompt).toBe('string')
    expect(prompt.length).toBeGreaterThan(100)
  })

  it('JSON 형식 출력 지시가 포함된다', () => {
    const record: MatchRecord = { result: null, condition: 3, memo: '' }
    const prompt = buildPrompt(record)
    expect(prompt).toContain('JSON')
    expect(prompt).toContain('praise')
    expect(prompt).toContain('drills')
  })
})
```

- [ ] **Step 2: 테스트 실패 확인**

```bash
npm run test:run -- __tests__/lib/gemini.test.ts
```

Expected: FAIL - `Cannot find module '@/lib/gemini'`

- [ ] **Step 3: `lib/gemini.ts` 구현**

```typescript
// lib/gemini.ts
import type { MatchRecord } from './types'

export function buildPrompt(record: MatchRecord): string {
  const contextLines: string[] = []

  if (record.result) {
    contextLines.push(`- 경기 결과: ${record.result === 'win' ? '승리' : '패배'}`)
  }
  contextLines.push(`- 컨디션: ${record.condition}/5`)
  if (record.memo) {
    contextLines.push(`- 메모: ${record.memo}`)
  }

  const context = contextLines.length > 0
    ? `\n\n[오늘의 경기 정보]\n${contextLines.join('\n')}\n`
    : ''

  return `당신은 친근하고 열정적인 스쿼시 트레이너입니다. 한국어로 답변하세요.
제공된 스쿼시 경기 영상을 분석해주세요.${context}

다음 JSON 형식으로만 응답하세요. 다른 텍스트는 포함하지 마세요:

{
  "praise": ["칭찬할 점 1", "칭찬할 점 2"],
  "improvements": [
    { "timestamp": "00:15", "message": "개선할 점과 격려 메시지" }
  ],
  "drills": [
    {
      "name": "드릴 이름",
      "duration": "10분",
      "difficulty": "보통",
      "description": "드릴 설명 2~3줄"
    }
  ],
  "skills": {
    "accuracy": 70,
    "power": 65,
    "activity": 80
  }
}

규칙:
- praise: 2~3개, 격려하는 말투로
- improvements: 2~4개, 타임스탬프 "MM:SS" 형식, "거의 다 됐어요", "조금만 더" 같은 응원 포함
- drills: 3~5개, 영상에서 발견된 약점을 보완하는 훈련
- difficulty: 반드시 "쉬움", "보통", "어려움" 중 하나
- skills: 0~100 사이 정수, 영상에서 관찰된 수준 평가`
}
```

- [ ] **Step 4: 테스트 통과 확인**

```bash
npm run test:run -- __tests__/lib/gemini.test.ts
```

Expected: PASS - 4 tests passed

- [ ] **Step 5: 커밋**

```bash
git add lib/gemini.ts __tests__/lib/gemini.test.ts
git commit -m "feat: add Gemini prompt builder with tests"
```

---

## Task 11: Gemini API Route

**Files:**
- Create: `app/api/analyze/route.ts`

- [ ] **Step 1: `app/api/analyze/route.ts` 작성**

```typescript
// app/api/analyze/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { GoogleAIFileManager } from '@google/generative-ai/server'
import { writeFileSync, unlinkSync } from 'fs'
import path from 'path'
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

    // 영상을 /tmp에 임시 저장
    const bytes = await videoFile.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const tmpPath = path.join('/tmp', `squash-${Date.now()}.mp4`)
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
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' })
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
```

- [ ] **Step 2: TypeScript 오류 없음 확인**

```bash
npx tsc --noEmit
```

Expected: 오류 없음

- [ ] **Step 3: 커밋**

```bash
git add app/api/analyze/route.ts
git commit -m "feat: add Gemini API route for video analysis"
```

---

## Task 12: AnalysisLoader 애니메이션

**Files:**
- Create: `components/analyze/AnalysisLoader.tsx`

- [ ] **Step 1: `components/analyze/AnalysisLoader.tsx` 작성**

```tsx
// components/analyze/AnalysisLoader.tsx
'use client'

import { motion } from 'framer-motion'

const messages = [
  '영상을 분석하고 있어요...',
  '자세를 살펴보는 중이에요...',
  '훈련 루틴을 준비하고 있어요...',
  '거의 다 됐어요!',
]

interface AnalysisLoaderProps {
  messageIndex?: number
}

export function AnalysisLoader({ messageIndex = 0 }: AnalysisLoaderProps) {
  const message = messages[messageIndex % messages.length]

  return (
    <div className="flex flex-col items-center justify-center py-20 gap-10">
      {/* 공 튀는 애니메이션 */}
      <div className="relative h-24 flex items-end justify-center">
        <motion.div
          animate={{ y: [0, -60, 0] }}
          transition={{
            duration: 0.7,
            repeat: Infinity,
            ease: ['easeIn', 'easeOut'],
          }}
          className="text-4xl select-none"
        >
          🎾
        </motion.div>
        {/* 그림자 */}
        <motion.div
          animate={{ scaleX: [1, 0.4, 1], opacity: [0.4, 0.15, 0.4] }}
          transition={{ duration: 0.7, repeat: Infinity }}
          className="absolute bottom-0 w-8 h-2 bg-accent/30 rounded-full blur-sm"
        />
      </div>

      {/* 메시지 */}
      <motion.p
        key={message}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-foreground/60 text-sm"
      >
        {message}
      </motion.p>

      {/* 점 로딩 */}
      <div className="flex gap-1.5">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            animate={{ opacity: [0.2, 1, 0.2] }}
            transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
            className="w-1.5 h-1.5 rounded-full bg-accent"
          />
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: 커밋**

```bash
git add components/analyze/AnalysisLoader.tsx
git commit -m "feat: add bouncing ball analysis loader animation"
```

---

## Task 13: VideoPlayer 컴포넌트

**Files:**
- Create: `components/analyze/VideoPlayer.tsx`

- [ ] **Step 1: `components/analyze/VideoPlayer.tsx` 작성**

```tsx
// components/analyze/VideoPlayer.tsx
'use client'

import { useRef, useEffect } from 'react'

interface VideoPlayerProps {
  src: string
  seekTo?: number | null   // 초 단위
}

export function VideoPlayer({ src, seekTo }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    if (seekTo !== null && seekTo !== undefined && videoRef.current) {
      videoRef.current.currentTime = seekTo
      videoRef.current.play()
    }
  }, [seekTo])

  return (
    <div className="glass-card overflow-hidden">
      <video
        ref={videoRef}
        src={src}
        controls
        className="w-full aspect-video object-contain bg-black"
      />
    </div>
  )
}
```

- [ ] **Step 2: 커밋**

```bash
git add components/analyze/VideoPlayer.tsx
git commit -m "feat: add video player with timestamp seek support"
```

---

## Task 14: FeedbackCard 컴포넌트 (TDD)

**Files:**
- Create: `components/analyze/FeedbackCard.tsx`
- Create: `__tests__/components/FeedbackCard.test.tsx`

- [ ] **Step 1: 실패하는 테스트 작성**

```tsx
// __tests__/components/FeedbackCard.test.tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { FeedbackCard } from '@/components/analyze/FeedbackCard'
import type { ImprovementItem } from '@/lib/types'

const praise = ['서브가 정확했어요!', '풋워크가 빠르네요']
const improvements: ImprovementItem[] = [
  { timestamp: '00:15', message: '백핸드 개선 필요해요' },
  { timestamp: '00:42', message: '스윙 시 팔꿈치를 더 올려보세요' },
]

describe('FeedbackCard', () => {
  it('기본적으로 칭찬 탭을 보여준다', () => {
    render(<FeedbackCard praise={praise} improvements={improvements} onSeek={() => {}} />)
    expect(screen.getByText('서브가 정확했어요!')).toBeInTheDocument()
  })

  it('개선 탭 클릭 시 개선 항목이 표시된다', () => {
    render(<FeedbackCard praise={praise} improvements={improvements} onSeek={() => {}} />)
    fireEvent.click(screen.getByText('개선할 점'))
    expect(screen.getByText('백핸드 개선 필요해요')).toBeInTheDocument()
  })

  it('타임스탬프 클릭 시 onSeek가 초 단위로 호출된다', () => {
    const onSeek = vi.fn()
    render(<FeedbackCard praise={praise} improvements={improvements} onSeek={onSeek} />)
    fireEvent.click(screen.getByText('개선할 점'))
    fireEvent.click(screen.getByText('00:15'))
    expect(onSeek).toHaveBeenCalledWith(15)
  })
})
```

- [ ] **Step 2: 테스트 실패 확인**

```bash
npm run test:run -- __tests__/components/FeedbackCard.test.tsx
```

Expected: FAIL - `Cannot find module '@/components/analyze/FeedbackCard'`

- [ ] **Step 3: `components/analyze/FeedbackCard.tsx` 구현**

```tsx
// components/analyze/FeedbackCard.tsx
'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { ImprovementItem } from '@/lib/types'

function parseTimestampToSeconds(ts: string): number {
  const [mm, ss] = ts.split(':').map(Number)
  return mm * 60 + ss
}

interface FeedbackCardProps {
  praise: string[]
  improvements: ImprovementItem[]
  onSeek: (seconds: number) => void
}

export function FeedbackCard({ praise, improvements, onSeek }: FeedbackCardProps) {
  const [tab, setTab] = useState<'praise' | 'improve'>('praise')

  return (
    <div className="glass-card p-6">
      {/* 탭 헤더 */}
      <div className="flex gap-2 mb-6">
        {(['praise', 'improve'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-5 py-2 rounded-full text-sm font-semibold transition-all
              ${tab === t
                ? t === 'praise'
                  ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                  : 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                : 'text-foreground/40 hover:text-foreground/70'
              }`}
          >
            {t === 'praise' ? '칭찬할 점' : '개선할 점'}
          </button>
        ))}
      </div>

      {/* 탭 내용 */}
      <AnimatePresence mode="wait">
        {tab === 'praise' ? (
          <motion.ul
            key="praise"
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 8 }}
            className="space-y-3"
          >
            {praise.map((item, i) => (
              <li key={i} className="flex gap-3 items-start">
                <span className="text-green-400 mt-0.5">✓</span>
                <span className="text-foreground/80 text-sm">{item}</span>
              </li>
            ))}
          </motion.ul>
        ) : (
          <motion.ul
            key="improve"
            initial={{ opacity: 0, x: 8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -8 }}
            className="space-y-4"
          >
            {improvements.map((item, i) => (
              <li key={i} className="flex gap-3 items-start">
                <button
                  onClick={() => onSeek(parseTimestampToSeconds(item.timestamp))}
                  className="flex-shrink-0 px-2 py-0.5 rounded bg-accent/10 text-accent text-xs font-mono hover:bg-accent/20 transition-colors"
                >
                  {item.timestamp}
                </button>
                <span className="text-foreground/80 text-sm">{item.message}</span>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  )
}
```

- [ ] **Step 4: 테스트 통과 확인**

```bash
npm run test:run -- __tests__/components/FeedbackCard.test.tsx
```

Expected: PASS - 3 tests passed

- [ ] **Step 5: 커밋**

```bash
git add components/analyze/FeedbackCard.tsx __tests__/components/FeedbackCard.test.tsx
git commit -m "feat: add feedback card with praise/improvement tabs and TDD"
```

---

## Task 15: DrillCarousel 컴포넌트 (TDD)

**Files:**
- Create: `components/analyze/DrillCarousel.tsx`
- Create: `__tests__/components/DrillCarousel.test.tsx`

- [ ] **Step 1: 실패하는 테스트 작성**

```tsx
// __tests__/components/DrillCarousel.test.tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { DrillCarousel } from '@/components/analyze/DrillCarousel'
import type { DrillItem } from '@/lib/types'

const drills: DrillItem[] = [
  { name: '섀도우 스윙', duration: '10분', difficulty: '쉬움', description: '기본 스윙 연습', completed: false },
  { name: '백핸드 드라이브', duration: '15분', difficulty: '보통', description: '백핸드 강화', completed: false },
]

describe('DrillCarousel', () => {
  it('첫 번째 드릴 이름이 표시된다', () => {
    render(<DrillCarousel drills={drills} onSave={() => {}} />)
    expect(screen.getByText('섀도우 스윙')).toBeInTheDocument()
  })

  it('난이도 배지가 표시된다', () => {
    render(<DrillCarousel drills={drills} onSave={() => {}} />)
    expect(screen.getByText('쉬움')).toBeInTheDocument()
  })

  it('완료 버튼 클릭 시 체크 표시가 된다', () => {
    render(<DrillCarousel drills={drills} onSave={() => {}} />)
    const btn = screen.getByRole('button', { name: /완료/i })
    fireEvent.click(btn)
    expect(screen.getByText('완료!')).toBeInTheDocument()
  })

  it('루틴 저장 버튼 클릭 시 onSave가 호출된다', () => {
    const onSave = vi.fn()
    render(<DrillCarousel drills={drills} onSave={onSave} />)
    fireEvent.click(screen.getByRole('button', { name: /루틴 저장/i }))
    expect(onSave).toHaveBeenCalledOnce()
  })
})
```

- [ ] **Step 2: 테스트 실패 확인**

```bash
npm run test:run -- __tests__/components/DrillCarousel.test.tsx
```

Expected: FAIL - `Cannot find module '@/components/analyze/DrillCarousel'`

- [ ] **Step 3: `components/analyze/DrillCarousel.tsx` 구현**

```tsx
// components/analyze/DrillCarousel.tsx
'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { DrillItem, DrillDifficulty } from '@/lib/types'

const DIFFICULTY_COLOR: Record<DrillDifficulty, string> = {
  '쉬움': 'bg-green-500/20 text-green-400',
  '보통': 'bg-yellow-500/20 text-yellow-400',
  '어려움': 'bg-red-500/20 text-red-400',
}

interface DrillCarouselProps {
  drills: DrillItem[]
  onSave: (drills: DrillItem[]) => void
}

export function DrillCarousel({ drills: initialDrills, onSave }: DrillCarouselProps) {
  const [drills, setDrills] = useState(initialDrills)
  const [current, setCurrent] = useState(0)

  function toggleComplete(index: number) {
    setDrills((prev) =>
      prev.map((d, i) => (i === index ? { ...d, completed: !d.completed } : d))
    )
  }

  const drill = drills[current]

  return (
    <div className="glass-card p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground/60 uppercase tracking-wider">
          오늘의 훈련 루틴
        </h3>
        <span className="text-xs text-foreground/40">
          {current + 1} / {drills.length}
        </span>
      </div>

      {/* 카드 */}
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -30 }}
          transition={{ duration: 0.2 }}
          className="bg-glass border border-glass-border rounded-xl p-5 space-y-3"
        >
          <div className="flex items-start justify-between gap-2">
            <h4 className="font-semibold text-foreground">{drill.name}</h4>
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${DIFFICULTY_COLOR[drill.difficulty]}`}>
              {drill.difficulty}
            </span>
          </div>
          <p className="text-sm text-foreground/60">⏱ {drill.duration}</p>
          <p className="text-sm text-foreground/70 leading-relaxed">{drill.description}</p>
          <button
            onClick={() => toggleComplete(current)}
            className={`w-full py-2.5 rounded-lg text-sm font-semibold transition-all
              ${drill.completed
                ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                : 'bg-glass border border-glass-border hover:border-accent/40 text-foreground/70'
              }`}
          >
            {drill.completed ? '완료! ✓' : '완료'}
          </button>
        </motion.div>
      </AnimatePresence>

      {/* 네비게이션 */}
      <div className="flex gap-2">
        <button
          onClick={() => setCurrent((c) => Math.max(0, c - 1))}
          disabled={current === 0}
          className="flex-1 py-2 rounded-lg glass-card text-sm disabled:opacity-30 hover:border-white/20"
        >
          ← 이전
        </button>
        <button
          onClick={() => setCurrent((c) => Math.min(drills.length - 1, c + 1))}
          disabled={current === drills.length - 1}
          className="flex-1 py-2 rounded-lg glass-card text-sm disabled:opacity-30 hover:border-white/20"
        >
          다음 →
        </button>
      </div>

      {/* 인디케이터 */}
      <div className="flex justify-center gap-1.5">
        {drills.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`w-1.5 h-1.5 rounded-full transition-all
              ${i === current ? 'bg-accent w-4' : drills[i].completed ? 'bg-green-500' : 'bg-glass-border'}`}
          />
        ))}
      </div>

      {/* 저장 버튼 */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => onSave(drills)}
        className="w-full py-3 rounded-lg bg-accent/10 border border-accent/30 text-accent text-sm font-semibold hover:bg-accent/20 transition-colors"
        aria-label="루틴 저장"
      >
        루틴 저장 💾
      </motion.button>
    </div>
  )
}
```

- [ ] **Step 4: 테스트 통과 확인**

```bash
npm run test:run -- __tests__/components/DrillCarousel.test.tsx
```

Expected: PASS - 4 tests passed

- [ ] **Step 5: 전체 테스트 통과 확인**

```bash
npm run test:run
```

Expected: 12 tests passed

- [ ] **Step 6: 커밋**

```bash
git add components/analyze/DrillCarousel.tsx __tests__/components/DrillCarousel.test.tsx
git commit -m "feat: add drill carousel with completion tracking and TDD"
```

---

## Task 16: 분석 페이지 조립

**Files:**
- Create: `app/analyze/page.tsx`

- [ ] **Step 1: `app/analyze/page.tsx` 작성**

```tsx
// app/analyze/page.tsx
'use client'

import { useState, useRef } from 'react'
import { VideoUploader } from '@/components/analyze/VideoUploader'
import { MatchRecordForm } from '@/components/analyze/MatchRecordForm'
import { AnalysisLoader } from '@/components/analyze/AnalysisLoader'
import { VideoPlayer } from '@/components/analyze/VideoPlayer'
import { FeedbackCard } from '@/components/analyze/FeedbackCard'
import { DrillCarousel } from '@/components/analyze/DrillCarousel'
import { saveAnalysis } from '@/lib/storage'
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

    // 로딩 메시지 순환
    loaderInterval.current = setInterval(() => {
      setLoaderMsg((m) => m + 1)
    }, 3000)

    try {
      const formData = new FormData()
      formData.append('video', videoFile)
      formData.append('matchRecord', JSON.stringify(matchRecord))

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
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        matchRecord,
        praise: data.praise,
        improvements: data.improvements,
        drills: data.drills.map((d) => ({ ...d, completed: false })),
        skills: data.skills,
      }

      saveAnalysis(analysisResult)
      setResult(analysisResult)
      setState('result')
    } catch (err) {
      setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다')
      setState('upload')
    } finally {
      if (loaderInterval.current) clearInterval(loaderInterval.current)
    }
  }

  function handleSaveDrills(drills: DrillItem[]) {
    if (!result) return
    const updated = { ...result, drills }
    saveAnalysis(updated)
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold">영상 분석하기</h1>
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
              className={`w-full py-4 rounded-xl font-bold text-lg transition-all
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

        {state === 'result' && result && videoUrl && (
          <motion.div
            key="result"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* 비디오 플레이어 */}
            <VideoPlayer src={videoUrl} seekTo={seekTo} />

            {/* 피드백 카드 */}
            <FeedbackCard
              praise={result.praise}
              improvements={result.improvements}
              onSeek={(s) => setSeekTo(s)}
            />

            {/* 훈련 루틴 */}
            <DrillCarousel drills={result.drills} onSave={handleSaveDrills} />

            {/* 다시 분석 */}
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

- [ ] **Step 2: 전체 빌드 확인**

```bash
npm run build
```

Expected: Build 성공, 오류 없음

- [ ] **Step 3: 브라우저에서 전체 흐름 확인**

```bash
npm run dev
```

Expected:
- `/analyze` 접속 → 업로더 + 경기 기록 폼 표시
- 영상 업로드 → "AI 분석 시작" 버튼 활성화
- 분석 중 → 공 튀는 로딩 화면
- 분석 완료 → 비디오 + 피드백 + 루틴 카드 표시

- [ ] **Step 4: 커밋**

```bash
git add app/analyze/page.tsx
git commit -m "feat: assemble analyze page with full analysis flow"
```

---

## Task 17: 기록실 페이지 (Phase 2 스텁)

**Files:**
- Create: `app/history/page.tsx`

- [ ] **Step 1: `app/history/page.tsx` 작성**

```tsx
// app/history/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { getAnalyses } from '@/lib/storage'
import type { AnalysisResult } from '@/lib/types'

export default function HistoryPage() {
  const [analyses, setAnalyses] = useState<AnalysisResult[]>([])

  useEffect(() => {
    setAnalyses(getAnalyses())
  }, [])

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold">기록실</h1>
        <p className="text-foreground/40 text-sm mt-1">나의 성장 히스토리</p>
      </div>

      {analyses.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <p className="text-4xl mb-4">🎾</p>
          <p className="text-foreground/40">아직 분석 기록이 없습니다</p>
          <p className="text-foreground/30 text-sm mt-1">영상을 분석하면 여기에 기록이 쌓여요</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {analyses.map((a) => (
            <li key={a.id} className="glass-card p-5 flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm text-foreground/60">
                  {new Date(a.createdAt).toLocaleDateString('ko-KR', {
                    year: 'numeric', month: 'long', day: 'numeric'
                  })}
                </p>
                <p className="text-foreground/80 text-sm">
                  {a.praise[0] ?? '분석 완료'}
                </p>
              </div>
              <div className="flex items-center gap-3">
                {a.matchRecord.result && (
                  <span className={`text-xs px-3 py-1 rounded-full font-medium
                    ${a.matchRecord.result === 'win'
                      ? 'bg-accent/10 text-accent'
                      : 'bg-red-500/10 text-red-400'
                    }`}>
                    {a.matchRecord.result === 'win' ? '승' : '패'}
                  </span>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      <div className="glass-card p-6 text-center border border-accent/10">
        <p className="text-foreground/40 text-sm">레이더 차트 & 스트릭 배지는 Phase 2에서 추가됩니다</p>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: 최종 전체 테스트 확인**

```bash
npm run test:run
```

Expected: 11 tests passed, 0 failed

- [ ] **Step 3: 최종 빌드 확인**

```bash
npm run build
```

Expected: Build 성공

- [ ] **Step 4: 최종 커밋**

```bash
git add app/history/page.tsx
git commit -m "feat: add history page stub with analysis list"
```

---

## 완료 기준

- [ ] `npm run build` 성공
- [ ] `npm run test:run` 12개 테스트 통과
- [ ] `/` 랜딩 페이지 — 히어로 섹션 + CTA 버튼
- [ ] `/analyze` 분석 페이지 — 영상 업로드 → 경기 기록 → AI 분석 → 결과 표시
- [ ] `/history` 기록실 — 분석 기록 리스트
- [ ] localStorage에 분석 결과 저장 확인
- [ ] 타임스탬프 클릭 시 영상 해당 구간 이동 확인
