import { useState, useEffect } from 'react'

// Reads saved preference from localStorage, falls back to system preference.
// Applies or removes the 'dark' class on <html> whenever the value changes.
function useDarkMode() {
  const [isDark, setIsDark] = useState(() => {
    try {
      const saved = localStorage.getItem('color-scheme')
      if (saved !== null) return saved === 'dark'
      return window.matchMedia('(prefers-color-scheme: dark)').matches
    } catch {
      return false
    }
  })

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark)
    try {
      localStorage.setItem('color-scheme', isDark ? 'dark' : 'light')
    } catch {}
  }, [isDark])

  return [isDark, () => setIsDark((d) => !d)]
}

export default useDarkMode
