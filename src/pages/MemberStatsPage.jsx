import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import familyData from '../data/familyData'
import { supabase } from '../lib/supabaseClient'

function getStoredMembers() {
  try {
    const saved = localStorage.getItem('family-members')
    if (saved) return JSON.parse(saved)
  } catch {}
  return familyData.map((m) => ({ id: m.id, name: m.name, role: '' }))
}

function toTask(row) {
  return {
    id:         row.id,
    status:     row.status,
    periodType: row.period_type,
    periodKey:  row.period_key,
  }
}

function calcBoardStats(tasks) {
  const total      = tasks.length
  const done       = tasks.filter((t) => t.status === 'done').length
  const active     = total - done
  const percentage = total === 0 ? 0 : Math.round((done / total) * 100)
  return { total, done, active, percentage }
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

function BoardStatCard({ label, tasks }) {
  const { total, done, active, percentage } = calcBoardStats(tasks)
  const [animated, setAnimated] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setAnimated(true), 50)
    return () => clearTimeout(t)
  }, [])

  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-6 shadow-sm hover:shadow-md hover:border-slate-300 dark:hover:border-slate-600 hover:-translate-y-1 transition-all duration-200">
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">{label}</span>
        <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 tabular-nums">{percentage}%</span>
      </div>

      {/* Progress bar — animates from 0 to final width on mount */}
      <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden mb-6">
        <div
          className="h-full bg-emerald-500 rounded-full transition-all duration-1000 ease-out"
          style={{ width: animated ? `${percentage}%` : '0%' }}
        />
      </div>

      <div className="grid grid-cols-3 border-t border-slate-100 dark:border-slate-700 pt-5">
        <StatItem value={total}  label="Total"  />
        <StatItem value={active} label="Active" />
        <StatItem value={done}   label="Done"   highlight />
      </div>
    </div>
  )
}

function MemberStatsPage() {
  const { memberId } = useParams()
  const member = getStoredMembers().find((m) => m.id === memberId)

  const [tasks, setTasks]     = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)

  useEffect(() => {
    if (!member) {
      setLoading(false)
      return
    }

    async function loadTasks() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        setLoading(false)
        return
      }

      const { data, error } = await supabase
        .from('tasks')
        .select('id, status, period_type, period_key')
        .eq('user_id', session.user.id)
        .eq('member_id', memberId)

      if (error) {
        setError(error.message)
      } else {
        setTasks(data.map(toTask))
      }
      setLoading(false)
    }

    loadTasks()
  }, [memberId])

  if (!member) {
    return (
      <main className="py-10">
        <p className="text-sm text-slate-400 dark:text-slate-500">Member not found.</p>
      </main>
    )
  }

  const backLink = (
    <Link
      to="/stats"
      className="text-xs font-medium text-slate-400 dark:text-slate-500 no-underline hover:text-slate-700 dark:hover:text-slate-200 inline-flex items-center gap-1 mb-8 transition-all duration-200"
    >
      ← Back to Stats
    </Link>
  )

  if (loading) {
    return (
      <main className="py-10">
        {backLink}
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{member.name}</h1>
        <p className="text-sm text-slate-400 dark:text-slate-500 mt-10">Loading stats…</p>
      </main>
    )
  }

  const dailyTasks   = tasks.filter((t) => t.periodType === 'daily')
  const weeklyTasks  = tasks.filter((t) => t.periodType === 'weekly')
  const monthlyTasks = tasks.filter((t) => t.periodType === 'monthly')

  return (
    <main className="py-10">
      {backLink}

      <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{member.name}</h1>
      <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 mb-10">Task completion broken down by board.</p>

      {error && (
        <p className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 rounded-lg px-4 py-2 mb-6">{error}</p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <BoardStatCard label="Daily Tasks"   tasks={dailyTasks}   />
        <BoardStatCard label="Weekly Tasks"  tasks={weeklyTasks}  />
        <BoardStatCard label="Monthly Tasks" tasks={monthlyTasks} />
      </div>
    </main>
  )
}

export default MemberStatsPage
