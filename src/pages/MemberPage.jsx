import { useState, useEffect, useRef } from 'react'
import { useParams, Navigate, Link } from 'react-router-dom'
import familyData from '../data/familyData'
import { supabase } from '../lib/supabaseClient'
import BoardSection from '../components/BoardSection'
import MemberAvatar from '../components/MemberAvatar'
import MiniCalendar from '../components/MiniCalendar'
import { getPeriodKey } from '../utils/periodKey'
import { calcProductivityScore, scoreTextColor, scoreBarColor } from '../utils/score'

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

function formatDailyLabel(date) {
  const weekdays = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']
  return `${weekdays[date.getDay()]}, ${MONTHS[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`
}

function formatMonthlyLabel(date) {
  return `${MONTHS[date.getMonth()]} ${date.getFullYear()}`
}

// ── Data helpers ──────────────────────────────────────────────────────────────

function getStoredMembers() {
  try {
    const saved = localStorage.getItem('family-members')
    if (saved) return JSON.parse(saved)
  } catch {}
  return familyData.map((m) => ({ id: m.id, name: m.name, role: '' }))
}

// Convert a Supabase task row (snake_case) to the shape the UI expects
function toTask(row) {
  return {
    id:               row.id,
    title:            row.title,
    description:      row.description || '',
    status:           row.status,
    comments:         row.comments || [],
    periodType:       row.period_type,
    periodKey:        row.period_key,
    createdAt:        row.created_at,
    updatedAt:        row.updated_at,
    completedAt:      row.completed_at,
    sourceTemplateId: row.template_id,
    isGenerated:      row.is_generated || false,
  }
}

// Group flat template rows by type so generation logic can look them up easily
function groupTemplatesByType(rows) {
  const grouped = { daily: [], weekly: [], monthly: [] }
  rows.forEach((row) => {
    if (grouped[row.type]) {
      grouped[row.type].push({
        id:          row.id,
        title:       row.title,
        description: row.description || '',
      })
    }
  })
  return grouped
}

// ── Streak + consistency helpers ─────────────────────────────────────────────

function getDailyStreak(boards) {
  const byDate = {}
  for (const task of (boards.daily ?? [])) {
    if (!task.periodKey) continue
    if (!byDate[task.periodKey]) byDate[task.periodKey] = []
    byDate[task.periodKey].push(task)
  }

  const completed = Object.entries(byDate)
    .filter(([, tasks]) => tasks.length > 0 && tasks.every((t) => t.status === 'done'))
    .map(([date]) => date)
    .sort()
    .reverse()

  if (completed.length === 0) return 0

  let streak = 1
  for (let i = 0; i < completed.length - 1; i++) {
    const a = new Date(completed[i]     + 'T00:00:00Z')
    const b = new Date(completed[i + 1] + 'T00:00:00Z')
    if ((a - b) / 86400000 === 1) streak++
    else break
  }
  return streak
}

function getWeeklyConsistency(boards) {
  const byWeek = {}
  for (const task of (boards.weekly ?? [])) {
    if (!task.periodKey) continue
    if (!byWeek[task.periodKey]) byWeek[task.periodKey] = []
    byWeek[task.periodKey].push(task)
  }
  return Object.values(byWeek).filter(
    (tasks) => tasks.length > 0 && tasks.every((t) => t.status === 'done')
  ).length
}

function getMonthlyCompletion(boards, date) {
  const monthKey = getPeriodKey('monthly', date)
  const tasks    = (boards.monthly ?? []).filter((t) => t.periodKey === monthKey)
  if (tasks.length === 0) return null
  const done = tasks.filter((t) => t.status === 'done').length
  return Math.round((done / tasks.length) * 100)
}

// ── StreakBar component ───────────────────────────────────────────────────────

function StreakBar({ boards, selectedDate, score }) {
  const streak   = getDailyStreak(boards)
  const weeks    = getWeeklyConsistency(boards)
  const monthPct = getMonthlyCompletion(boards, selectedDate)

  return (
    <div className="flex flex-wrap gap-2 mb-6">
      <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-sm">
        <span>{streak > 0 ? '🔥' : '💤'}</span>
        <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">
          {streak > 0 ? `${streak} day streak` : 'No streak yet'}
        </span>
      </div>

      <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-sm">
        <span>✅</span>
        <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">
          {weeks > 0 ? `${weeks} ${weeks === 1 ? 'week' : 'weeks'} consistent` : 'No full weeks yet'}
        </span>
      </div>

      {monthPct !== null && (
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-sm">
          <span>📅</span>
          <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">
            {monthPct}% this month
          </span>
        </div>
      )}

      <div className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-sm">
        <div className="flex items-center justify-between gap-4 mb-1">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Productivity</span>
          {score === null ? (
            <span className="text-xs font-semibold text-slate-400 dark:text-slate-500">No score yet</span>
          ) : (
            <span className={`text-xs font-bold ${scoreTextColor(score)}`}>{score}%</span>
          )}
        </div>
        {score !== null && (
          <div className="h-1 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden w-28">
            <div
              className={`h-full rounded-full ${scoreBarColor(score)}`}
              style={{ width: `${score}%` }}
            />
          </div>
        )}
      </div>
    </div>
  )
}

// ── Period tabs config ────────────────────────────────────────────────────────

const PERIOD_TABS = [
  { id: 'daily',   label: 'Daily'   },
  { id: 'weekly',  label: 'Weekly'  },
  { id: 'monthly', label: 'Monthly' },
]

// ── Component ─────────────────────────────────────────────────────────────────

function MemberPage() {
  const { memberId } = useParams()
  const member = getStoredMembers().find((m) => m.id === memberId)

  const [tasks, setTasks]         = useState([])
  const [templates, setTemplates] = useState({ daily: [], weekly: [], monthly: [] })
  const [loading, setLoading]     = useState(true)
  const [error, setError]         = useState(null)

  const [activePeriod, setActivePeriod] = useState('daily')
  const [selectedDate, setSelectedDate] = useState(() => new Date())

  // Tracks which period+key combinations have already been generated this
  // session. Prevents duplicate inserts when the effect fires more than once
  // for the same period (React Strict Mode double-invoke, rapid re-renders).
  const generatedKeysRef = useRef(new Set())

  const currentPeriodKey = getPeriodKey(activePeriod, selectedDate)

  // Load all tasks and templates for this member from Supabase on mount.
  // All tasks are loaded (not just the current period) so StreakBar has
  // the full history it needs for streak and consistency calculations.
  useEffect(() => {
    async function loadData() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        setLoading(false)
        return
      }

      const [taskResult, tmplResult] = await Promise.all([
        supabase.from('tasks').select('*').eq('member_id', memberId),
        supabase.from('task_templates').select('*').eq('member_id', memberId).order('created_at', { ascending: true }),
      ])

      if (taskResult.error || tmplResult.error) {
        setError((taskResult.error || tmplResult.error).message)
      } else {
        setTasks(taskResult.data.map(toTask))
        setTemplates(groupTemplatesByType(tmplResult.data))
      }
      setLoading(false)
    }

    loadData()
  }, [memberId])

  // When the active period or selected date changes, check if any template-based
  // tasks are missing for that period and insert them into Supabase.
  // Duplicate prevention has two layers:
  //   1. generatedKeysRef — skips the run if this period+key was already attempted
  //      in this session (guards against React Strict Mode double-invoke and rapid
  //      re-renders where two async calls would both see zero tasks and both insert)
  //   2. Supabase query — asks the DB which templates already have a task so we
  //      only insert the genuinely missing ones (covers the case where tasks were
  //      created in a previous session / page load)
  useEffect(() => {
    if (loading) return

    const periodTemplates = templates[activePeriod] ?? []
    if (periodTemplates.length === 0) return

    // Guard: if this period+key was already processed this session, skip entirely
    const cacheKey = `${activePeriod}:${currentPeriodKey}`
    if (generatedKeysRef.current.has(cacheKey)) return
    generatedKeysRef.current.add(cacheKey)

    async function generateMissing() {
      // Ask Supabase which templates already have a generated task for this period
      const { data: existing } = await supabase
        .from('tasks')
        .select('template_id')
        .eq('member_id', memberId)
        .eq('period_type', activePeriod)
        .eq('period_key', currentPeriodKey)
        .not('template_id', 'is', null)

      const existingIds = new Set((existing ?? []).map((r) => r.template_id))
      const missing = periodTemplates.filter((tmpl) => !existingIds.has(tmpl.id))

      if (missing.length === 0) return

      const { data: { session } } = await supabase.auth.getSession()
      const now = new Date().toISOString()

      const rows = missing.map((tmpl) => ({
        user_id:      session.user.id,
        member_id:    memberId,
        template_id:  tmpl.id,
        title:        tmpl.title,
        description:  tmpl.description || '',
        status:       'todo',
        period_type:  activePeriod,
        period_key:   currentPeriodKey,
        is_generated: true,
        comments:     [],
        created_at:   now,
        updated_at:   now,
        completed_at: null,
      }))

      // Plain insert: the pre-check query above already guarantees `rows` only
      // contains templates that have no existing task for this period, so there
      // is nothing to conflict on. upsert was removed because it requires a
      // UNIQUE constraint on (template_id, member_id, period_type, period_key)
      // which may not exist, causing it to fail silently for weekly/monthly tasks.
      const { data, error } = await supabase
        .from('tasks')
        .insert(rows)
        .select()

      if (error) {
        // Remove from session cache so the next tab visit can retry
        generatedKeysRef.current.delete(cacheKey)
        setError(error.message)
        return
      }

      setTasks((prev) => [...prev, ...data.map(toTask)])
    }

    generateMissing()
  }, [activePeriod, currentPeriodKey, loading, templates, memberId])

  if (!member) return <Navigate to="/family" replace />

  if (loading) {
    return (
      <main className="py-10">
        <p className="text-sm text-slate-400 dark:text-slate-500">Loading tasks...</p>
      </main>
    )
  }

  // Derive boards structure for StreakBar (needs all tasks grouped by period type)
  const boards = {
    daily:   tasks.filter((t) => t.periodType === 'daily'),
    weekly:  tasks.filter((t) => t.periodType === 'weekly'),
    monthly: tasks.filter((t) => t.periodType === 'monthly'),
  }

  // Productivity score uses all tasks for this member (full history, not just the current period)
  const productivityScore = calcProductivityScore(tasks)

  // Only show tasks that belong to the selected period and date
  const filteredTasks = tasks.filter(
    (t) => t.periodType === activePeriod && t.periodKey === currentPeriodKey
  )

  // ── Task CRUD ───────────────────────────────────────────────────────────────

  async function addTask(boardId, title, description) {
    setError(null)
    const { data: { session } } = await supabase.auth.getSession()
    const now = new Date().toISOString()

    const { data, error } = await supabase
      .from('tasks')
      .insert({
        user_id:      session.user.id,
        member_id:    memberId,
        title,
        description,
        status:       'todo',
        period_type:  boardId,
        period_key:   getPeriodKey(boardId, selectedDate),
        is_generated: false,
        comments:     [],
        created_at:   now,
        updated_at:   now,
        completed_at: null,
      })
      .select()
      .single()

    if (error) {
      setError(error.message)
      return
    }
    setTasks((prev) => [...prev, toTask(data)])
  }

  async function updateTask(boardId, updatedTask) {
    setError(null)
    const now = new Date().toISOString()

    const { error } = await supabase
      .from('tasks')
      .update({
        title:       updatedTask.title,
        description: updatedTask.description,
        comments:    updatedTask.comments ?? [],
        updated_at:  now,
      })
      .eq('id', updatedTask.id)

    if (error) {
      setError(error.message)
      return
    }
    setTasks((prev) => prev.map((t) =>
      t.id === updatedTask.id ? { ...updatedTask, updatedAt: now } : t
    ))
  }

  async function moveTask(boardId, taskId, toColumnId) {
    setError(null)
    const now = new Date().toISOString()
    const completedAt = toColumnId === 'done' ? now : null

    const { error } = await supabase
      .from('tasks')
      .update({
        status:       toColumnId,
        completed_at: completedAt,
        updated_at:   now,
      })
      .eq('id', taskId)

    if (error) {
      setError(error.message)
      return
    }
    setTasks((prev) => prev.map((t) => {
      if (t.id !== taskId) return t
      return { ...t, status: toColumnId, completedAt, updatedAt: now }
    }))
  }

  async function deleteTask(boardId, taskId) {
    setError(null)
    const { error } = await supabase.from('tasks').delete().eq('id', taskId)

    if (error) {
      setError(error.message)
      return
    }
    setTasks((prev) => prev.filter((t) => t.id !== taskId))
  }

  // ── Render ──────────────────────────────────────────────────────────────────

  const navBtn    = 'p-1.5 rounded-lg border border-slate-200 dark:border-slate-600 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all cursor-pointer'
  const nowBtn    = 'px-2.5 py-1 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-600 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-600 dark:hover:text-slate-200 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer'
  const taskBadge = 'text-xs font-semibold tabular-nums px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
  const taskCount = `${filteredTasks.length} ${filteredTasks.length === 1 ? 'task' : 'tasks'}`

  return (
    <main className="py-10">

      <Link
        to="/family"
        data-testid="back-button"
        className="text-xs font-medium text-slate-400 dark:text-slate-500 no-underline hover:text-slate-700 dark:hover:text-slate-200 inline-flex items-center gap-1 mb-8 transition-all duration-200"
      >
        ← Back to Family
      </Link>

      {/* Member header */}
      <div className="flex items-center gap-4 mb-8">
        <MemberAvatar member={member} size="xl" />
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{member.name}</h1>
          {member.role && <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{member.role}</p>}
        </div>
      </div>

      {/* Streak + consistency bar */}
      <StreakBar boards={boards} selectedDate={selectedDate} score={productivityScore} />

      {error && (
        <p className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 rounded-lg px-4 py-2 mb-6">
          {error}
        </p>
      )}

      {/* Period tabs */}
      <div className="flex gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl mb-6 w-fit">
        {PERIOD_TABS.map((tab) => (
          <button
            key={tab.id}
            data-testid={`${tab.id}-tab`}
            onClick={() => setActivePeriod(tab.id)}
            className={[
              'px-5 py-1.5 text-sm font-medium rounded-lg transition-all duration-150 cursor-pointer',
              activePeriod === tab.id
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200',
            ].join(' ')}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Daily ── */}
      {activePeriod === 'daily' && (
        <div className="flex gap-5 items-start">
          <div className="shrink-0 w-64">
            <MiniCalendar selectedDate={selectedDate} onSelectDate={setSelectedDate} />
          </div>
          <div className="flex-1 min-w-0 flex flex-col gap-4">
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-5 py-4 shadow-sm">
              <div className="flex items-center justify-between mb-1">
                <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">Daily Tasks</h2>
                <span className={taskBadge}>{taskCount}</span>
              </div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                {formatDailyLabel(selectedDate)}
              </p>
            </div>
            <BoardSection
              title=""
              boardId="daily"
              boardData={filteredTasks}
              onAddTask={addTask}
              onUpdateTask={(updatedTask) => updateTask('daily', updatedTask)}
              onMoveTask={(taskId, toColumnId) => moveTask('daily', taskId, toColumnId)}
              onDeleteTask={(taskId) => deleteTask('daily', taskId)}
            />
          </div>
        </div>
      )}

      {/* ── Weekly ── */}
      {activePeriod === 'weekly' && (
        <div className="flex flex-col gap-4">
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-5 py-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">Weekly Tasks</h2>
              <span className={taskBadge}>{taskCount}</span>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setSelectedDate((d) => addDays(d, -7))}  aria-label="Previous week"  className={navBtn}>←</button>
              <button onClick={() => setSelectedDate(new Date())} disabled={currentPeriodKey === getPeriodKey('weekly',  new Date())} className={nowBtn}>This week</button>
              <span className="flex-1 text-sm font-medium text-slate-700 dark:text-slate-200 text-center">
                {formatWeeklyLabel(selectedDate)}
              </span>
              <button onClick={() => setSelectedDate((d) => addDays(d, +7))}  aria-label="Next week"     className={navBtn}>→</button>
            </div>
          </div>
          <BoardSection
            title=""
            boardId="weekly"
            boardData={filteredTasks}
            onAddTask={addTask}
            onUpdateTask={(updatedTask) => updateTask('weekly', updatedTask)}
            onMoveTask={(taskId, toColumnId) => moveTask('weekly', taskId, toColumnId)}
            onDeleteTask={(taskId) => deleteTask('weekly', taskId)}
          />
        </div>
      )}

      {/* ── Monthly ── */}
      {activePeriod === 'monthly' && (
        <div className="flex flex-col gap-4">
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-5 py-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">Monthly Tasks</h2>
              <span className={taskBadge}>{taskCount}</span>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setSelectedDate((d) => addMonths(d, -1))} aria-label="Previous month" className={navBtn}>←</button>
              <button onClick={() => setSelectedDate(new Date())} disabled={currentPeriodKey === getPeriodKey('monthly', new Date())} className={nowBtn}>This month</button>
              <span className="flex-1 text-sm font-medium text-slate-700 dark:text-slate-200 text-center">
                {formatMonthlyLabel(selectedDate)}
              </span>
              <button onClick={() => setSelectedDate((d) => addMonths(d, +1))} aria-label="Next month"     className={navBtn}>→</button>
            </div>
          </div>
          <BoardSection
            title=""
            boardId="monthly"
            boardData={filteredTasks}
            onAddTask={addTask}
            onUpdateTask={(updatedTask) => updateTask('monthly', updatedTask)}
            onMoveTask={(taskId, toColumnId) => moveTask('monthly', taskId, toColumnId)}
            onDeleteTask={(taskId) => deleteTask('monthly', taskId)}
          />
        </div>
      )}

    </main>
  )
}

export default MemberPage
