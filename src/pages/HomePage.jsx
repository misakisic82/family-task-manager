import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { isMissed } from '../utils/periodKey'

// ─── Icons ───────────────────────────────────────────────────────────────────

function IconPeople() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="7" r="4" />
      <path d="M2 21v-2a4 4 0 0 1 4-4h6a4 4 0 0 1 4 4v2" />
      <path d="M19 8v6M22 11h-6" />
    </svg>
  )
}

function IconRepeat() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 2l4 4-4 4" />
      <path d="M3 11V9a4 4 0 0 1 4-4h14" />
      <path d="M7 22l-4-4 4-4" />
      <path d="M21 13v2a4 4 0 0 1-4 4H3" />
    </svg>
  )
}

function IconCalendar() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2v4M8 2v4M3 10h18" />
      <path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01" />
    </svg>
  )
}

function IconChart() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 3v18h18" />
      <path d="M7 16l4-4 4 4 4-6" />
    </svg>
  )
}

function IconHistory() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
      <path d="M3 3v5h5" />
      <path d="M12 7v5l4 2" />
    </svg>
  )
}

function IconCheckCircle() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  )
}

function IconAlertCircle() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 8v4M12 16h.01" />
    </svg>
  )
}

function IconZap() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
    </svg>
  )
}

function IconListChecks() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
      <rect x="9" y="3" width="6" height="4" rx="1" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  )
}

// ─── "How it works" data (unchanged) ────────────────────────────────────────

const steps = [
  {
    number: '1',
    icon: IconPeople,
    title: 'Add family members',
    description: 'Create a profile for each person in your household. Each member gets their own task boards and stats.',
  },
  {
    number: '2',
    icon: IconRepeat,
    title: 'Set recurring tasks',
    description: 'Define daily, weekly, and monthly templates. Tasks are automatically generated each period — no manual entry needed.',
  },
  {
    number: '3',
    icon: IconCalendar,
    title: 'Plan and manage tasks',
    description: 'Browse tasks by day, week, or month using the built-in calendar. Add one-off tasks alongside recurring ones.',
  },
  {
    number: '4',
    icon: IconChart,
    title: 'Track progress',
    description: 'See completion rates, daily streaks, weekly consistency, and missed tasks for every family member.',
  },
  {
    number: '5',
    icon: IconHistory,
    title: 'Review history',
    description: 'Browse past periods as a timeline activity feed. See what was done, what was missed, and when.',
  },
]

// ─── Single stat card ────────────────────────────────────────────────────────

function StatCard({ label, value, icon: Icon, iconBg, iconColor, loading }) {
  return (
    <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl px-5 py-4 flex items-center gap-4">
      <span className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${iconBg} ${iconColor}`}>
        <Icon />
      </span>
      <div className="min-w-0">
        {loading ? (
          <div className="h-6 w-12 bg-slate-200 dark:bg-slate-600 rounded animate-pulse mb-1" />
        ) : (
          <div className="text-xl font-bold tabular-nums text-slate-900 dark:text-slate-100 leading-none">
            {value}
          </div>
        )}
        <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1 uppercase tracking-wide">
          {label}
        </div>
      </div>
    </div>
  )
}

// ─── Dashboard panel ─────────────────────────────────────────────────────────

function DashboardSection({ user }) {
  const [memberCount, setMemberCount] = useState(0)
  const [stats, setStats]             = useState(null)
  const [loading, setLoading]         = useState(true)

  useEffect(() => {
    try {
      const saved = localStorage.getItem('family-members')
      if (saved) setMemberCount(JSON.parse(saved).length)
    } catch {}

    async function loadStats() {
      const { data, error } = await supabase
        .from('tasks')
        .select('id, status, period_type, period_key')
        .eq('user_id', user.id)

      if (!error && data) {
        const total      = data.length
        const done       = data.filter(t => t.status === 'done').length
        const active     = data.filter(t => t.status !== 'done').length
        const missed     = data.filter(t =>
          isMissed({ status: t.status, periodType: t.period_type, periodKey: t.period_key })
        ).length
        const percentage = total === 0 ? 0 : Math.round((done / total) * 100)
        setStats({ total, done, active, missed, percentage })
      }
      setLoading(false)
    }

    loadStats()
  }, [user.id])

  const displayName = user.email?.split('@')[0] ?? 'there'

  const statCards = [
    {
      label:      'Family Members',
      value:      memberCount,
      icon:       IconPeople,
      iconBg:     'bg-blue-100 dark:bg-blue-900/40',
      iconColor:  'text-blue-600 dark:text-blue-400',
    },
    {
      label:      'Active Tasks',
      value:      stats?.active ?? '—',
      icon:       IconListChecks,
      iconBg:     'bg-slate-200 dark:bg-slate-600',
      iconColor:  'text-slate-600 dark:text-slate-300',
    },
    {
      label:      'Completed',
      value:      stats?.done ?? '—',
      icon:       IconCheckCircle,
      iconBg:     'bg-emerald-100 dark:bg-emerald-900/40',
      iconColor:  'text-emerald-600 dark:text-emerald-400',
    },
    {
      label:      'Missed',
      value:      stats?.missed ?? '—',
      icon:       IconAlertCircle,
      iconBg:     'bg-red-100 dark:bg-red-900/40',
      iconColor:  'text-red-500 dark:text-red-400',
    },
    {
      label:      'Productivity',
      value:      stats ? `${stats.percentage}%` : '—',
      icon:       IconZap,
      iconBg:     'bg-amber-100 dark:bg-amber-900/40',
      iconColor:  'text-amber-500 dark:text-amber-400',
    },
  ]

  return (
    <section className="mb-14">
      <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm overflow-hidden">

        {/* Header */}
        <div className="px-6 py-6 border-b border-slate-100 dark:border-slate-700/60">
          <p className="text-xs font-semibold text-emerald-500 uppercase tracking-widest mb-1">
            Your Dashboard
          </p>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            Welcome back, {displayName}
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Here's a quick overview of your family organization today.
          </p>
        </div>

        {/* Stat cards grid */}
        <div className="p-5 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {statCards.map((card) => (
            <StatCard key={card.label} {...card} loading={loading && card.label !== 'Family Members'} />
          ))}
        </div>

      </div>
    </section>
  )
}

// ─── Page ────────────────────────────────────────────────────────────────────

function HomePage({ user }) {
  const navigate = useNavigate()

  return (
    <main>
      {/* Hero — unchanged */}
      <section className="relative h-[420px] md:h-[520px] -mx-6 overflow-hidden mb-14 md:mb-20">
        <img
          src="/hero-bg.jpg"
          alt="Family organizer hero background"
          className="absolute inset-0 w-full h-full object-cover scale-105 animate-[heroZoom_1.8s_ease-out_forwards]"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 to-black/20" />

        <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-6 animate-[fadeUp_0.9s_ease-out_forwards]">
          <p className="text-xs font-semibold text-emerald-400 uppercase tracking-widest mb-4">
            Family Task Manager
          </p>
          <h1 className="text-5xl md:text-6xl font-bold text-white tracking-tight leading-tight mb-5 drop-shadow-sm">
            Organize your family,<br />one task at a time.
          </h1>
          <p className="text-base md:text-lg text-white/75 leading-relaxed mb-10 max-w-lg mx-auto">
            A simple shared space for daily, weekly, and monthly tasks —
            so every family member knows what needs to get done.
          </p>
          <div className="flex items-center justify-center gap-3">
            <button
              className="text-sm font-semibold bg-white text-slate-900 px-7 py-3 rounded-lg cursor-pointer shadow-sm hover:bg-slate-100 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
              onClick={() => navigate('/family')}
            >
              View Family Members
            </button>
            <button
              className="text-sm font-medium border border-white/40 text-white px-7 py-3 rounded-lg cursor-pointer hover:bg-white/20 hover:border-white/70 hover:-translate-y-0.5 transition-all duration-200"
              onClick={() => navigate('/stats')}
            >
              See Stats
            </button>
          </div>
        </div>
      </section>

      {/* Dashboard — only for logged-in users */}
      {user && <DashboardSection user={user} />}

      {/* How it works — unchanged */}
      <section className="py-8">
        <h2 className="text-sm font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-8">How it works</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {steps.map((step, i) => (
            <div
              key={step.number}
              className="group rounded-xl p-5 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm transition-all duration-300 ease-out hover:scale-[1.05] hover:-translate-y-1.5 hover:shadow-xl hover:border-slate-300 dark:hover:border-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700/60 dark:hover:ring-1 dark:hover:ring-white/10"
              style={{ animation: `fadeIn 0.5s ease-out ${i * 0.1}s both` }}
            >
              <div className="flex items-center gap-2.5 mb-3">
                <span className="w-7 h-7 rounded-full bg-slate-900 dark:bg-slate-700 text-white flex items-center justify-center text-[11px] font-bold shadow-sm shrink-0">
                  {step.number}
                </span>
                <span className="text-slate-400 dark:text-slate-500 transition-all duration-300 ease-out group-hover:rotate-6 group-hover:scale-110 group-hover:text-emerald-400 dark:group-hover:text-emerald-400">
                  <step.icon />
                </span>
              </div>
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 mb-1.5">{step.title}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{step.description}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  )
}

export default HomePage
