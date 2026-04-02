'use client'

import { useEffect, useMemo, useState, useCallback, useRef } from 'react'
import Link from 'next/link'
import { AlertTriangle, BarChart2, Eye, Loader2, PlusCircle, ShieldCheck, Pencil, Trash2, Save, X, User } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { AdminTabs } from '@/components/layout/AdminTabs'
import { useAuth } from '@/lib/auth'
import { type Category, CATEGORIES, type Offer } from '@/lib/data'

interface AdminAnalytics {
  totalOffers: number
  averageRating: number
  categoriesCount: number
  topCategory: string
  offersWithBadge: number
  offersWithPrice: number
}

interface AdminUser {
  id: string | null
  prenom: string
  nom: string
  email: string
  location: string
  birthDate: string | null
  savingsCents: number
  offersUsed: number
  reviewsCount: number
  created_at: string
  updated_at: string
}

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

type GuardState = 'idle' | 'checking' | 'denied' | 'ok'
type FormState = 'idle' | 'loading' | 'success' | 'error'
const OFFERS_PAGE_SIZE = 12

const categoryLabels: Record<Category, string> = {
  restaurant: 'Restaurant',
  activite: 'Activité',
  cadeau: 'Cadeau',
  sport: 'Sport',
  cinema: 'Cinéma',
}

export default function AdminPage() {
  const { user, isAuthenticated, loading } = useAuth()

  const [guard, setGuard] = useState<GuardState>('idle')
  const [analytics, setAnalytics] = useState<AdminAnalytics | null>(null)
  const [analyticsLoading, setAnalyticsLoading] = useState(false)

  const [users, setUsers] = useState<AdminUser[]>([])
  const [usersLoading, setUsersLoading] = useState(false)
  const [reviews, setReviews] = useState<AdminReview[]>([])
  const [reviewsLoading, setReviewsLoading] = useState(false)

  const [offers, setOffers] = useState<Offer[]>([])
  const [offersLoading, setOffersLoading] = useState(false)
  const [visibleOffersCount, setVisibleOffersCount] = useState(OFFERS_PAGE_SIZE)

  const [editId, setEditId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    category: 'restaurant' as Category,
    emoji: '',
    gradient: '',
    rating: 4,
    distance: '—',
    price: '',
    badge: '',
    address: '',
    details: '',
  })
  const [editState, setEditState] = useState<FormState>('idle')
  const [editError, setEditError] = useState('')
  const [pendingDelete, setPendingDelete] = useState<{ id: string; title: string } | null>(null)
  const [previewOffer, setPreviewOffer] = useState<Offer | null>(null)
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null)
  const [userEditMode, setUserEditMode] = useState(false)
  const [userEditForm, setUserEditForm] = useState({
    prenom: '',
    nom: '',
    email: '',
    location: '',
    birthDate: '',
  })
  const [userActionState, setUserActionState] = useState<FormState>('idle')
  const [userActionError, setUserActionError] = useState('')
  const [pendingUserDelete, setPendingUserDelete] = useState<AdminUser | null>(null)
  const editSectionRef = useRef<HTMLDivElement | null>(null)

  const heroSubtitle = useMemo(() => {
    if (guard === 'denied') return 'Accès refusé'
    if (guard === 'ok') return 'Gestion des offres'
    return 'Vérification en cours'
  }, [guard])

  const visibleOffers = useMemo(() => offers.slice(0, visibleOffersCount), [offers, visibleOffersCount])

  const openUserModal = useCallback((user: AdminUser) => {
    setSelectedUser(user)
    setUserEditMode(false)
    setUserActionState('idle')
    setUserActionError('')
    setUserEditForm({
      prenom: user.prenom,
      nom: user.nom,
      email: user.email,
      location: user.location,
      birthDate: user.birthDate ?? '',
    })
  }, [])

  function formatDate(value?: string | null) {
    if (!value) return '—'

    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return '—'

    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(date)
  }

  const loadOffers = useCallback(async () => {
    if (!user?.email) return
    setOffersLoading(true)
    try {
      const res = await fetch('/api/admin/offers', { headers: { 'x-admin-email': user.email } })
      const data = await res.json()
      if (data?.offers) setOffers(data.offers as Offer[])
    } finally {
      setOffersLoading(false)
    }
  }, [user?.email])

  const loadUsers = useCallback(async () => {
    if (!user?.email) return
    setUsersLoading(true)
    try {
      const res = await fetch('/api/admin/users', { headers: { 'x-admin-email': user.email } })
      const data = await res.json()
      if (data?.users) setUsers(data.users as AdminUser[])
    } finally {
      setUsersLoading(false)
    }
  }, [user?.email])

  const loadReviews = useCallback(async () => {
    if (!user?.email) return
    setReviewsLoading(true)
    try {
      const res = await fetch('/api/admin/reviews', { headers: { 'x-admin-email': user.email } })
      const data = await res.json()
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
    fetch('/api/admin/check', {
      headers: { 'x-admin-email': user.email },
    })
      .then((res) => res.json())
      .then((data) => setGuard(data.authorized ? 'ok' : 'denied'))
      .catch(() => setGuard('denied'))
  }, [loading, isAuthenticated, user?.email])

  useEffect(() => {
    if (guard !== 'ok' || !user?.email) return

    setAnalyticsLoading(true)
    fetch('/api/admin/analytics', {
      headers: { 'x-admin-email': user.email },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data?.analytics) setAnalytics(data.analytics)
      })
      .finally(() => setAnalyticsLoading(false))
  }, [guard, user?.email])

  useEffect(() => {
    if (guard !== 'ok') return
    loadOffers()
  }, [guard, loadOffers])

  useEffect(() => {
    if (guard !== 'ok') return
    void Promise.all([loadUsers(), loadReviews()])
  }, [guard, loadUsers, loadReviews])

  useEffect(() => {
    if (!editId) return
    editSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [editId])

  function startEdit(offer: Offer) {
    setPreviewOffer(null)
    setEditId(offer.id)
    setEditError('')
    setEditState('idle')
    setEditForm({
      title: offer.title,
      description: offer.description,
      category: offer.category,
      emoji: offer.emoji,
      gradient: offer.gradient,
      rating: offer.rating,
      distance: offer.distance,
      price: offer.price ?? '',
      badge: offer.badge ?? '',
      address: offer.address ?? '',
      details: offer.details ? offer.details.join('\n') : '',
    })
  }

  async function handleUpdate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!editId || !user?.email) return
    setEditState('loading')
    setEditError('')

    const payload = {
      ...editForm,
      rating: Number(editForm.rating),
    }

    const response = await fetch(`/api/admin/offers/${editId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-email': user.email,
      },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      const data = await response.json().catch(() => ({}))
      setEditError(data?.error || 'Échec de la mise à jour')
      setEditState('error')
      return
    }

    setEditState('success')
    await loadOffers()
    setTimeout(() => setEditState('idle'), 1500)
  }

  async function handleDelete(id: string) {
    if (!user?.email) return

    setEditState('loading')
    setEditError('')
    const response = await fetch(`/api/admin/offers/${id}`, {
      method: 'DELETE',
      headers: { 'x-admin-email': user.email },
    })

    if (!response.ok) {
      const data = await response.json().catch(() => ({}))
      setEditError(data?.error || 'Suppression impossible')
      setEditState('error')
      return
    }

    setEditId(null)
    setEditState('idle')
    setPendingDelete(null)
    setPreviewOffer(null)
    await loadOffers()
  }

  async function handleSaveUser(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!selectedUser?.id || !user?.email) return

    setUserActionState('loading')
    setUserActionError('')

    const response = await fetch(`/api/admin/users/${selectedUser.id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-email': user.email,
      },
      body: JSON.stringify({
        prenom: userEditForm.prenom,
        nom: userEditForm.nom,
        email: userEditForm.email,
        location: userEditForm.location,
        birthDate: userEditForm.birthDate,
      }),
    })

    const payload = (await response.json().catch(() => ({}))) as { error?: string; user?: AdminUser }

    if (!response.ok || !payload?.user) {
      setUserActionError(payload?.error || 'Échec de la mise à jour du compte')
      setUserActionState('error')
      return
    }

    setSelectedUser(payload.user)
    setUserEditMode(false)
    setUserActionState('success')
    await Promise.all([loadUsers(), loadReviews()])
    setTimeout(() => setUserActionState('idle'), 1500)
  }

  async function handleDeleteUser(id: string) {
    if (!user?.email) return

    setUserActionState('loading')
    setUserActionError('')

    const response = await fetch(`/api/admin/users/${id}`, {
      method: 'DELETE',
      headers: { 'x-admin-email': user.email },
    })

    const payload = (await response.json().catch(() => ({}))) as { error?: string }

    if (!response.ok) {
      setUserActionError(payload?.error || 'Suppression impossible')
      setUserActionState('error')
      return
    }

    setPendingUserDelete(null)
    setSelectedUser(null)
    setUserEditMode(false)
    setUserActionState('idle')
    await Promise.all([loadUsers(), loadReviews()])
  }

  function renderGuard() {
    if (guard === 'ok') return null

    if (guard === 'checking') {
      return (
        <div className="mt-6 flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300">
          <Loader2 size={16} className="animate-spin" />
          Vérification des droits administrateur…
        </div>
      )
    }

    return (
      <div className="mt-6 flex items-start gap-3 rounded-xl border border-red-200 dark:border-red-900/40 bg-red-50 dark:bg-red-900/10 p-4 text-sm text-red-600 dark:text-red-300">
        <AlertTriangle size={18} />
        <div>
          <p className="font-semibold">Accès refusé</p>
          <p className="text-red-500/80">Connecte-toi avec un email autorisé dans ADMIN_EMAILS.</p>
        </div>
      </div>
    )
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
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">Admin Dashboard</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">{heroSubtitle}</p>
          </div>
          <AdminTabs />
          {renderGuard()}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-10 space-y-8">
        {false && (
          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <AnalyticsCard
              loading={analyticsLoading}
              title="Nombre total d'offres"
              value={analytics?.totalOffers ?? 0}
              helper=""
            />
            <AnalyticsCard
              loading={analyticsLoading}
              title="Note moyenne"
              value={`${analytics?.averageRating ?? 0} / 5`}
              helper=""
            />
            <AnalyticsCard
              loading={analyticsLoading}
              title="Catégorie phare"
              value={analytics?.topCategory ?? '–'}
              helper={`${analytics?.categoriesCount ?? 0} catégories actives`}
            />
            <AnalyticsCard
              loading={analyticsLoading}
              title="Offres taguées"
              value={`${analytics?.offersWithBadge ?? 0} badges`}
              helper="Champ badge non vide"
            />
            <AnalyticsCard
              loading={analyticsLoading}
              title="Offres avec prix"
              value={analytics?.offersWithPrice ?? 0}
              helper="Champ price renseigné"
            />
          </section>
        )}

        {false && (
          <section className="bg-white dark:bg-dark-card border border-gray-100 dark:border-dark-border rounded-2xl p-6 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-pink/10 text-pink flex items-center justify-center">
                  <PlusCircle size={18} />
                </div>
                <div>
                  <h2 className="text-xl font-bold">Création d'offre</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Ajoutez une nouvelle offre à la plateforme.</p>
                </div>
              </div>
              <Link href="/admin/offres/nouvelle">
                <Button variant="primary" className="w-full md:w-auto">
                  <span className="flex items-center gap-2"><PlusCircle size={16} /> Créer une offre</span>
                </Button>
              </Link>
            </div>
          </section>
        )}

        {guard === 'ok' && (
          <section className="bg-white dark:bg-dark-card border border-gray-100 dark:border-dark-border rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center dark:bg-blue-900/10">
                <BarChart2 size={18} />
              </div>
              <div>
                <h2 className="text-xl font-bold">Offres existantes</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">Consultez, modifiez ou supprimez les offres en base.</p>
              </div>
              <div className="ml-auto text-xs text-gray-500 dark:text-gray-400">{offers.length} offres</div>
            </div>

            {offersLoading ? (
              <div className="flex items-center gap-2 text-sm text-gray-500"><Loader2 className="animate-spin" size={16} /> Chargement…</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-3">
                {visibleOffers.map((offer) => (
                  <div key={offer.id} className="border border-gray-100 dark:border-dark-border rounded-xl p-4 bg-white dark:bg-dark-alt shadow-sm flex flex-col gap-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-base font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                          <EmojiMedia value={offer.emoji} alt={offer.title} />
                          {offer.title}
                        </p>
                        <p className="mt-3 text-xs uppercase tracking-wide text-gray-400">{offer.categoryLabel}</p>

                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={() => setPreviewOffer(offer)}>
                          Voir
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => startEdit(offer)}>
                          Modifier
                        </Button>
                        <Button size="sm" onClick={() => setPendingDelete({ id: offer.id, title: offer.title })} className="flex-shrink-0">
                          <Trash2 size={14} aria-hidden="true" />
                          Supprimer
                        </Button>
                      </div>
                    </div>
                    <p className="text-xs text-pink-500 line-clamp-2">{offer.description}</p>
                    <div className="text-xs text-gray-400 flex items-center gap-3">
                      <span>ID: {offer.id}</span>
                      {offer.price && <span>Prix: {offer.price}</span>}
                      {offer.badge && <span>Badge: {offer.badge}</span>}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {!offersLoading && offers.length > visibleOffersCount && (
              <div className="mt-4 flex justify-center">
                <Button
                  variant="outline"
                  onClick={() => setVisibleOffersCount((prev) => prev + OFFERS_PAGE_SIZE)}
                >
                  Afficher plus ({Math.min(OFFERS_PAGE_SIZE, offers.length - visibleOffersCount)})
                </Button>
              </div>
            )}

            {editId && (
              <div ref={editSectionRef} className="mt-6 border-t border-gray-100 dark:border-dark-border pt-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 rounded-full bg-pink/10 text-pink flex items-center justify-center"><Pencil size={14} /></div>
                  <div>
                    <h3 className="text-lg font-semibold">Modifier l'offre</h3>
                    <p className="text-xs text-gray-500">ID: {editId}</p>
                  </div>
                </div>

                <form className="space-y-4" onSubmit={handleUpdate}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <FormField label="Titre" required>
                      <input
                        required
                        value={editForm.title}
                        onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                        className="w-full rounded-xl border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-alt px-4 py-3 text-sm focus:border-pink outline-none"
                      />
                    </FormField>

                    <FormField label="Catégorie" required>
                      <select
                        value={editForm.category}
                        onChange={(e) => setEditForm({ ...editForm, category: e.target.value as Category })}
                        className="w-full rounded-xl border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-alt px-4 py-3 text-sm focus:border-pink outline-none"
                      >
                        {CATEGORIES.map((cat) => <option key={cat} value={cat}>{categoryLabels[cat]}</option>)}
                      </select>
                    </FormField>

                    <FormField label="Emoji">
                      <input value={editForm.emoji} onChange={(e) => setEditForm({ ...editForm, emoji: e.target.value })}
                        className="w-full rounded-xl border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-alt px-4 py-3 text-sm focus:border-pink outline-none" />
                    </FormField>

                    <FormField label="Gradient">
                      <input value={editForm.gradient} onChange={(e) => setEditForm({ ...editForm, gradient: e.target.value })}
                        className="w-full rounded-xl border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-alt px-4 py-3 text-sm focus:border-pink outline-none" />
                    </FormField>

                    <FormField label="Distance">
                      <input value={editForm.distance} onChange={(e) => setEditForm({ ...editForm, distance: e.target.value })}
                        className="w-full rounded-xl border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-alt px-4 py-3 text-sm focus:border-pink outline-none" />
                    </FormField>

                    <FormField label="Adresse">
                      <input value={editForm.address} onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                        className="w-full rounded-xl border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-alt px-4 py-3 text-sm focus:border-pink outline-none" />
                    </FormField>

                    <FormField label="Prix">
                      <input value={editForm.price} onChange={(e) => setEditForm({ ...editForm, price: e.target.value })}
                        className="w-full rounded-xl border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-alt px-4 py-3 text-sm focus:border-pink outline-none" />
                    </FormField>

                    <FormField label="Badge">
                      <input value={editForm.badge} onChange={(e) => setEditForm({ ...editForm, badge: e.target.value })}
                        className="w-full rounded-xl border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-alt px-4 py-3 text-sm focus:border-pink outline-none" />
                    </FormField>

                    <FormField label="Note" helper="0 à 5">
                      <input type="number" min={0} max={5} step={0.1}
                        value={editForm.rating}
                        onChange={(e) => setEditForm({ ...editForm, rating: Number(e.target.value) })}
                        className="w-full rounded-xl border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-alt px-4 py-3 text-sm focus:border-pink outline-none" />
                    </FormField>

                    <div className="md:col-span-2">
                      <FormField label="Description" required>
                        <textarea value={editForm.description}
                          onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                          className="w-full rounded-xl border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-alt px-4 py-3 text-sm focus:border-pink outline-none min-h-[96px]" />
                      </FormField>
                    </div>

                    <div className="md:col-span-2">
                      <FormField label="Détails" helper="Un point par ligne">
                        <textarea value={editForm.details}
                          onChange={(e) => setEditForm({ ...editForm, details: e.target.value })}
                          className="w-full rounded-xl border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-alt px-4 py-3 text-sm focus:border-pink outline-none min-h-[96px]" />
                      </FormField>
                    </div>
                  </div>

                  {editError && (
                    <div className="flex items-start gap-2 text-sm text-red-600 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/40 rounded-xl px-3 py-2">
                      <AlertTriangle size={16} className="mt-0.5" />
                      <span>{editError}</span>
                    </div>
                  )}

                  {editState === 'success' && (
                    <div className="flex items-start gap-2 text-sm text-green-700 bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-900/40 rounded-xl px-3 py-2">
                      <ShieldCheck size={16} className="mt-0.5" />
                      <span>Offre mise à jour</span>
                    </div>
                  )}

                  <div className="flex items-center gap-2 flex-wrap">
                    <Button type="submit" variant="primary" disabled={editState === 'loading'} className="disabled:opacity-60">
                      {editState === 'loading' ? <span className="flex items-center gap-2"><Loader2 size={16} className="animate-spin" /> Mise à jour…</span> : <span className="flex items-center gap-2"><Save size={15} /> Enregistrer</span>}
                    </Button>
                    <Button type="button" variant="ghost" onClick={() => setEditId(null)}>Fermer</Button>
                  </div>
                </form>
              </div>
            )}
          </section>
        )}

        {false && selectedUser && (
          <div className="fixed inset-0 z-[65] flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
            <div className="w-full max-w-2xl bg-white dark:bg-dark-card rounded-2xl border border-gray-100 dark:border-dark-border shadow-2xl p-6">
              <div className="flex items-start justify-between gap-3 mb-4">
                <div>
                  <p className="text-xs uppercase tracking-wide text-gray-400">Utilisateur</p>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                    {selectedUser!.prenom} {selectedUser!.nom}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{selectedUser!.email}</p>
                </div>
                <Button variant="ghost" onClick={() => setSelectedUser(null)} className="px-3">
                  <X size={16} />
                </Button>
              </div>

              {userEditMode ? (
                <form className="space-y-4" onSubmit={handleSaveUser}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <FormField label="Prénom" required>
                      <input
                        required
                        value={userEditForm.prenom}
                        onChange={(e) => setUserEditForm({ ...userEditForm, prenom: e.target.value })}
                        className="w-full rounded-xl border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-alt px-4 py-3 text-sm focus:border-pink outline-none"
                      />
                    </FormField>
                    <FormField label="Nom" required>
                      <input
                        required
                        value={userEditForm.nom}
                        onChange={(e) => setUserEditForm({ ...userEditForm, nom: e.target.value })}
                        className="w-full rounded-xl border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-alt px-4 py-3 text-sm focus:border-pink outline-none"
                      />
                    </FormField>
                    <FormField label="Email" required>
                      <input
                        required
                        type="email"
                        value={userEditForm.email}
                        onChange={(e) => setUserEditForm({ ...userEditForm, email: e.target.value })}
                        className="w-full rounded-xl border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-alt px-4 py-3 text-sm focus:border-pink outline-none"
                      />
                    </FormField>
                    <FormField label="Lieu" required>
                      <input
                        required
                        value={userEditForm.location}
                        onChange={(e) => setUserEditForm({ ...userEditForm, location: e.target.value })}
                        className="w-full rounded-xl border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-alt px-4 py-3 text-sm focus:border-pink outline-none"
                      />
                    </FormField>
                    <FormField label="Date de naissance" required>
                      <input
                        required
                        type="date"
                        value={userEditForm.birthDate}
                        onChange={(e) => setUserEditForm({ ...userEditForm, birthDate: e.target.value })}
                        className="w-full rounded-xl border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-alt px-4 py-3 text-sm focus:border-pink outline-none"
                      />
                    </FormField>
                  </div>

                  {userActionError && (
                    <div className="flex items-start gap-2 text-sm text-red-600 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/40 rounded-xl px-3 py-2">
                      <AlertTriangle size={16} className="mt-0.5" />
                      <span>{userActionError}</span>
                    </div>
                  )}

                  {userActionState === 'success' && (
                    <div className="flex items-start gap-2 text-sm text-green-700 bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-900/40 rounded-xl px-3 py-2">
                      <ShieldCheck size={16} className="mt-0.5" />
                      <span>Utilisateur mis à jour</span>
                    </div>
                  )}

                  <div className="flex items-center gap-2 flex-wrap justify-end">
                    <Button type="button" variant="ghost" onClick={() => {
                      setUserEditMode(false)
                      setUserActionError('')
                      setUserActionState('idle')
                    }}>
                      Fermer
                    </Button>
                    <Button type="submit" variant="primary" disabled={userActionState === 'loading'}>
                      {userActionState === 'loading' ? <span className="flex items-center gap-2"><Loader2 size={16} className="animate-spin" /> Mise à jour…</span> : 'Enregistrer'}
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      className="bg-white text-pink border border-pink hover:bg-pink/10"
                      onClick={() => {
                        if (selectedUser!.id) {
                          setPendingUserDelete(selectedUser!)
                          setSelectedUser(null)
                        }
                      }}
                      disabled={!selectedUser?.id}
                    >
                      Supprimer
                    </Button>
                  </div>
                </form>
              ) : (
                <>
                  <div className="grid sm:grid-cols-2 gap-3 text-sm mb-5">
                    <InfoChip label="Lieu" value={selectedUser!.location} />
                    <InfoChip label="Date de naissance" value={formatDate(selectedUser!.birthDate)} />
                    <InfoChip label="Économies" value={formatMoney(selectedUser!.savingsCents)} />
                    <InfoChip label="Activité" value={`${selectedUser!.offersUsed} offres · ${selectedUser!.reviewsCount} avis`} />
                    <InfoChip label="Créé" value={formatDate(selectedUser!.created_at)} />
                    <InfoChip label="Mis à jour" value={formatDate(selectedUser!.updated_at)} />
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100 dark:border-dark-border">
                    {selectedUser!.id && (
                      <Button variant="outline" onClick={() => {
                        setUserEditMode(true)
                        setUserActionError('')
                      }}>
                        <span className="flex items-center gap-2"><Pencil size={14} /> Modifier</span>
                      </Button>
                    )}
                    {selectedUser!.id && (
                      <Button
                        variant="ghost"
                        className="bg-white text-pink border border-pink hover:bg-pink/10"
                        onClick={() => {
                          setPendingUserDelete(selectedUser)
                          setSelectedUser(null)
                        }}
                      >
                        <span className="flex items-center gap-2 text-pink">
                          <span className="w-8 h-8 rounded-full border border-pink/40 bg-pink/5 flex items-center justify-center">
                            <Trash2 size={16} />
                          </span>
                          Supprimer
                        </span>
                      </Button>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {false && pendingUserDelete && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
            <div className="w-full max-w-md bg-white dark:bg-dark-card rounded-2xl border border-gray-100 dark:border-dark-border shadow-2xl p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-pink-50 text-pink flex items-center justify-center dark:text-pink">
                  <AlertTriangle size={18} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Supprimer {pendingUserDelete!.prenom} {pendingUserDelete!.nom} ?
                  </h3>
                </div>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                Cette action est irréversible. Le compte utilisateur sera supprimé, mais les reviews resteront visibles avec le nom snapshot.
              </p>
              {userActionError && (
                <div className="flex items-start gap-2 text-sm text-red-600 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/40 rounded-xl px-3 py-2 mb-3">
                  <AlertTriangle size={16} className="mt-0.5" />
                  <span>{userActionError}</span>
                </div>
              )}
              <div className="flex items-center justify-end gap-3">
                <Button variant="ghost" onClick={() => setPendingUserDelete(null)} className="px-4">
                  Annuler
                </Button>
                <Button
                  variant="ghost"
                  className="bg-white text-pink border border-pink hover:bg-pink/10"
                  disabled={userActionState === 'loading' || !pendingUserDelete!.id}
                  onClick={() => pendingUserDelete!.id && void handleDeleteUser(pendingUserDelete!.id)}
                >
                  {userActionState === 'loading' ? (
                    <span className="flex items-center gap-2 text-pink"><Loader2 size={16} className="animate-spin" /> Suppression…</span>
                  ) : (
                    <span className="flex items-center gap-2 text-pink">
                      <span className="w-8 h-8 rounded-full border border-pink/40 bg-pink/5 flex items-center justify-center">
                        <Trash2 size={16} />
                      </span>
                      Supprimer
                    </span>
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}

        {previewOffer && (
          <div className="fixed inset-0 z-[55] flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
            <div className="w-full max-w-2xl bg-white dark:bg-dark-card rounded-2xl border border-gray-100 dark:border-dark-border shadow-2xl p-6">
              <div className="flex items-start justify-between gap-3 mb-4">
                <div>
                  <p className="text-xs uppercase tracking-wide text-gray-400">{previewOffer.categoryLabel}</p>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1 flex items-center gap-2">
                    <EmojiMedia value={previewOffer.emoji} alt={previewOffer.title} />
                    {previewOffer.title}
                  </h3>
                </div>
                <Button variant="ghost" onClick={() => setPreviewOffer(null)} className="px-3">
                  <X size={16} />
                </Button>
              </div>

              <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">{previewOffer.description}</p>

              <div className="flex flex-wrap gap-2 text-xs mb-4">
                <span className="rounded-full bg-gray-100 dark:bg-dark-alt px-3 py-1">ID: {previewOffer.id}</span>
                <span className="rounded-full bg-gray-100 dark:bg-dark-alt px-3 py-1">Note: {previewOffer.rating}/5</span>
                {previewOffer.distance && <span className="rounded-full bg-gray-100 dark:bg-dark-alt px-3 py-1">Distance: {previewOffer.distance}</span>}
                {previewOffer.price && <span className="rounded-full bg-gray-100 dark:bg-dark-alt px-3 py-1">Prix: {previewOffer.price}</span>}
                {previewOffer.badge && <span className="rounded-full bg-pink/10 text-pink px-3 py-1">{previewOffer.badge}</span>}
              </div>

              {previewOffer.address && (
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                  <span className="font-semibold text-gray-800 dark:text-gray-200">Adresse: </span>
                  {previewOffer.address}
                </p>
              )}

              {previewOffer.details && previewOffer.details.length > 0 && (
                <div className="mb-4">
                  <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">Détails</p>
                  <ul className="space-y-1.5 text-sm text-gray-600 dark:text-gray-300">
                    {previewOffer.details.map((detail, index) => (
                      <li key={`${previewOffer.id}-detail-${index}`}>• {detail}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100 dark:border-dark-border">
                <Button
                  variant="outline"
                  onClick={() => {
                    startEdit(previewOffer)
                    setPreviewOffer(null)
                  }}
                >
                  <span className="flex items-center gap-2"><Pencil size={14} /> Modifier</span>
                </Button>
                <Button
                  variant="ghost"
                  className="bg-white text-pink border border-pink hover:bg-pink/10"
                  onClick={() => {
                    setPendingDelete({ id: previewOffer.id, title: previewOffer.title })
                    setPreviewOffer(null)
                  }}
                >
                  <span className="flex items-center gap-2 text-pink">
                    <span className="w-8 h-8 rounded-full border border-pink/40 bg-pink/5 flex items-center justify-center">
                      <Trash2 size={16} />
                    </span>
                    Supprimer
                  </span>
                </Button>
              </div>
            </div>
          </div>
        )}

        {pendingDelete && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
            <div className="w-full max-w-md bg-white dark:bg-dark-card rounded-2xl border border-gray-100 dark:border-dark-border shadow-2xl p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-pink-50 text-pink flex items-center justify-center dark:text-pink">
                  <AlertTriangle size={18} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Supprimer l'offre de <span className="text-pink">{pendingDelete.title}?</span></h3>
                  
                </div>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">Cette action est irréversible. L'offre et toutes ses données associées seront supprimées.</p>
              {editError && (
                <div className="flex items-start gap-2 text-sm text-red-600 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/40 rounded-xl px-3 py-2 mb-3">
                  <AlertTriangle size={16} className="mt-0.5" />
                  <span>{editError}</span>
                </div>
              )}
              <div className="flex items-center justify-end gap-3">
                <Button variant="ghost" onClick={() => { setPendingDelete(null); setEditState('idle'); setEditError('') }} className="px-4">Annuler</Button>
                <Button
                  variant="ghost"
                  className="bg-white text-pink border border-pink hover:bg-pink/10"
                  disabled={editState === 'loading'}
                  onClick={() => handleDelete(pendingDelete.id)}
                >
                  {editState === 'loading' ? (
                    <span className="flex items-center gap-2 text-pink"><Loader2 size={16} className="animate-spin" /> Suppression…</span>
                  ) : (
                    <span className="flex items-center gap-2 text-pink">
                      <span className="w-8 h-8 rounded-full border border-pink/40 bg-pink/5 flex items-center justify-center">
                        <Trash2 size={16} />
                      </span>
                      Supprimer
                    </span>
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function FormField({ label, required, helper, children }: { label: string; required?: boolean; helper?: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-2 text-sm font-semibold text-gray-800 dark:text-gray-100">
      <span className="flex items-center gap-2">
        {label}
        {required && <span className="text-pink">*</span>}
        {helper && <span className="text-xs font-normal text-gray-500 dark:text-gray-400">{helper}</span>}
      </span>
      {children}
    </label>
  )
}

function AnalyticsCard({ title, value, helper, loading }: { title: string; value: string | number; helper?: string; loading?: boolean }) {
  return (
    <div className="bg-white dark:bg-dark-card border border-gray-100 dark:border-dark-border rounded-2xl p-5 shadow-sm">
      <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400 font-semibold">{title}</p>
      <div className="mt-2 flex items-baseline gap-2">
        <span className="text-3xl font-extrabold text-gray-900 dark:text-white">
          {loading ? <Loader2 size={22} className="animate-spin text-pink" /> : value}
        </span>
      </div>
      {helper && <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{helper}</p>}
    </div>
  )
}

function EmojiMedia({ value, alt, size = 'md' }: { value: string; alt?: string; size?: 'sm' | 'md' }) {
  const isImage = value?.startsWith('http')
  const box = size === 'sm' ? 'w-7 h-7' : 'w-8 h-8'
  if (isImage) {
    return <img src={value} alt={alt ?? ''} className={`${box} rounded-lg object-cover border border-gray-100 dark:border-dark-border`} />
  }
  return <span className={size === 'sm' ? 'text-lg' : 'text-xl'}>{value}</span>
}

function InfoChip({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-gray-50 dark:bg-dark-alt border border-gray-100 dark:border-dark-border px-3 py-2">
      <p className="text-[11px] uppercase tracking-wide text-gray-400">{label}</p>
      <p className="mt-1 text-sm font-medium text-gray-800 dark:text-gray-100">{value}</p>
    </div>
  )
}

function formatMoney(cents: number) {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(cents / 100)
}
