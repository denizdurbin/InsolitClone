'use client'

import { useState } from 'react'
import { MessageSquare, Star } from 'lucide-react'
import type { Review } from '@/lib/data'
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/lib/auth'

interface OfferReviewsSectionProps {
  offerId: string
  offerTitle: string
  initialReviews: Review[]
}

function formatReviewDate(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Date inconnue'

  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date)
}

export function OfferReviewsSection({ offerId, offerTitle, initialReviews }: OfferReviewsSectionProps) {
  const { isAuthenticated, loading } = useAuth()
  const [reviews, setReviews] = useState<Review[]>(initialReviews)
  const [rating, setRating] = useState(5)
  const [title, setTitle] = useState('')
  const [text, setText] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setSuccess(null)

    const cleanTitle = title.trim()
    const cleanText = text.trim()

    if (!cleanTitle || !cleanText) {
      setError('Merci de renseigner un titre et un commentaire.')
      return
    }

    if (cleanTitle.length > 120) {
      setError('Le titre est trop long (120 caracteres max).')
      return
    }

    if (cleanText.length > 1000) {
      setError('Le commentaire est trop long (1000 caracteres max).')
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          offerId,
          rating,
          title: cleanTitle,
          text: cleanText,
        }),
      })

      const payload = (await response.json().catch(() => null)) as { message?: string; review?: Review } | null

      if (!response.ok || !payload?.review) {
        throw new Error(payload?.message ?? 'Impossible de publier ton commentaire pour le moment.')
      }

      setReviews((prev) => [payload.review as Review, ...prev])
      setTitle('')
      setText('')
      setRating(5)
      setSuccess('Merci, ton commentaire a bien ete publie.')
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Impossible de publier ton commentaire pour le moment.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section
      aria-labelledby="offer-reviews-title"
      className="bg-white dark:bg-dark-card border border-gray-100 dark:border-dark-border rounded-2xl p-6"
    >
      <h2
        id="offer-reviews-title"
        className="text-base font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2"
      >
        <MessageSquare size={16} className="text-pink" aria-hidden="true" />
        Avis des utilisateurs
      </h2>

      <ul className="space-y-4">
        {reviews.length === 0 && (
          <li className="rounded-xl border border-dashed border-gray-200 dark:border-dark-border p-4 text-sm text-gray-500 dark:text-gray-400">
            Aucun avis pour cette offre pour le moment.
          </li>
        )}

        {reviews.map((review) => (
          <li key={review.id} className="pb-4 border-b border-gray-50 dark:border-dark-border last:border-0 last:pb-0">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{review.title}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Par {review.userName} · {formatReviewDate(review.createdAt)}
                </p>
              </div>
              <div className="flex gap-0.5" aria-label={`${review.rating} etoiles`}>
                {Array.from({ length: 5 }).map((_, index) => (
                  <Star
                    key={index}
                    size={12}
                    className={index < review.rating ? 'fill-yellow text-yellow' : 'fill-gray-200 text-gray-200'}
                  />
                ))}
              </div>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-2 leading-relaxed">{review.text}</p>
          </li>
        ))}
      </ul>

      <div className="mt-6 pt-6 border-t border-gray-100 dark:border-dark-border">
        <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-3">Laisser un commentaire</h3>

        {!loading && !isAuthenticated && (
          <div className="rounded-xl border border-dashed border-gray-200 dark:border-dark-border p-4">
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
              Connecte-toi pour laisser un commentaire sur {offerTitle}.
            </p>
            <div className="flex flex-wrap gap-2">
              <Button href="/connexion" variant="outline" size="sm">Connexion</Button>
              <Button href="/inscription" size="sm">Inscription</Button>
            </div>
          </div>
        )}

        {!loading && isAuthenticated && (
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <p className="text-xs font-semibold text-gray-600 dark:text-gray-300 mb-2">Ta note</p>
              <div className="flex gap-1">
                {Array.from({ length: 5 }).map((_, index) => {
                  const value = index + 1
                  return (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setRating(value)}
                      className="p-1"
                      aria-label={`Noter ${value} sur 5`}
                      aria-pressed={rating === value}
                    >
                      <Star
                        size={18}
                        className={value <= rating ? 'fill-yellow text-yellow' : 'fill-gray-200 text-gray-200'}
                      />
                    </button>
                  )
                })}
              </div>
            </div>

            <div>
              <label htmlFor="review-title" className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1">
                Titre
              </label>
              <input
                id="review-title"
                value={title}
                maxLength={120}
                onChange={(event) => setTitle(event.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-dark-alt text-sm text-gray-900 dark:text-white outline-none focus:border-pink"
                placeholder="Ex: Super experience"
              />
            </div>

            <div>
              <label htmlFor="review-text" className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1">
                Commentaire
              </label>
              <textarea
                id="review-text"
                value={text}
                maxLength={1000}
                onChange={(event) => setText(event.target.value)}
                rows={4}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-dark-alt text-sm text-gray-900 dark:text-white outline-none focus:border-pink resize-y"
                placeholder="Partage ton retour sur cette offre"
              />
            </div>

            <div className="flex items-center gap-2">
              <Button type="submit" size="sm" disabled={isSubmitting}>
                {isSubmitting ? 'Publication...' : 'Publier mon commentaire'}
              </Button>
              {error && <p className="text-xs text-red-600 dark:text-red-400">{error}</p>}
              {success && <p className="text-xs text-green-600 dark:text-green-400">{success}</p>}
            </div>
          </form>
        )}
      </div>
    </section>
  )
}
