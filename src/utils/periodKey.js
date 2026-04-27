// Returns the ISO week number (1-53) for a given date.
// ISO weeks start on Monday; week 1 contains the year's first Thursday.
function getISOWeek(date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  const day = d.getUTCDay() || 7
  d.setUTCDate(d.getUTCDate() + 4 - day)
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
  return Math.ceil((((d - yearStart) / 86400000) + 1) / 7)
}

// Returns a period key string for the given periodType and date.
//
// Examples (for 2026-04-22, which is in week 17):
//   getPeriodKey('daily')   → "2026-04-22"
//   getPeriodKey('weekly')  → "2026-W17"
//   getPeriodKey('monthly') → "2026-04"
export function getPeriodKey(periodType, date = new Date()) {
  const year  = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day   = String(date.getDate()).padStart(2, '0')

  if (periodType === 'daily')   return `${year}-${month}-${day}`
  if (periodType === 'weekly')  return `${year}-W${String(getISOWeek(date)).padStart(2, '0')}`
  if (periodType === 'monthly') return `${year}-${month}`

  return ''
}

// Returns the exact moment a period ends (as a Date object).
//
// Daily   → 23:59:59 on that calendar day
// Weekly  → 23:59:59 on the Sunday of that ISO week
// Monthly → 23:59:59 on the last day of that month
export function getPeriodEnd(periodType, periodKey) {
  if (periodType === 'daily') {
    return new Date(periodKey + 'T23:59:59')
  }

  if (periodType === 'weekly') {
    const [yearStr, weekStr] = periodKey.split('-W')
    const year = Number(yearStr)
    const week = Number(weekStr)
    // Jan 4 is always in ISO week 1 — use it to find Monday of week 1
    const jan4       = new Date(year, 0, 4)
    const jan4Day    = jan4.getDay() || 7          // Mon=1 … Sun=7
    const weekOneMon = new Date(jan4)
    weekOneMon.setDate(jan4.getDate() - (jan4Day - 1))
    // Monday of the target week
    const monday = new Date(weekOneMon)
    monday.setDate(weekOneMon.getDate() + (week - 1) * 7)
    // Sunday = Monday + 6
    const sunday = new Date(monday)
    sunday.setDate(monday.getDate() + 6)
    sunday.setHours(23, 59, 59, 999)
    return sunday
  }

  if (periodType === 'monthly') {
    const [yearStr, monthStr] = periodKey.split('-')
    const year  = Number(yearStr)
    const month = Number(monthStr)   // 1-based (e.g. 4 = April)
    // Day 0 of month+1 === last day of month
    const end = new Date(year, month, 0)
    end.setHours(23, 59, 59, 999)
    return end
  }

  return null
}

// Returns true when a task's period has already ended and the task is not done.
export function isMissed(task) {
  if (task.status === 'done') return false
  if (!task.periodType || !task.periodKey) return false
  const end = getPeriodEnd(task.periodType, task.periodKey)
  if (!end) return false
  return new Date() > end
}
