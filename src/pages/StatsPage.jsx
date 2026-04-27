import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import familyData from '../data/familyData'
import { supabase } from '../lib/supabaseClient'
import MemberAvatar from '../components/MemberAvatar'
import { isMissed } from '../utils/periodKey'
import { calcProductivityScore, scoreTextColor, scoreBarColor } from '../utils/score'

function getMembers() {
  try {
    const saved = localStorage.getItem('family-members')
    if (saved) return JSON.parse(saved)
  } catch {}
  return familyData.map((m) => ({ id: m.id, name: m.name, role: '' }))
}

// Convert a Supabase row to the minimal shape needed for stat calculations.
// isMissed() needs periodType and periodKey; calcStats needs status.
function toTask(row) {
  return {
    id:         row.id,
    status:     row.status,
    periodType: row.period_type,
    periodKey:  row.period_key,
  }
}

function calcStats(tasks) {
  const total      = tasks.length
  const done       = tasks.filter((t) => t.status === 'done').length
  const active     = total - done
  const percentage = total === 0 ? 0 : Math.round((done / total) * 100)
  return { total, done, active, percentage }
}

// A task is missed when its period has ended and its status is not 'done'.
// Breakdown by period type lets the UI show daily / weekly / monthly counts separately.
function calcMissed(tasks) {
  let daily = 0, weekly = 0, monthly = 0
  for (const task of tasks) {
    if (!isMissed(task)) continue
    if (task.periodType === 'daily')        daily++
    else if (task.periodType === 'weekly')  weekly++
    else if (task.periodType === 'monthly') monthly++
  }
  return { daily, weekly, monthly, total: daily + weekly + monthly }
}

function StatItem({ value, label, highlight }) {
  return (
    <div className="flex flex-col gap-1">
      <span className={`text-2xl font-bold tabular-nums leading-none ${highlight ? 'text-emerald-500' : 'text-slate-800 dark:text-slate-100'}`}>
        {value}
      </span>
      <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-widest">{label}</span>
    </div>
  )
}

function MemberStatCard({ member, tasks }) {
  const navigate = useNavigate()
  const { total, done, active, percentage } = calcStats(tasks)
  const missed = calcMissed(tasks)
  const score  = calcProductivityScore(tasks)
  const [animated, setAnimated] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setAnimated(true), 50)
    return () => clearTimeout(t)
  }, [])

  return (
    <div
      className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-6 shadow-sm cursor-pointer hover:shadow-md hover:border-slate-300 dark:hover:border-slate-600 hover:-translate-y-1 transition-all duration-200"
      onClick={() => navigate(`/stats/${member.id}`)}
    >
      {/* Member header */}
      <div className="flex items-center gap-3 mb-5">
        <MemberAvatar member={member} size="md" />
        <span className="text-sm font-bold text-slate-900 dark:text-slate-100 flex-1">{member.name}</span>
        <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 tabular-nums">{percentage}%</span>
      </div>

      {/* Productivity score */}
      <div className="mb-5 px-3 py-2 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Productivity
          </span>
          {score === null ? (
            <span className="text-xs font-semibold text-slate-400 dark:text-slate-500">No score yet</span>
          ) : (
            <span className={`text-sm font-bold tabular-nums ${scoreTextColor(score)}`}>{score}%</span>
          )}
        </div>
        {score !== null && (
          <div className="h-1.5 bg-slate-200 dark:bg-slate-600 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-1000 ease-out ${scoreBarColor(score)}`}
              style={{ width: animated ? `${score}%` : '0%' }}
            />
          </div>
        )}
      </div>

      {/* Progress bar — animates from 0 to final width on mount */}
      <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden mb-6">
        <div
          className="h-full bg-emerald-500 rounded-full transition-all duration-1000 ease-out"
          style={{ width: animated ? `${percentage}%` : '0%' }}
        />
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 border-t border-slate-100 dark:border-slate-700 pt-5">
        <StatItem value={total}  label="Total"  />
        <StatItem value={active} label="Active" />
        <StatItem value={done}   label="Done"   highlight />
      </div>

      {/* Missed row */}
      {missed.total > 0 && (
        <div className="mt-4 pt-4 border-t border-red-100 dark:border-red-900/30">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-red-400 dark:text-red-400 uppercase tracking-widest">
              Missed
            </span>
            <span className="text-sm font-bold tabular-nums text-red-400 dark:text-red-400">
              {missed.total}
            </span>
          </div>
          <div className="flex gap-3 mt-1.5">
            {missed.daily > 0 && (
              <span className="text-[11px] text-red-300 dark:text-red-500 tabular-nums">
                Daily: {missed.daily}
              </span>
            )}
            {missed.weekly > 0 && (
              <span className="text-[11px] text-red-300 dark:text-red-500 tabular-nums">
                Weekly: {missed.weekly}
              </span>
            )}
            {missed.monthly > 0 && (
              <span className="text-[11px] text-red-300 dark:text-red-500 tabular-nums">
                Monthly: {missed.monthly}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function StatsPage() {
  const members = getMembers()
  const [tasksByMember, setTasksByMember] = useState({})
  const [loading, setLoading]             = useState(true)
  const [error, setError]                 = useState(null)

  // Load all tasks for the logged-in user in one query, then group by member_id.
  // Each MemberStatCard receives only the slice of tasks that belong to it.
  useEffect(() => {
    async function loadTasks() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        setLoading(false)
        return
      }

      const { data, error } = await supabase
        .from('tasks')
        .select('id, status, period_type, period_key, member_id')
        .eq('user_id', session.user.id)

      if (error) {
        setError(error.message)
        setLoading(false)
        return
      }

      // Group tasks by member_id so each card only computes its own stats
      const grouped = {}
      for (const row of data) {
        if (!grouped[row.member_id]) grouped[row.member_id] = []
        grouped[row.member_id].push(toTask(row))
      }
      setTasksByMember(grouped)
      setLoading(false)
    }

    loadTasks()
  }, [])

  if (loading) {
    return (
      <main className="py-10">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Family Stats</h1>
        <p className="text-sm text-slate-400 dark:text-slate-500 mt-10">Loading stats…</p>
      </main>
    )
  }

  return (
    <main className="py-10">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Family Stats</h1>
      <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 mb-10">Task completion overview for all members.</p>

      {error && (
        <p className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 rounded-lg px-4 py-2 mb-6">{error}</p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {members.map((member) => (
          <MemberStatCard
            key={member.id}
            member={member}
            tasks={tasksByMember[member.id] ?? []}
          />
        ))}
      </div>
    </main>
  )
}

export default StatsPage
