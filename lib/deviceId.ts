export function getDeviceId(): string {
  const existing = localStorage.getItem('device_id')
  if (existing) return existing
  const id = crypto.randomUUID()
  localStorage.setItem('device_id', id)
  return id
}
