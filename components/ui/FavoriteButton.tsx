'use client'

import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'

interface FavoriteButtonProps {
  offerId: string
}

export default function FavoriteButton({ offerId }: FavoriteButtonProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [isFavorite, setIsFavorite] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [requiresLogin, setRequiresLogin] = useState(false)

  useEffect(() => {
    let active = true

    async function loadFavoriteState() {
      try {
        const response = await fetch(`/api/favorites?offerId=${encodeURIComponent(offerId)}`, {
          cache: 'no-store',
        })

        if (!active) return
        if (response.status === 401) {
          setIsFavorite(false)
          setRequiresLogin(true)
          setLoading(false)
          return
        }

        if (!response.ok) {
          setLoading(false)
          return
        }

        const data = (await response.json()) as { isFavorite?: boolean }
        setIsFavorite(Boolean(data.isFavorite))
      } finally {
        if (active) setLoading(false)
      }
    }

    void loadFavoriteState()

    return () => {
      active = false
    }
  }, [offerId])

  async function toggleFavorite() {
    if (requiresLogin) {
      router.push(`/connexion?next=${encodeURIComponent(pathname || '/offres')}`)
      return
    }

    setSaving(true)
    try {
      if (isFavorite) {
        const response = await fetch(`/api/favorites/${encodeURIComponent(offerId)}`, {
          method: 'DELETE',
        })

        if (response.status === 401) {
          setRequiresLogin(true)
          router.push(`/connexion?next=${encodeURIComponent(pathname || '/offres')}`)
          return
        }

        if (!response.ok) return
        setIsFavorite(false)
        return
      }

      const response = await fetch('/api/favorites', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ offerId }),
      })

      if (response.status === 401) {
        setRequiresLogin(true)
        router.push(`/connexion?next=${encodeURIComponent(pathname || '/offres')}`)
        return
      }

      if (!response.ok) return
      setIsFavorite(true)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-2">
      <Button
        variant={isFavorite ? 'primary' : 'outline'}
        className="w-full justify-center"
        size="sm"
        onClick={toggleFavorite}
        disabled={loading || saving}
      >
        {loading ? 'Chargement...' : saving ? 'Mise a jour...' : isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
      </Button>
      {requiresLogin && !loading && (
        <p className="text-xs text-gray-500 text-center">Connecte-toi pour ajouter cette offre aux favoris.</p>
      )}
    </div>
  )
}
