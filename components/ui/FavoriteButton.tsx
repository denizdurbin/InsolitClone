'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/Button'

interface FavoriteButtonProps {
  offerId: string
}

export default function FavoriteButton({ offerId }: FavoriteButtonProps) {
  const [isFavorite, setIsFavorite] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

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
    setSaving(true)
    try {
      if (isFavorite) {
        const response = await fetch(`/api/favorites/${encodeURIComponent(offerId)}`, {
          method: 'DELETE',
        })

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

      if (!response.ok) return
      setIsFavorite(true)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Button
      variant={isFavorite ? 'primary' : 'outline'}
      className="w-full justify-center"
      size="sm"
      onClick={toggleFavorite}
      disabled={loading || saving}
    >
      {loading ? 'Chargement...' : saving ? 'Mise a jour...' : isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
    </Button>
  )
}
