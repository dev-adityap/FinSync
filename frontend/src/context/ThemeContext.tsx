import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'
import type { Theme } from '../types'

interface ThemeContextType extends Theme {
  toggleTheme: () => void
  setTheme: (mode: 'dark' | 'light') => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<'dark' | 'light'>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('finsync-theme') as 'dark' | 'light') || 'dark'
    }
    return 'dark'
  })

  useEffect(() => {
    localStorage.setItem('finsync-theme', mode)
    document.documentElement.classList.toggle('dark', mode === 'dark')
  }, [mode])

  const toggleTheme = useCallback(() => {
    setMode(prev => prev === 'dark' ? 'light' : 'dark')
  }, [])

  const setTheme = useCallback((newMode: 'dark' | 'light') => {
    setMode(newMode)
  }, [])

  return (
    <ThemeContext.Provider value={{ mode, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) throw new Error('useTheme must be used within ThemeProvider')
  return context
}