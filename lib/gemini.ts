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
