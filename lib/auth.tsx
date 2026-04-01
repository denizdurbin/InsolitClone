'use client'

import { createContext, useContext, useState, useEffect, useCallback } from 'react'

interface ApiUser {
  id: string
  prenom: string
  nom: string
  email: string
  location: string
  savingsCents: number
  offersUsed: number
  reviewsCount: number
}

interface User {
  id: string
  prenom: string
  nom: string
  email: string
  initials: string
  location: string
  savingsCents: number
  offersUsed: number
  reviewsCount: number
}

interface AuthContext {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<string | null>
  logout: () => Promise<void>
  setAuthenticatedUser: (user: ApiUser | null) => void
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContext>({
  user: null,
  loading: true,
  login: async () => null,
  logout: async () => {},
  setAuthenticatedUser: () => {},
  isAuthenticated: false,
})

function getInitials(prenom: string, nom: string, email: string) {
  const initials = `${prenom[0] ?? ''}${nom[0] ?? ''}`.trim().toUpperCase()

  if (initials) {
    return initials
  }

  return (email[0] ?? 'U').toUpperCase()
}

function mapApiUserToUser(data: ApiUser): User {
  return {
    id: data.id,
    prenom: data.prenom,
    nom: data.nom,
    email: data.email,
    initials: getInitials(data.prenom, data.nom, data.email),
    location: data.location,
    savingsCents: data.savingsCents,
    offersUsed: data.offersUsed,
    reviewsCount: data.reviewsCount,
  }
}

async function parseJsonSafe(response: Response) {
  try {
    return await response.json()
  } catch {
    return null
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  const loadCurrentUser = useCallback(async () => {
    try {
      const response = await fetch('/api/auth/me', {
        method: 'GET',
        cache: 'no-store',
      })

      const payload = (await parseJsonSafe(response)) as { user?: ApiUser } | null

      if (!response.ok || !payload?.user) {
        setUser(null)
      } else {
        setUser(mapApiUserToUser(payload.user))
      }
    } catch {
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadCurrentUser()
  }, [loadCurrentUser])

  const login = useCallback(
    async (email: string, password: string) => {
      try {
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email, password }),
        })

        const payload = (await parseJsonSafe(response)) as { message?: string; user?: ApiUser } | null

        if (!response.ok || !payload?.user) {
          return payload?.message ?? 'Impossible de se connecter pour le moment. Reessaie.'
        }

        setUser(mapApiUserToUser(payload.user))
        return null
      } catch {
        return 'Impossible de se connecter pour le moment. Reessaie.'
      }
    },
    []
  )

  const logout = useCallback(async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
      })
    } finally {
      setUser(null)
    }
  }, [])

  const setAuthenticatedUser = useCallback((nextUser: ApiUser | null) => {
    setUser(nextUser ? mapApiUserToUser(nextUser) : null)
    setLoading(false)
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, setAuthenticatedUser, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
