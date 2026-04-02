'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { AlertTriangle, Loader2, ShieldCheck, User, X } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { AdminTabs } from '@/components/layout/AdminTabs'
import { useAuth } from '@/lib/auth'

interface AdminReview {
  id: number
  rating: number
  title: string
  text: string
  createdAt: string
  author: {
    id: string | null
    prenom: string
    nom: string
    email: string
    location: string
    birthDate: string | null
    savingsCents: number
    offersUsed: number
    reviewsCount: number
    created_at?: string
    updated_at?: string
  }
  offer: {
    id: string | null
    title: string
  }
}

interface AdminUserModal {
  id: string | null
  prenom: string
  nom: string
  email: string
  location: string
  birthDate: string | null
  savingsCents: number
  offersUsed: number
  reviewsCount: number
  created_at?: string
  updated_at?: string
}

type GuardState = 'idle' | 'checking' | 'denied' | 'ok'

function formatDate(value?: string | null) {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }).format(date)
}

function formatMoney(cents: number) {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(cents / 100)
}

export default function AdminReviewsPage() {
  const { user, isAuthenticated, loading } = useAuth()
  const [guard, setGuard] = useState<GuardState>('idle')
  const [reviews, setReviews] = useState<AdminReview[]>([])
  const [reviewsLoading, setReviewsLoading] = useState(false)
  const [selectedUser, setSelectedUser] = useState<AdminUserModal | null>(null)

  const heroSubtitle = useMemo(() => {
    if (guard === 'denied') return 'Accès refusé'
    if (guard === 'ok') return 'Gestion des reviews'
    return 'Vérification en cours'
  }, [guard])

  const loadReviews = useCallback(async () => {
    if (!user?.email) return
    setReviewsLoading(true)
    try {
      const res = await fetch('/api/admin/reviews', { headers: { 'x-admin-email': user.email } })
      const data = await res.json().catch(() => null)
      if (data?.reviews) setReviews(data.reviews as AdminReview[])
    } finally {
      setReviewsLoading(false)
    }
  }, [user?.email])

  useEffect(() => {
    if (loading) return
    if (!isAuthenticated || !user?.email) {
      setGuard('denied')
      return
    }

    setGuard('checking')
    fetch(`/api/admin/check?email=${encodeURIComponent(user.email)}`, { cache: 'no-store' })
      .then((res) => res.json())
      .then((data) => setGuard(data.authorized ? 'ok' : 'denied'))
      .catch(() => setGuard('denied'))
  }, [loading, isAuthenticated, user?.email])

  useEffect(() => {
    if (guard !== 'ok') return
    void loadReviews()
  }, [guard, loadReviews])

  function openUserModal(author: AdminUserModal) {
    setSelectedUser(author)
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-bg">
      <div className="border-b border-gray-100 dark:border-dark-border bg-white dark:bg-dark-alt">
        <div className="max-w-6xl mx-auto px-6 py-10">
          <div className="flex items-center gap-3 text-pink">
            <ShieldCheck size={18} />
            <span className="uppercase tracking-wide text-xs font-semibold">Admin</span>
          </div>
          <div className="mt-3 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">Reviews</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">{heroSubtitle}</p>
          </div>
          <AdminTabs />
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-10">
        {guard === 'checking' && (
          <div className="mt-6 flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300">
            <Loader2 size={16} className="animate-spin" />
            Vérification des droits administrateur…
          </div>
        )}

        {guard === 'denied' && (
          <div className="mt-6 flex items-start gap-3 rounded-xl border border-red-200 dark:border-red-900/40 bg-red-50 dark:bg-red-900/10 p-4 text-sm text-red-600 dark:text-red-300">
            <AlertTriangle size={18} />
            <div>
              <p className="font-semibold">Accès refusé</p>
              <p className="text-red-500/80">Connecte-toi avec un email autorisé dans ADMIN_EMAILS.</p>
            </div>
          </div>
        )}

        {guard === 'ok' && (
          <section className="bg-white dark:bg-dark-card border border-gray-100 dark:border-dark-border rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center dark:bg-blue-900/10">
                <User size={18} />
              </div>
              <div>
                <h2 className="text-xl font-bold">Reviews</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">Clique sur le nom de l’auteur pour voir ses infos.</p>
              </div>
              <div className="ml-auto text-xs text-gray-500 dark:text-gray-400">{reviews.length} avis</div>
            </div>

            {reviewsLoading ? (
              <div className="flex items-center gap-2 text-sm text-gray-500"><Loader2 className="animate-spin" size={16} /> Chargement…</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="text-left text-xs uppercase tracking-wide text-gray-400">
                    <tr>
                      <th className="py-3 pr-4">Avis</th>
                      <th className="py-3 pr-4">Auteur</th>
                      <th className="py-3 pr-4">Offre</th>
                      <th className="py-3 pr-4">Note</th>
                      <th className="py-3 pr-4">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-dark-border">
                    {reviews.map((review) => (
                      <tr key={review.id} className="align-top">
                        <td className="py-4 pr-4">
                          <p className="font-semibold text-gray-900 dark:text-white">{review.title}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">{review.text}</p>
                        </td>
                        <td className="py-4 pr-4">
                          <button
                            type="button"
                            onClick={() => openUserModal({
                              id: review.author.id,
                              prenom: review.author.prenom,
                              nom: review.author.nom,
                              email: review.author.email,
                              location: review.author.location,
                              birthDate: review.author.birthDate,
                              savingsCents: review.author.savingsCents,
                              offersUsed: review.author.offersUsed,
                              reviewsCount: review.author.reviewsCount,
                              created_at: review.author.created_at ?? review.createdAt,
                              updated_at: review.author.updated_at ?? review.createdAt,
                            })}
                            className="text-left font-semibold text-pink hover:underline"
                          >
                            {review.author.prenom} {review.author.nom}
                          </button>
                          <p className="text-xs text-gray-400 mt-1">{review.author.email}</p>
                        </td>
                        <td className="py-4 pr-4 text-gray-600 dark:text-gray-300">{review.offer.title}</td>
                        <td className="py-4 pr-4 text-gray-600 dark:text-gray-300">{review.rating}/5</td>
                        <td className="py-4 pr-4 text-gray-600 dark:text-gray-300">{formatDate(review.createdAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}
      </div>

      {selectedUser && (
        <div className="fixed inset-0 z-[65] flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
          <div className="w-full max-w-2xl bg-white dark:bg-dark-card rounded-2xl border border-gray-100 dark:border-dark-border shadow-2xl p-6">
            <div className="flex items-start justify-between gap-3 mb-4">
              <div>
                <p className="text-xs uppercase tracking-wide text-gray-400">Auteur</p>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{selectedUser.prenom} {selectedUser.nom}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{selectedUser.email}</p>
              </div>
              <Button variant="ghost" onClick={() => setSelectedUser(null)} className="px-3"><X size={16} /></Button>
            </div>

            <div className="grid sm:grid-cols-2 gap-3 text-sm mb-5">
              <InfoChip label="Lieu" value={selectedUser.location} />
              <InfoChip label="Date de naissance" value={formatDate(selectedUser.birthDate)} />
              <InfoChip label="Économies" value={formatMoney(selectedUser.savingsCents)} />
              <InfoChip label="Activité" value={`${selectedUser.offersUsed} offres · ${selectedUser.reviewsCount} avis`} />
              <InfoChip label="Créé" value={formatDate(selectedUser.created_at)} />
              <InfoChip label="Mis à jour" value={formatDate(selectedUser.updated_at)} />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100 dark:border-dark-border">
              <Button variant="outline" onClick={() => setSelectedUser(null)}>Fermer</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function InfoChip({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-gray-50 dark:bg-dark-alt border border-gray-100 dark:border-dark-border px-3 py-2">
      <p className="text-[11px] uppercase tracking-wide text-gray-400">{label}</p>
      <p className="mt-1 text-sm font-medium text-gray-800 dark:text-gray-100">{value}</p>
    </div>
  )
}
