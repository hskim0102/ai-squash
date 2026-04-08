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
