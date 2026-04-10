/** Input must be full ISO datetime strings (e.g. from Date.toISOString()), not bare YYYY-MM-DD. */
export function calcStreak(dates: string[]): number {
  if (dates.length === 0) return 0

  const fmt = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

  const daySet = new Set(dates.map((iso) => fmt(new Date(iso))))

  const today = new Date()
  const cursor = new Date(today)
  if (!daySet.has(fmt(today))) {
    cursor.setDate(cursor.getDate() - 1)
  }

  let streak = 0
  while (daySet.has(fmt(cursor))) {
    streak++
    cursor.setDate(cursor.getDate() - 1)
  }

  return streak
}
