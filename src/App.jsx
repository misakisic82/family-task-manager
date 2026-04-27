import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import './App.css'
import { supabase } from './lib/supabaseClient'
import useDarkMode from './hooks/useDarkMode'
import Navbar from './components/Navbar'
import ProtectedRoute from './components/ProtectedRoute'
import HomePage from './pages/HomePage'
import FamilyPage from './pages/FamilyPage'
import MemberPage from './pages/MemberPage'
import StatsPage from './pages/StatsPage'
import MemberStatsPage from './pages/MemberStatsPage'
import HistoryPage from './pages/HistoryPage'
import TemplatesPage from './pages/TemplatesPage'
import RegisterPage from './pages/RegisterPage'
import LoginPage from './pages/LoginPage'

function AppContent({ isDark, toggleDark }) {
  const [user, setUser]           = useState(null)
  const [authLoading, setAuthLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    // Check if a session already exists when the app first loads.
    // Until this resolves, authLoading stays true so ProtectedRoute
    // does not redirect while the session is still being restored.
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null)
      setAuthLoading(false)
    })

    // Listen for login and logout events happening anywhere in the app
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => listener.subscription.unsubscribe()
  }, [])

  async function handleLogout() {
    await supabase.auth.signOut()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-200">
      <Navbar isDark={isDark} onToggleDark={toggleDark} user={user} onLogout={handleLogout} />
      <div className="max-w-6xl mx-auto px-6">
        <Routes>
          <Route path="/" element={<HomePage user={user} />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          <Route path="/family" element={<ProtectedRoute user={user} authLoading={authLoading}><FamilyPage /></ProtectedRoute>} />
          <Route path="/family/:memberId" element={<ProtectedRoute user={user} authLoading={authLoading}><MemberPage /></ProtectedRoute>} />
          <Route path="/stats" element={<ProtectedRoute user={user} authLoading={authLoading}><StatsPage /></ProtectedRoute>} />
          <Route path="/stats/:memberId" element={<ProtectedRoute user={user} authLoading={authLoading}><MemberStatsPage /></ProtectedRoute>} />
          <Route path="/history" element={<ProtectedRoute user={user} authLoading={authLoading}><HistoryPage /></ProtectedRoute>} />
          <Route path="/templates" element={<ProtectedRoute user={user} authLoading={authLoading}><TemplatesPage /></ProtectedRoute>} />
        </Routes>
      </div>
    </div>
  )
}

function App() {
  const [isDark, toggleDark] = useDarkMode()

  return (
    <BrowserRouter>
      <AppContent isDark={isDark} toggleDark={toggleDark} />
    </BrowserRouter>
  )
}

export default App
