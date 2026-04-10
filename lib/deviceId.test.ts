import { describe, it, expect, beforeEach } from 'vitest'
import { getDeviceId } from './deviceId'

describe('getDeviceId', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('생성된 ID가 UUID 형식이다', () => {
    const id = getDeviceId()
    expect(id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    )
  })

  it('두 번 호출해도 같은 ID를 반환한다', () => {
    expect(getDeviceId()).toBe(getDeviceId())
  })

  it('localStorage에 저장한다', () => {
    const id = getDeviceId()
    expect(localStorage.getItem('device_id')).toBe(id)
  })

  it('기존 device_id가 있으면 그것을 반환한다', () => {
    localStorage.setItem('device_id', 'existing-id-123')
    expect(getDeviceId()).toBe('existing-id-123')
  })
})
