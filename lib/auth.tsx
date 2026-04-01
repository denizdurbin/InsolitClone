'use client'

import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react'
import type { User as SupabaseAuthUser } from '@supabase/supabase-js'
import { createClient } from '@/utils/supabase/client'

interface UserProfileRow {
  id: string
  prenom: string
  nom: string
  email: string
  location: string
  savings_cents: number
  offers_used: number
  reviews_count: number
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
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContext>({
  user: null,
  loading: true,
  login: async () => null,
  logout: async () => {},
  isAuthenticated: false,
})

function getInitials(prenom: string, nom: string, email: string) {
  const initials = `${prenom[0] ?? ''}${nom[0] ?? ''}`.trim().toUpperCase()

  if (initials) {
    return initials
  }

  return (email[0] ?? 'U').toUpperCase()
}

function buildFallbackUser(authUser: SupabaseAuthUser): User {
  const metadata = (authUser.user_metadata ?? {}) as Record<string, unknown>
  const prenom = typeof metadata.prenom === 'string' && metadata.prenom.trim() ? metadata.prenom.trim() : 'Utilisateur'
  const nom = typeof metadata.nom === 'string' ? metadata.nom.trim() : ''
  const email = authUser.email ?? ''

  return {
    id: authUser.id,
    prenom,
    nom,
    email,
    initials: getInitials(prenom, nom, email),
    location: 'Argenteuil, Ile-de-France',
    savingsCents: 0,
    offersUsed: 0,
    reviewsCount: 0,
  }
}

function mapRowToUser(row: UserProfileRow): User {
  return {
    id: row.id,
    prenom: row.prenom,
    nom: row.nom,
    email: row.email,
    initials: getInitials(row.prenom, row.nom, row.email),
    location: row.location,
    savingsCents: row.savings_cents,
    offersUsed: row.offers_used,
    reviewsCount: row.reviews_count,
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const supabase = useMemo(() => createClient(), [])
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  const loadUserProfile = useCallback(
    async (authUser: SupabaseAuthUser | null): Promise<User | null> => {
      if (!authUser) {
        return null
      }

      const { data, error } = await supabase
        .from('users')
        .select('id,prenom,nom,email,location,savings_cents,offers_used,reviews_count')
        .eq('id', authUser.id)
        .maybeSingle()

      if (error) {
        console.error(`[Auth] loadUserProfile: ${error.message}`)
      }

      if (data) {
        return mapRowToUser(data as UserProfileRow)
      }

      const fallbackUser = buildFallbackUser(authUser)

      const { data: insertedData, error: insertError } = await supabase
        .from('users')
        .upsert(
          {
            id: fallbackUser.id,
            prenom: fallbackUser.prenom,
            nom: fallbackUser.nom,
            email: fallbackUser.email,
            location: fallbackUser.location,
            savings_cents: fallbackUser.savingsCents,
            offers_used: fallbackUser.offersUsed,
            reviews_count: fallbackUser.reviewsCount,
          },
          { onConflict: 'id' }
        )
        .select('id,prenom,nom,email,location,savings_cents,offers_used,reviews_count')
        .maybeSingle()

      if (insertError) {
        console.error(`[Auth] createFallbackProfile: ${insertError.message}`)
        return fallbackUser
      }

      if (!insertedData) {
        return fallbackUser
      }

      return mapRowToUser(insertedData as UserProfileRow)
    },
    [supabase]
  )

  useEffect(() => {
    let active = true

    const syncAuthState = async (authUser: SupabaseAuthUser | null) => {
      const nextUser = await loadUserProfile(authUser)
      if (active) {
        setUser(nextUser)
      }
    }

    const initialize = async () => {
      const {
        data: { user: authUser },
        error,
      } = await supabase.auth.getUser()

      if (error) {
        console.error(`[Auth] initialize: ${error.message}`)
      }

      await syncAuthState(authUser)

      if (active) {
        setLoading(false)
      }
    }

    initialize()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      await syncAuthState(session?.user ?? null)
      if (active) {
        setLoading(false)
      }
    })

    return () => {
      active = false
      subscription.unsubscribe()
    }
  }, [loadUserProfile, supabase])

  const login = useCallback(
    async (email: string, password: string) => {
      const { error } = await supabase.auth.signInWithPassword({ email, password })

      if (error) {
        return error.message
      }

      return null
    },
    [supabase]
  )

  const logout = useCallback(async () => {
    const { error } = await supabase.auth.signOut()
    if (error) {
      console.error(`[Auth] logout: ${error.message}`)
    }
    setUser(null)
  }, [supabase])

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
