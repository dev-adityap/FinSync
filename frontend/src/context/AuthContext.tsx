import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react'

interface AuthContextType {
  isAuthenticated: boolean
  user: { name: string; email: string } | null
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string) => Promise<void>
  logout: () => void
  showAuthMessage: (message: string) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState<{ name: string; email: string } | null>(null)

  const login = useCallback(async (email: string, password: string) => {
    await new Promise(resolve => setTimeout(resolve, 500))
    // Authentication is not enabled - show message instead
    throw new Error('Authentication is not enabled yet. No credentials were sent or stored.')
  }, [])

  const register = useCallback(async (name: string, email: string, password: string) => {
    await new Promise(resolve => setTimeout(resolve, 500))
    throw new Error('Authentication is not enabled yet. Account functionality will be available in a future release.')
  }, [])

  const logout = useCallback(() => {
    setIsAuthenticated(false)
    setUser(null)
  }, [])

  const showAuthMessage = useCallback((message: string) => {
    // This will be handled by the toast system
    console.log('Auth message:', message)
  }, [])

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, register, logout, showAuthMessage }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}