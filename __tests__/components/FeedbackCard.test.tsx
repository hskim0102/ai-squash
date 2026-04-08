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
