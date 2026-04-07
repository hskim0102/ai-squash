프로젝트명: SquashVibe AI (AI 스쿼시 코치)

1. 프로젝트 비전

스쿼시 구력 3년 차 사용자의 경기 영상을 분석하여, 전문 코치의 피드백을 데이터로 시각화해주는 AI 개인 비서 서비스.

2. 디자인 시스템 (UI/UX 트렌드: Modern Dark & Precision)

Theme: Dark Mode (Background: #0A0A0A)

Accent Color: Neon Lime (#D4FF00 - 스쿼시 공의 에너지를 상징)

Style: - Glassmorphism (은은한 투명도와 블러 효과)

Bento Grid Layout (기능별 깔끔한 카드 배치)

Micro-interactions (버튼 호버 시 부드러운 글로우 효과)

3. 핵심 기능 요구사항

Phase 1: 분석 엔진 (MVP)

Video Upload: 드래그 앤 드롭 방식의 미디어 업로더 (최대 1분 클립 권장).

Gemini Analysis: Google Gemini 1.5 Pro API를 연동하여 영상의 프레임별 자세 분석.

AI Feedback Card: - '칭찬할 점'과 '개선할 점'을 명확히 구분하여 출력.

타임스탬프 링크 제공 (예: 00:15초 - "백핸드 시 임팩트 위치가 너무 뒤에 있습니다").

Phase 2: 대시보드 & 데이터 (활용성)

Skill Chart: 실력 향상도(정확도, 파워, 활동량)를 레이더 차트로 시각화.

History Log: 과거 분석 데이터를 리스트로 관리하여 변화 추이 추적.

4. 기술 스택

Frontend: Next.js 14 (App Router), Tailwind CSS

UI Component: Shadcn UI, Framer Motion (애니메이션)

Database: Prisma + PostgreSQL (Supabase 추천)

AI Engine: Google Gemini SDK (Vertex AI)

Deployment: Vercel

5. UI 상세 설계 (User Flow)

Landing: "당신의 랠리를 데이터로 증명하세요" - 강렬한 히어로 섹션.

Dashboard: 벤토 그리드 형태로 최근 분석 결과, 주간 활동량, 목표 달성률 표시.

Analysis Page: 왼쪽에는 비디오 플레이어, 오른쪽에는 실시간 스트리밍 형태로 생성되는 AI 코칭 리포트.

6. 초기 프롬프트 가이드 (Cursor/Claude용)

"위에 정의된 AI_Squash.md를 기반으로 프로젝트를 시작할 거야. 먼저 Shadcn UI와 다크 모드가 적용된 세련된 대시보드 레이아웃부터 짜줘. 사이드바에는 '홈, 분석하기, 기록실' 메뉴를 넣어줘."