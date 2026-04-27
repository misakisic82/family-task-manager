import { NavLink } from 'react-router-dom'

function SunIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
    </svg>
  )
}

function MoonIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  )
}

function Navbar({ isDark, onToggleDark, user, onLogout }) {
  return (
    <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-b border-slate-100 dark:border-slate-800 sticky top-0 z-40 transition-colors duration-200">
      <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
        <span className="font-bold text-slate-900 dark:text-slate-100 tracking-tight text-base">
          Family Tasks
        </span>

        <div className="flex items-center gap-1">
          <nav className="flex items-center gap-1">
            <NavLink to="/" end data-testid="nav-home" className={navClass}>Home</NavLink>
            {user && (
              <>
                <NavLink to="/family"    data-testid="nav-family"    className={navClass}>Family</NavLink>
                <NavLink to="/stats"     data-testid="nav-stats"     className={navClass}>Stats</NavLink>
                <NavLink to="/history"   data-testid="nav-history"   className={navClass}>History</NavLink>
                <NavLink to="/templates" data-testid="nav-templates" className={navClass}>Templates</NavLink>
              </>
            )}
          </nav>

          <div className="w-px h-4 bg-slate-200 dark:bg-slate-700 mx-2" />

          {user ? (
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 dark:text-slate-500 hidden sm:block">
                {user.email}
              </span>
              <button
                onClick={onLogout}
                data-testid="logout-button"
                className="text-sm px-3 py-1.5 rounded-md text-slate-400 dark:text-slate-500 font-medium hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200 cursor-pointer"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1">
              <NavLink to="/login" className={navClass}>Login</NavLink>
              <NavLink to="/register" className={navClass}>Register</NavLink>
            </div>
          )}

          <div className="w-px h-4 bg-slate-200 dark:bg-slate-700 mx-2" />

          <button
            onClick={onToggleDark}
            data-testid="theme-toggle"
            className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200 cursor-pointer"
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {isDark ? <SunIcon /> : <MoonIcon />}
          </button>
        </div>
      </div>
    </header>
  )
}

function navClass({ isActive }) {
  return [
    'text-sm px-3 py-1.5 rounded-md no-underline transition-all duration-200',
    isActive
      ? 'text-slate-900 dark:text-slate-100 font-semibold'
      : 'text-slate-400 dark:text-slate-500 font-medium hover:text-slate-700 dark:hover:text-slate-200',
  ].join(' ')
}

export default Navbar
