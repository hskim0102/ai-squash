import { getDeviceId } from './deviceId'
import type { AnalysisResult, DrillItem } from './types'

function headers() {
  return { 'x-device-id': getDeviceId() }
}

export async function getAnalyses(): Promise<AnalysisResult[]> {
  try {
    const res = await fetch('/api/analyses', { headers: headers() })
    if (!res.ok) return []
    const data = await res.json()
    return data.analyses as AnalysisResult[]
  } catch {
    return []
  }
}

export async function getAnalysis(id: string): Promise<AnalysisResult | null> {
  try {
    const res = await fetch(`/api/analyses/${id}`, { headers: headers() })
    if (!res.ok) return null
    return res.json()
  } catch {
    return null
  }
}

export async function updateDrills(id: string, drills: DrillItem[]): Promise<void> {
  await fetch(`/api/analyses/${id}`, {
    method: 'PATCH',
    headers: { ...headers(), 'Content-Type': 'application/json' },
    body: JSON.stringify({ drills }),
  })
}
