'use client'

import { useEffect } from 'react'
import { getDeviceId } from '@/lib/deviceId'

const MIGRATION_DONE_KEY = 'squashvibe_migrated_v2'
const OLD_STORAGE_KEY = 'squashvibe_analyses'

export function ClientProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (localStorage.getItem(MIGRATION_DONE_KEY)) return

    const raw = localStorage.getItem(OLD_STORAGE_KEY)
    if (!raw) {
      localStorage.setItem(MIGRATION_DONE_KEY, '1')
      return
    }

    try {
      const analyses = JSON.parse(raw)
      const deviceId = getDeviceId()

      fetch('/api/migrate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deviceId, analyses }),
      }).then((res) => {
        if (res.ok) {
          localStorage.removeItem(OLD_STORAGE_KEY)
          localStorage.setItem(MIGRATION_DONE_KEY, '1')
        }
      })
    } catch {
      localStorage.setItem(MIGRATION_DONE_KEY, '1')
    }
  }, [])

  return <>{children}</>
}
