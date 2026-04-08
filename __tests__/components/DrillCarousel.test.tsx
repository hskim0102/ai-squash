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
