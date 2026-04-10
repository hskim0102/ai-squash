'use client'

import { useEffect, useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface Comment {
  id: string
  author: string
  content: string
  createdAt: string
}

interface Props {
  analysisId: string
}

export function CommentSection({ analysisId }: Props) {
  const [comments, setComments] = useState<Comment[]>([])
  const [author, setAuthor] = useState('')
  const [content, setContent] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetch(`/api/analyses/${analysisId}/comments`)
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setComments(data)
      })
  }, [analysisId])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!content.trim()) return
    setSubmitting(true)
    setError(null)

    try {
      const res = await fetch(`/api/analyses/${analysisId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ author: author.trim(), content: content.trim() }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || '댓글 등록 실패')
      }

      const newComment: Comment = await res.json()
      setComments((prev) => [...prev, newComment])
      setContent('')
      setAuthor('')

      // 새 댓글로 스크롤
      setTimeout(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
      }, 100)
    } catch (err) {
      setError(err instanceof Error ? err.message : '오류가 발생했습니다')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="glass-card p-4 md:p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center gap-2">
        <span className="text-lg">💬</span>
        <h2 className="font-bold text-[#0D1B2E]">응원 댓글</h2>
        {comments.length > 0 && (
          <span className="ml-auto text-xs font-semibold px-2 py-0.5 rounded-full bg-[#C8F000]/20 text-[#5a7000]">
            {comments.length}개
          </span>
        )}
      </div>

      <div className="court-divider" />

      {/* 댓글 목록 */}
      {comments.length === 0 ? (
        <div className="text-center py-6">
          <p className="text-3xl mb-2">🎾</p>
          <p className="text-[#4A6080] text-sm">첫 번째 응원을 남겨보세요!</p>
        </div>
      ) : (
        <ul className="space-y-3 max-h-72 overflow-y-auto pr-1">
          <AnimatePresence initial={false}>
            {comments.map((c) => (
              <motion.li
                key={c.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="flex gap-3 items-start"
              >
                {/* Avatar */}
                <div
                  className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold text-[#0D1B2E]"
                  style={{ background: 'linear-gradient(135deg, #C8F000, #a8d400)' }}
                >
                  {c.author.charAt(0).toUpperCase()}
                </div>
                {/* Bubble */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="text-sm font-semibold text-[#0D1B2E]">{c.author}</span>
                    <span className="text-xs text-[#4A6080]">
                      {new Date(c.createdAt).toLocaleDateString('ko-KR', {
                        month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
                      })}
                    </span>
                  </div>
                  <p
                    className="text-sm text-[#0D1B2E] leading-relaxed px-3 py-2 rounded-xl rounded-tl-none"
                    style={{ background: 'rgba(13,27,46,0.05)' }}
                  >
                    {c.content}
                  </p>
                </div>
              </motion.li>
            ))}
          </AnimatePresence>
          <div ref={bottomRef} />
        </ul>
      )}

      {/* 입력 폼 */}
      <form onSubmit={handleSubmit} className="space-y-3 pt-1">
        <div className="flex gap-2">
          <input
            type="text"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            placeholder="이름 (선택)"
            maxLength={50}
            className="w-28 flex-shrink-0 px-3 py-2 rounded-xl text-sm outline-none transition-all text-[#0D1B2E] placeholder-[#4A6080]/50"
            style={{
              background: 'rgba(13,27,46,0.06)',
              border: '1px solid rgba(13,27,46,0.12)',
            }}
            onFocus={(e) => (e.target.style.borderColor = '#C8F000')}
            onBlur={(e) => (e.target.style.borderColor = 'rgba(13,27,46,0.12)')}
          />
          <input
            type="text"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="응원 메시지를 남겨주세요 🎾"
            maxLength={500}
            required
            className="flex-1 px-3 py-2 rounded-xl text-sm outline-none transition-all text-[#0D1B2E] placeholder-[#4A6080]/50"
            style={{
              background: 'rgba(13,27,46,0.06)',
              border: '1px solid rgba(13,27,46,0.12)',
            }}
            onFocus={(e) => (e.target.style.borderColor = '#C8F000')}
            onBlur={(e) => (e.target.style.borderColor = 'rgba(13,27,46,0.12)')}
          />
        </div>

        {error && (
          <p className="text-xs text-red-500 px-1">{error}</p>
        )}

        <div className="flex justify-end">
          <motion.button
            type="submit"
            disabled={submitting || !content.trim()}
            whileHover={!submitting && content.trim() ? { scale: 1.02 } : {}}
            whileTap={!submitting && content.trim() ? { scale: 0.97 } : {}}
            className="px-5 py-2 rounded-xl text-sm font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            style={
              !submitting && content.trim()
                ? {
                    background: 'linear-gradient(135deg, #C8F000, #a8d400)',
                    color: '#0D1B2E',
                    boxShadow: '0 2px 12px rgba(200,240,0,0.4)',
                  }
                : { background: 'rgba(13,27,46,0.08)', color: '#4A6080' }
            }
          >
            {submitting ? '등록 중...' : '응원하기 🎉'}
          </motion.button>
        </div>
      </form>
    </div>
  )
}
