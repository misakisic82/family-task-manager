import { Navigate } from 'react-router-dom'

export default function ProtectedRoute({ user, authLoading, children }) {
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <p className="text-sm text-slate-400 dark:text-slate-500">Loading…</p>
      </div>
    )
  }
  if (!user) {
    return <Navigate to="/login" replace />
  }
  return children
}
