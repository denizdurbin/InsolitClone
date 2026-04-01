'use client'

import { createContext, useContext, useState, useEffect, useCallback } from 'react'

interface User {
  prenom: string
  nom: string
  email: string
  initials: string
}

interface AuthContext {
  user: User | null
  loading: boolean
  login: (email: string, prenom?: string, nom?: string) => void
  logout: () => void
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContext>({
  user: null,
  loading: true,
  login: () => {},
  logout: () => {},
  isAuthenticated: false,
})

const STORAGE_KEY = 'insolit-user'

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user,    setUser]    = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) setUser(JSON.parse(raw))
    } catch {}
    setLoading(false)
  }, [])

  const login = useCallback((email: string, prenom = 'Utilisateur', nom = '') => {
    const u: User = {
      email,
      prenom,
      nom,
      initials: `${prenom[0] ?? ''}${nom[0] ?? ''}`.toUpperCase() || 'U',
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(u))
    setUser(u)
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY)
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
