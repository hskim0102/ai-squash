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
