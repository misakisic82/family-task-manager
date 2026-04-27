import { isMissed } from './periodKey'

// Productivity score: 0–100
// completionRate = done / total
// missedPenalty  = missed / total
// score          = completionRate * 100 - missedPenalty * 30, clamped 0–100
export function calcProductivityScore(tasks) {
  if (tasks.length === 0) return null

  const total  = tasks.length
  const done   = tasks.filter((t) => t.status === 'done').length
  const missed = tasks.filter((t) => isMissed(t)).length

  const completionRate = done / total
  const missedPenalty  = missed / total
  const raw = completionRate * 100 - missedPenalty * 30

  return Math.min(100, Math.max(0, Math.round(raw)))
}

// Tailwind text color classes based on score tier
export function scoreTextColor(score) {
  if (score === null)  return 'text-slate-400 dark:text-slate-500'
  if (score >= 75)     return 'text-emerald-500 dark:text-emerald-400'
  if (score >= 40)     return 'text-amber-500 dark:text-amber-400'
  return 'text-red-500 dark:text-red-400'
}

// Tailwind background color classes for the progress bar (80 / 50 breakpoints)
export function scoreBarColor(score) {
  if (score >= 80) return 'bg-emerald-500'
  if (score >= 50) return 'bg-amber-400'
  return 'bg-red-400'
}
