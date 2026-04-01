'use client'

import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'
import { Sun, Moon } from 'lucide-react'

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  if (!mounted) {
    return (
      <div className="w-10 h-10 rounded-full border border-gray-200 dark:border-dark-border" />
    )
  }

  const isDark = theme === 'dark'

  return (
    <button
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      aria-label={isDark ? 'Passer en mode jour' : 'Passer en mode nuit'}
      title={isDark ? 'Mode jour' : 'Mode nuit'}
      className="
        w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0
        border border-gray-200 dark:border-dark-border
        bg-white dark:bg-dark-card
        text-gray-600 dark:text-gray-300
        hover:border-pink hover:text-pink
        transition-all duration-200 hover:rotate-12
      "
    >
      {isDark ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  )
}
