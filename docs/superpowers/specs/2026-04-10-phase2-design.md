# SquashVibe AI — Phase 2 설계 문서

**작성일**: 2026-04-10  
**버전**: v1.0  
**기반 문서**: 2026-04-07-ai-squash-design.md

---

## 1. Phase 2 범위

| 기능 | 설명 |
|------|------|
| 로컬 MySQL 연동 | Prisma ORM + MySQL (localhost:3306) |
| localStorage 마이그레이션 | 기존 데이터 → MySQL 일회성 이전 |
| 영상 파일 저장 | `public/uploads/{deviceId}/{id}.{ext}` |
| `/history` 개선 | 레이더 차트 + 스트릭 배지 + 리스트 |
| `/history/[id]` | 분석 상세 페이지 (영상 재생 + 피드백 + 드릴) |
| 레이더 차트 | 최근 5회 분석 평균 skills 시각화 (Recharts) |
| 스트릭 배지 | 분석 업로드 날짜 기준 연속 일수 (3일/7일/30일) |

---

## 2. 데이터베이스 설정

### 연결 정보

```env
# .env.local
DATABASE_URL="mysql://root:root@localhost:3306/aisquash"
```

### Prisma 스키마 (`prisma/schema.prisma`)

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
  matchRecord  Json                        -- { result, condition, memo }
  praise       Json                        -- string[]
  improvements Json                        -- { timestamp, message }[]
  drills       Json                        -- DrillItem[]
  skills       Json                        -- { accuracy, power, activity }
  videoPath    String?                     -- nullable (구 데이터 없음)

  @@index([deviceId, createdAt])
}
```

### Prisma 클라이언트 싱글턴 (`lib/prisma.ts`)

```ts
import { PrismaClient } from '@prisma/client'

const globalForPrisma = global as unknown as { prisma: PrismaClient }

export const prisma =
  globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
```

---

## 3. 디바이스 ID

로그인 없이 익명으로 자기 데이터만 구분하는 방식.

```ts
// lib/deviceId.ts
export function getDeviceId(): string {
  let id = localStorage.getItem('device_id')
  if (!id) {
    id = crypto.randomUUID()
    localStorage.setItem('device_id', id)
  }
  return id
}
```

모든 DB 쿼리는 `deviceId`를 `where` 조건에 포함. RLS 없으므로 애플리케이션 레벨에서 강제.

---

## 4. localStorage → MySQL 마이그레이션

앱 초기화 시 한 번만 실행. `lib/migrate.ts`:

```
1. localStorage에서 기존 analyses 배열 읽기
2. 데이터가 있으면 → POST /api/migrate 호출
3. API Route에서 Prisma upsert (id 중복 방지)
4. 성공 시 localStorage analyses 키 삭제
5. 이후 모든 읽기/쓰기는 MySQL
```

실행 위치: `app/layout.tsx` 또는 최상위 `ClientProvider` 컴포넌트 (`useEffect` 한 번).

---

## 5. 영상 파일 저장

### 저장 경로

```
public/uploads/{deviceId}/{analysisId}.{ext}
```

`public/` 하위이므로 Next.js가 정적 파일로 직접 서빙 → `/uploads/...` URL로 바로 재생 가능.

### API Route 변경 (`app/api/analyze/route.ts`)

```
1. FormData에서 video 파일 추출
2. public/uploads/{deviceId}/ 디렉토리 생성 (없으면)
3. fs.writeFile로 저장
4. videoPath를 DB에 함께 저장
```

### .gitignore 추가

```
public/uploads/
```

### API Route 업로드 크기 설정

Next.js App Router API Route에서 대용량 파일 처리:

```ts
// app/api/analyze/route.ts 상단에 추가
export const config = {
  api: { bodyParser: false },  // FormData 직접 처리
}
```

Next.js 14 App Router는 기본적으로 FormData를 지원하므로 별도 설정 없이 `request.formData()`로 파싱 가능. 단, 기본 body 크기 제한(4MB)을 넘는 영상은 next.config.ts에서 조정:

```ts
// next.config.ts
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client'],
  },
}
```

실제 대용량 업로드 한계는 운영 서버의 리버스 프록시(nginx 등) 설정에서 결정됨. 셀프호스팅이므로 nginx `client_max_body_size 500m;` 설정 필요.

---

## 6. lib/storage.ts 인터페이스 교체

기존 `lib/storage.ts`는 localStorage 기반이었으나, 동일한 함수 시그니처를 유지하면서 내부 구현을 Prisma API 호출로 교체.

```ts
// 기존 시그니처 유지 (호출부 코드 변경 없음)
export async function saveAnalysis(data: AnalysisResult): Promise<void>
export async function getAnalyses(): Promise<AnalysisResult[]>
export async function getAnalysis(id: string): Promise<AnalysisResult | null>
```

클라이언트 컴포넌트에서는 직접 Prisma를 부를 수 없으므로, 내부적으로 `/api/analyses` API Route를 통해 통신.

---

## 7. `/history` 페이지 개편

### 레이아웃 (3-zone)

```
┌─────────────────────────────────────┐
│  📊 실력 레이더 차트                  │
│  최근 5회 분석 평균 (accuracy/power/activity)│
├─────────────┬───────────────────────┤
│  🔥 현재 N일│  총 분석 횟수           │
│  스트릭 배지│  (3일/7일/30일 달성 여부)│
├─────────────┴───────────────────────┤
│  📋 분석 기록 리스트                  │
│  [날짜] [승/패] [가장 잘한 점 한 줄]  │
│  → 클릭 시 /history/[id]            │
└─────────────────────────────────────┘
```

분석 기록이 없으면 차트·배지 영역 숨김, 기존 빈 상태 UI 표시.

---

## 8. `/history/[id]` 상세 페이지

```
← 기록실로  [날짜]  [승/패 배지]

🎬 VideoPlayer
   - videoPath 있으면: 영상 재생 + 타임스탬프 클릭 구간 이동
   - videoPath 없으면: "영상 파일이 없습니다" 안내

📝 FeedbackCard (칭찬 / 개선 탭)
   - videoPath 없으면 타임스탬프 버튼 비활성화

🏋️ DrillCarousel (완료 체크 + 저장 가능)

📊 RadarChart (해당 분석 당시 skills 값)
```

데이터는 `/api/analyses/[id]` GET 요청으로 조회. `deviceId` 일치 여부 서버에서 검증.

---

## 9. 레이더 차트 컴포넌트 (`components/history/RadarChart.tsx`)

```
라이브러리: recharts (이미 설치됨)
컴포넌트: RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer

데이터: skills[] 배열을 받아 평균 계산 후 렌더
축: 정확도 / 파워 / 활동량
채우기: #D4FF00 20% 투명도
선: #D4FF00
```

---

## 10. 스트릭 배지 (`lib/streak.ts` + `components/history/StreakBadge.tsx`)

### 계산 로직

```ts
// lib/streak.ts
export function calcStreak(dates: Date[]): number {
  // 날짜 중복 제거 후 최신순 정렬
  // 오늘부터 역순으로 연속 날짜 카운트
  // 하루라도 빠지면 중단
}
```

### 배지 정의

| 배지 | 조건 | 라벨 |
|------|------|-------|
| 🔥 | 3일 이상 | 열정 스타터 |
| ⚡ | 7일 이상 | 주간 챔피언 |
| 👑 | 30일 이상 | 레전드 플레이어 |

미달성 배지는 `opacity-30` 처리.

---

## 11. API Routes 목록

| Method | Path | 설명 |
|--------|------|------|
| POST | `/api/analyze` | 영상 분석 + 파일 저장 + DB 저장 |
| POST | `/api/migrate` | localStorage 데이터 일괄 마이그레이션 |
| GET | `/api/analyses` | deviceId 기반 전체 목록 조회 |
| GET | `/api/analyses/[id]` | 단일 분석 조회 |
| PATCH | `/api/analyses/[id]` | 드릴 완료 상태 업데이트 |

---

## 12. 파일 변경 목록

### 신규 추가

```
prisma/
  schema.prisma

lib/
  prisma.ts
  deviceId.ts
  streak.ts
  migrate.ts

app/
  api/
    migrate/route.ts
    analyses/route.ts
    analyses/[id]/route.ts
  history/[id]/page.tsx

components/
  history/
    RadarChart.tsx
    StreakBadge.tsx
    HistoryList.tsx
```

### 변경

```
lib/storage.ts              — Prisma API 호출로 교체
lib/types.ts                — AnalysisResult에 videoPath?: string 추가
app/api/analyze/route.ts    — 영상 파일 저장 + videoPath DB 저장
app/history/page.tsx        — 3-zone 레이아웃으로 개편
app/layout.tsx              — ClientProvider 추가 (마이그레이션 트리거)
next.config.ts              — 업로드 크기 제한 설정
.gitignore                  — public/uploads/ 추가
```

---

## 13. 기술 스택 변경

| 항목 | Phase 1 | Phase 2 |
|------|---------|---------|
| 데이터 저장 | localStorage | MySQL (로컬) |
| ORM | 없음 | Prisma |
| 영상 저장 | 없음 | public/uploads/ (로컬) |
| 배포 | Vercel | 셀프호스팅 (로컬 서버) |
