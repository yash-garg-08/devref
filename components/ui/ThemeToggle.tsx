'use client'

import { useEffect, useState } from 'react'

export default function ThemeToggle() {
  const [dark, setDark] = useState(true)

  // Sync with actual DOM state after hydration
  useEffect(() => {
    setDark(document.documentElement.classList.contains('dark'))
  }, [])

  function toggle() {
    const html = document.documentElement
    if (dark) {
      html.classList.remove('dark')
      localStorage.setItem('theme', 'light')
      setDark(false)
    } else {
      html.classList.add('dark')
      localStorage.setItem('theme', 'dark')
      setDark(true)
    }
  }

  return (
    <button
      onClick={toggle}
      title={dark ? 'Switch to light mode' : 'Switch to dark mode'}
      className="w-7 h-7 flex items-center justify-center rounded-md border border-border text-muted hover:text-text hover:border-border/80 hover:bg-surface2 transition-all text-sm"
      aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {dark ? '☀' : '☾'}
    </button>
  )
}
