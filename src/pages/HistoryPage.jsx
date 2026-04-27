import { useState, useEffect } from 'react'
import familyData from '../data/familyData'
import { supabase } from '../lib/supabaseClient'
import { getPeriodKey, isMissed } from '../utils/periodKey'
import MiniCalendar from '../components/MiniCalendar'

// ── Date helpers ──────────────────────────────────────────────────────────────

function addDays(date, n) {
  const d = new Date(date)
  d.setDate(d.getDate() + n)
  return d
}

function addMonths(date, n) {
  const d = new Date(date)
  d.setMonth(d.getMonth() + n)
  return d
}

// ── Display label helpers ─────────────────────────────────────────────────────

const MONTHS       = ['January','February','March','April','May','June','July','August','September','October','November','December']
const SHORT_MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
const WEEKDAYS     = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']

function formatDailyLabel(date) {
  return `${WEEKDAYS[date.getDay()]}, ${SHORT_MONTHS[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`
}

function formatWeeklyLabel(date) {
  const weekNum = getPeriodKey('weekly', date).split('W')[1]
  const dayOfWeek = date.getDay() || 7
  const monday = addDays(date, 1 - dayOfWeek)
  const sunday = addDays(monday, 6)
  const sameMonth = monday.getMonth() === sunday.getMonth()
  const range = sameMonth
    ? `${SHORT_MONTHS[monday.getMonth()]} ${monday.getDate()}–${sunday.getDate()}`
    : `${SHORT_MONTHS[monday.getMonth()]} ${monday.getDate()} – ${SHORT_MONTHS[sunday.getMonth()]} ${sunday.getDate()}`
  return `Week ${weekNum} · ${range}, ${sunday.getFullYear()}`
}

function formatMonthlyLabel(date) {
  return `${MONTHS[date.getMonth()]} ${date.getFullYear()}`
}

function formatCompletedAt(isoString) {
  const d = new Date(isoString)
  const h = String(d.getHours()).padStart(2, '0')
  const m = String(d.getMinutes()).padStart(2, '0')
  return `${SHORT_MONTHS[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()} at ${h}:${m}`
}

// ── Data helpers ──────────────────────────────────────────────────────────────

function getStoredMembers() {
  try {
    const saved = localStorage.getItem('family-members')
    if (saved) return JSON.parse(saved)
  } catch {}
  return familyData.map((m) => ({ id: m.id, name: m.name, role: m.role ?? '' }))
}

// Convert a Supabase task row (snake_case) to the shape the UI expects (camelCase)
function toTask(row) {
  return {
    id:          row.id,
    title:       row.title,
    description: row.description || '',
    status:      row.status,
    periodType:  row.period_type,
    periodKey:   row.period_key,
    completedAt: row.completed_at,
    updatedAt:   row.updated_at,
    createdAt:   row.created_at,
  }
}

// ── Status + period config ─────────────────────────────────────────────────────

const STATUS_LABEL = { todo: 'To Do', inprogress: 'In Progress', done: 'Done' }

const STATUS_BADGE = {
  todo:       'bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400',
  inprogress: 'bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400',
  done:       'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
}

const DOT_COLOR = {
  todo:       'bg-slate-300 dark:bg-slate-600',
  inprogress: 'bg-amber-400',
  done:       'bg-emerald-400',
}

const PERIOD_TYPE_LABEL = { daily: 'Daily', weekly: 'Weekly', monthly: 'Monthly' }

// ── View modes ────────────────────────────────────────────────────────────────

const VIEW_MODES = [
  { id: 'daily',   label: 'Day'   },
  { id: 'weekly',  label: 'Week'  },
  { id: 'monthly', label: 'Month' },
]

// ── Timeline helpers ──────────────────────────────────────────────────────────

function getTaskTimestamp(task) {
  // Use the most meaningful time: when it was completed, otherwise last updated.
  return new Date(task.completedAt ?? task.updatedAt ?? task.createdAt)
}

function getDayLabel(date) {
  const today     = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(today.getDate() - 1)

  const same = (a, b) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth()    === b.getMonth()    &&
    a.getDate()     === b.getDate()

  if (same(date, today))     return 'Today'
  if (same(date, yesterday)) return 'Yesterday'
  return `${SHORT_MONTHS[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`
}

// ── Timeline sub-components ───────────────────────────────────────────────────

function TimelineItem({ task, isLast }) {
  const isDone  = task.status === 'done'
  const missed  = isMissed(task)
  const dot     = missed ? 'bg-red-400' : (DOT_COLOR[task.status] ?? 'bg-slate-300')

  return (
    <div className="flex gap-4">
      {/* Dot + spine segment */}
      <div className="flex flex-col items-center w-7 shrink-0">
        <div className={`w-3 h-3 rounded-full mt-1 shrink-0 ring-2 ring-white dark:ring-slate-900 ${dot}`} />
        {!isLast && <div className="flex-1 w-px bg-slate-200 dark:bg-slate-700 mt-1" />}
      </div>

      {/* Card */}
      <div className={`flex-1 mb-4 ${isDone ? 'opacity-70' : ''}`}>
        <div className={[
          'rounded-xl px-4 py-3 shadow-sm',
          missed
            ? 'bg-red-50/60 dark:bg-slate-800 border border-red-200 dark:border-red-900/60'
            : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700',
        ].join(' ')}>
          {/* Title + status badge */}
          <div className="flex items-start justify-between gap-3">
            <p className={`text-sm font-medium leading-snug ${isDone ? 'text-slate-400 dark:text-slate-500' : 'text-slate-800 dark:text-slate-200'}`}>
              {task.title}
            </p>
            <div className="flex items-center gap-1.5 shrink-0">
              {missed && (
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-red-100 text-red-500 dark:bg-red-900/30 dark:text-red-400">
                  Missed
                </span>
              )}
              <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${STATUS_BADGE[task.status]}`}>
                {STATUS_LABEL[task.status]}
              </span>
            </div>
          </div>

          {/* Optional description */}
          {task.description && (
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 leading-relaxed">
              {task.description}
            </p>
          )}

          {/* Meta row */}
          <div className="flex items-center gap-1.5 mt-2 flex-wrap">
            <span className="text-xs text-slate-400 dark:text-slate-500">
              {PERIOD_TYPE_LABEL[task.periodType] ?? task.periodType}
            </span>
            <span className="text-xs text-slate-200 dark:text-slate-700">·</span>
            {task.completedAt ? (
              <span className="text-xs text-emerald-500 dark:text-emerald-400">
                Completed on {formatCompletedAt(task.completedAt)}
              </span>
            ) : (
              <span className="text-xs text-slate-400 dark:text-slate-500">Not completed</span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function TimelineGroup({ date, tasks }) {
  return (
    <div>
      {/* Day header */}
      <div className="flex items-center gap-3 mb-3">
        <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider whitespace-nowrap">
          {getDayLabel(date)}
        </span>
        <div className="flex-1 h-px bg-slate-100 dark:bg-slate-700" />
      </div>

      {/* Items — spine is drawn by each item's dot column */}
      <div>
        {tasks.map((task, i) => (
          <TimelineItem key={task.id} task={task} isLast={i === tasks.length - 1} />
        ))}
      </div>
    </div>
  )
}

function Timeline({ tasks, emptyHint }) {
  if (tasks.length === 0) {
    return (
      <div className="text-center py-20 border border-dashed border-slate-200 dark:border-slate-700 rounded-xl">
        <p className="text-sm font-medium text-slate-400 dark:text-slate-500">No activity for this period.</p>
        {emptyHint && <p className="text-xs text-slate-300 dark:text-slate-600 mt-1">{emptyHint}</p>}
      </div>
    )
  }

  // Sort: most recent timestamp first
  const sorted = [...tasks].sort((a, b) => getTaskTimestamp(b) - getTaskTimestamp(a))

  // Group by calendar day (using the same timestamp used for sorting)
  const groups = []
  const seenKeys = {}
  for (const task of sorted) {
    const d   = getTaskTimestamp(task)
    const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`
    if (!seenKeys[key]) {
      const group = { date: d, tasks: [] }
      seenKeys[key] = group
      groups.push(group)
    }
    seenKeys[key].tasks.push(task)
  }

  return (
    <div className="flex flex-col gap-6">
      {groups.map((group, i) => (
        <TimelineGroup key={i} date={group.date} tasks={group.tasks} />
      ))}
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

function HistoryPage() {
  const members = getStoredMembers()

  const [selectedMemberId, setSelectedMemberId] = useState('')
  const [viewMode, setViewMode]                 = useState('daily')
  const [selectedDate, setSelectedDate]         = useState(() => new Date())
  const [tasks, setTasks]                       = useState([])
  const [loading, setLoading]                   = useState(false)
  const [error, setError]                       = useState(null)

  // Load all tasks for the selected member from Supabase.
  // We fetch everything for the member at once so the calendar indicators
  // (which need all daily task dates) and the timeline (current period) can
  // both be derived from the same data without extra round-trips.
  useEffect(() => {
    if (!selectedMemberId) {
      setTasks([])
      return
    }

    async function loadTasks() {
      setLoading(true)
      setError(null)

      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        setLoading(false)
        return
      }

      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', session.user.id)
        .eq('member_id', selectedMemberId)

      if (error) {
        setError(error.message)
      } else {
        setTasks(data.map(toTask))
      }
      setLoading(false)
    }

    loadTasks()
  }, [selectedMemberId])

  // Filter tasks to only those that match the currently selected period.
  // period_type must match the view mode, and period_key must match the
  // exact key for the selected date (e.g. "2026-04-24", "2026-W17", "2026-04").
  const activePeriodKey = getPeriodKey(viewMode, selectedDate)
  const activeTasks     = tasks.filter(
    (t) => t.periodType === viewMode && t.periodKey === activePeriodKey
  )

  // ── Calendar task indicators (Day mode only) ────────────────────────────────
  // Scan all loaded daily tasks (across all dates) to compute which calendar
  // days have tasks and which are fully completed.

  const taskDates    = new Set()
  const allDoneDates = new Set()

  if (selectedMemberId) {
    const byDate = {}
    for (const t of tasks.filter((t) => t.periodType === 'daily')) {
      if (!t.periodKey) continue
      if (!byDate[t.periodKey]) byDate[t.periodKey] = []
      byDate[t.periodKey].push(t)
    }
    for (const [key, dayTasks] of Object.entries(byDate)) {
      taskDates.add(key)
      if (dayTasks.every((t) => t.status === 'done')) allDoneDates.add(key)
    }
  }

  // ── Navigation ──────────────────────────────────────────────────────────────

  function goToPrev() {
    if (viewMode === 'daily')   setSelectedDate((d) => addDays(d, -1))
    if (viewMode === 'weekly')  setSelectedDate((d) => addDays(d, -7))
    if (viewMode === 'monthly') setSelectedDate((d) => addMonths(d, -1))
  }

  function goToNext() {
    if (viewMode === 'daily')   setSelectedDate((d) => addDays(d, +1))
    if (viewMode === 'weekly')  setSelectedDate((d) => addDays(d, +7))
    if (viewMode === 'monthly') setSelectedDate((d) => addMonths(d, +1))
  }

  function goToNow() {
    setSelectedDate(new Date())
  }

  function isCurrentPeriod() {
    return getPeriodKey(viewMode, selectedDate) === getPeriodKey(viewMode, new Date())
  }

  function getPeriodLabel() {
    if (viewMode === 'daily')   return formatDailyLabel(selectedDate)
    if (viewMode === 'weekly')  return formatWeeklyLabel(selectedDate)
    if (viewMode === 'monthly') return formatMonthlyLabel(selectedDate)
  }

  function getNowLabel() {
    if (viewMode === 'daily')   return 'Today'
    if (viewMode === 'weekly')  return 'This week'
    if (viewMode === 'monthly') return 'This month'
  }

  // ── Render ──────────────────────────────────────────────────────────────────

  if (members.length === 0) {
    return (
      <main className="py-10">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">History</h1>
        <p className="text-sm text-slate-400 dark:text-slate-500">
          No family members yet. Add someone on the{' '}
          <a href="/family" className="text-slate-600 dark:text-slate-300 underline underline-offset-2 hover:text-slate-900 dark:hover:text-slate-100">
            Family page
          </a>{' '}
          to get started.
        </p>
      </main>
    )
  }

  return (
    <main className="py-10">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-6">History</h1>

      {error && (
        <p className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 rounded-lg px-4 py-2 mb-6">
          {error}
        </p>
      )}

      {/* Member selector */}
      <div className="mb-5">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
          Member
        </p>
        <div className="flex flex-wrap gap-2">
          {members.map((m) => (
            <button
              key={m.id}
              onClick={() => setSelectedMemberId((prev) => prev === m.id ? '' : m.id)}
              className={[
                'px-4 py-1.5 text-sm font-medium rounded-lg border transition-all duration-150 cursor-pointer',
                selectedMemberId === m.id
                  ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 border-slate-900 dark:border-slate-100'
                  : 'bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:hover:border-slate-500 hover:text-slate-700 dark:hover:text-slate-200',
              ].join(' ')}
            >
              {m.name}
            </button>
          ))}
        </div>
      </div>

      {/* View mode tabs — controls how you step through time */}
      <div className="flex gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl mb-5 w-fit">
        {VIEW_MODES.map((mode) => (
          <button
            key={mode.id}
            onClick={() => setViewMode(mode.id)}
            className={[
              'px-5 py-1.5 text-sm font-medium rounded-lg transition-all duration-150 cursor-pointer',
              viewMode === mode.id
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200',
            ].join(' ')}
          >
            {mode.label}
          </button>
        ))}
      </div>

      {/* ── Day mode: mini calendar on left, task list on right ── */}
      {viewMode === 'daily' && (
        <div className="flex gap-5 items-start">
          <div className="shrink-0 w-64">
            <MiniCalendar
              selectedDate={selectedDate}
              onSelectDate={setSelectedDate}
              taskDates={selectedMemberId ? taskDates : undefined}
              allDoneDates={selectedMemberId ? allDoneDates : undefined}
            />
          </div>

          <div className="flex-1 min-w-0">
            {!selectedMemberId ? (
              <div className="text-center py-20 border border-dashed border-slate-200 dark:border-slate-700 rounded-xl">
                <p className="text-sm font-medium text-slate-400 dark:text-slate-500">Select a family member above to view their task history.</p>
              </div>
            ) : loading ? (
              <p className="text-sm text-slate-400 dark:text-slate-500 py-10 text-center">Loading…</p>
            ) : (
              <Timeline
                tasks={activeTasks}
                emptyHint="Try selecting a different date on the calendar."
              />
            )}
          </div>
        </div>
      )}

      {/* ── Week / Month mode: navigator above task list ── */}
      {viewMode !== 'daily' && (
        <>
          <div className="flex items-center gap-2 mb-6">
            <button
              onClick={goToPrev}
              aria-label="Previous"
              className="p-2 rounded-lg border border-slate-200 dark:border-slate-600 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-700 dark:hover:text-slate-200 transition-all cursor-pointer"
            >
              ←
            </button>
            <button
              onClick={goToNow}
              disabled={isCurrentPeriod()}
              className="px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-600 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-700 dark:hover:text-slate-200 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
            >
              {getNowLabel()}
            </button>
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-200 min-w-[220px] text-center">
              {getPeriodLabel()}
            </span>
            <button
              onClick={goToNext}
              aria-label="Next"
              className="p-2 rounded-lg border border-slate-200 dark:border-slate-600 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-700 dark:hover:text-slate-200 transition-all cursor-pointer"
            >
              →
            </button>
          </div>

          {!selectedMemberId ? (
            <div className="text-center py-20 border border-dashed border-slate-200 dark:border-slate-700 rounded-xl">
              <p className="text-sm font-medium text-slate-400 dark:text-slate-500">Select a family member above to view their task history.</p>
            </div>
          ) : loading ? (
            <p className="text-sm text-slate-400 dark:text-slate-500 py-10 text-center">Loading…</p>
          ) : (
            <Timeline
              tasks={activeTasks}
              emptyHint="Try navigating to a different period."
            />
          )}
        </>
      )}
    </main>
  )
}

export default HistoryPage
