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
