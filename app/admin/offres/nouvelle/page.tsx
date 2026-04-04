'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AlertTriangle, ArrowLeft, Loader2, MapPin, Navigation, PlusCircle, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/lib/auth'
import { CATEGORIES, type Category } from '@/lib/data'

interface GeocodeResponse {
  lat: number
  lng: number
  displayName?: string
}

type GuardState = 'idle' | 'checking' | 'denied' | 'ok'
type FormState = 'idle' | 'loading' | 'success' | 'error'

type OfferFormState = {
  title: string
  description: string
  category: Category
  emoji: string
  rating: number
  distance: string
  price: string
  badge: string
  address: string
  details: string
  latitude: string
  longitude: string
}

const categoryLabels: Record<Category, string> = {
  restaurant: 'Restaurant',
  activite: 'Activité',
  cadeau: 'Cadeau',
  sport: 'Sport',
  cinema: 'Cinéma',
}

const initialForm: OfferFormState = {
  title: '',
  description: '',
  category: 'restaurant',
  emoji: '✨',
  rating: 4,
  distance: '—',
  price: '',
  badge: '',
  address: '',
  details: '',
  latitude: '',
  longitude: '',
}

export default function NewAdminOfferPage() {
  const router = useRouter()
  const { user, isAuthenticated, loading } = useAuth()

  const [guard, setGuard] = useState<GuardState>('idle')
  const [formState, setFormState] = useState<FormState>('idle')
  const [geocodeState, setGeocodeState] = useState<'idle' | 'loading' | 'error'>('idle')
  const [formError, setFormError] = useState('')
  const [createdId, setCreatedId] = useState('')
  const [geocodeError, setGeocodeError] = useState('')
  const [form, setForm] = useState<OfferFormState>(initialForm)

  const disabled = formState === 'loading' || guard !== 'ok'
  const canGeocode = guard === 'ok' && !!form.address.trim() && geocodeState !== 'loading'

  const heroSubtitle = useMemo(() => {
    if (guard === 'denied') return 'Accès refusé'
    if (guard === 'ok') return 'Nouvelle offre'
    return 'Vérification en cours'
  }, [guard])

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

  async function geocodeAddress() {
    if (!user?.email || !form.address.trim()) return

    setGeocodeState('loading')
    setGeocodeError('')

    const response = await fetch('/api/admin/geocode', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-email': user.email,
      },
      body: JSON.stringify({ address: form.address.trim() }),
    })

    if (!response.ok) {
      const data = await response.json().catch(() => ({}))
      setGeocodeError(data?.error || 'Impossible de géocoder cette adresse')
      setGeocodeState('error')
      return
    }

    const data: GeocodeResponse = await response.json()
    setForm((prev) => ({
      ...prev,
      latitude: String(data.lat),
      longitude: String(data.lng),
    }))
    setGeocodeState('idle')
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!user?.email) return

    setFormState('loading')
    setFormError('')
    setCreatedId('')

    const latitude = form.latitude.trim() ? Number(form.latitude) : undefined
    const longitude = form.longitude.trim() ? Number(form.longitude) : undefined

    if ((latitude !== undefined && !Number.isFinite(latitude)) || (longitude !== undefined && !Number.isFinite(longitude))) {
      setFormError('Latitude/Longitude invalides')
      setFormState('error')
      return
    }

    const payload = {
      title: form.title,
      description: form.description,
      category: form.category,
      emoji: form.emoji,
      rating: Number(form.rating),
      distance: form.distance,
      price: form.price,
      badge: form.badge,
      address: form.address,
      details: form.details,
      latitude,
      longitude,
    }

    const response = await fetch('/api/admin/offers', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-email': user.email,
      },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      const data = await response.json().catch(() => ({}))
      setFormError(data?.error || 'Impossible de créer l\'offre')
      setFormState('error')
      return
    }

    const data = await response.json()
    setFormState('success')
    setCreatedId(data?.id ?? '')

    setTimeout(() => {
      router.push('/admin')
    }, 700)
  }

  function renderGuard() {
    if (guard === 'ok') return null

    if (guard === 'checking') {
      return (
        <div className="mt-6 flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300">
          <Loader2 size={16} className="animate-spin" />
          Vérification des droits administrateur...
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
        <div className="max-w-5xl mx-auto px-6 py-10">
          <Link href="/admin" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-pink transition-colors">
            <ArrowLeft size={16} /> Retour au dashboard
          </Link>
          <div className="mt-4 flex items-center gap-3 text-pink">
            <ShieldCheck size={18} />
            <span className="uppercase tracking-wide text-xs font-semibold">Admin</span>
          </div>
          <div className="mt-3 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">Créer une offre</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">{heroSubtitle}</p>
          </div>
          {renderGuard()}
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-10">
        {guard === 'ok' && (
          <section className="bg-white dark:bg-dark-card border border-gray-100 dark:border-dark-border rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-full bg-pink/10 text-pink flex items-center justify-center">
                <PlusCircle size={18} />
              </div>
              <div>
                <h2 className="text-xl font-bold">Nouvelle offre</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">Formulaire dédié, propre, avec aide géocodage.</p>
              </div>
            </div>

            <form className="space-y-5" onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField label="Titre" required>
                  <input
                    required
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    className="w-full rounded-xl border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-alt px-4 py-3 text-sm focus:border-pink outline-none"
                    placeholder="Brunch Illimité"
                  />
                </FormField>

                <FormField label="Catégorie" required>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value as Category })}
                    className="w-full rounded-xl border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-alt px-4 py-3 text-sm focus:border-pink outline-none"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>{categoryLabels[cat]}</option>
                    ))}
                  </select>
                </FormField>

                <FormField label="Emoji / Image" helper="Emoji ou URL d'image">
                  <input
                    value={form.emoji}
                    onChange={(e) => setForm({ ...form, emoji: e.target.value })}
                    className="w-full rounded-xl border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-alt px-4 py-3 text-sm focus:border-pink outline-none"
                    placeholder="https://url.com/image.png"
                  />
                </FormField>

                <FormField label="Distance" helper="Texte libre (ex: 1.2 km)">
                  <input
                    value={form.distance}
                    onChange={(e) => setForm({ ...form, distance: e.target.value })}
                    className="w-full rounded-xl border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-alt px-4 py-3 text-sm focus:border-pink outline-none"
                    placeholder="—"
                  />
                </FormField>

                <div className="md:col-span-2">
                  <FormField label="Adresse" helper="Utilise le bouton pour convertir en latitude/longitude">
                    <div className="flex flex-col md:flex-row gap-2">
                      <input
                        value={form.address}
                        onChange={(e) => setForm({ ...form, address: e.target.value })}
                        className="w-full rounded-xl border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-alt px-4 py-3 text-sm focus:border-pink outline-none"
                        placeholder="205 Rue Saint-Martin, 75003 Paris"
                      />
                      <Button type="button" variant="outline" onClick={geocodeAddress} disabled={!canGeocode} className="md:min-w-[210px]">
                        {geocodeState === 'loading' ? (
                          <span className="flex items-center gap-2"><Loader2 size={16} className="animate-spin" /> Géocodage...</span>
                        ) : (
                          <span className="flex items-center gap-2"><Navigation size={16} /> Convertir l&apos;adresse</span>
                        )}
                      </Button>
                    </div>
                  </FormField>
                </div>

                <FormField label="Latitude">
                  <input
                    value={form.latitude}
                    onChange={(e) => setForm({ ...form, latitude: e.target.value })}
                    className="w-full rounded-xl border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-alt px-4 py-3 text-sm focus:border-pink outline-none"
                    placeholder="48.8656"
                  />
                </FormField>

                <FormField label="Longitude">
                  <input
                    value={form.longitude}
                    onChange={(e) => setForm({ ...form, longitude: e.target.value })}
                    className="w-full rounded-xl border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-alt px-4 py-3 text-sm focus:border-pink outline-none"
                    placeholder="2.3522"
                  />
                </FormField>

                <FormField label="Prix" helper="Ex: 19€ ou -20%">
                  <input
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    className="w-full rounded-xl border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-alt px-4 py-3 text-sm focus:border-pink outline-none"
                    placeholder="20%"
                  />
                </FormField>

                <FormField label="Badge" helper="Courte pastille (ex: Promo)">
                  <input
                    value={form.badge}
                    onChange={(e) => setForm({ ...form, badge: e.target.value })}
                    className="w-full rounded-xl border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-alt px-4 py-3 text-sm focus:border-pink outline-none"
                    placeholder="Promo"
                  />
                </FormField>

                <FormField label="Note" helper="0 à 5">
                  <input
                    type="number"
                    min={0}
                    max={5}
                    step={0.1}
                    value={form.rating}
                    onChange={(e) => setForm({ ...form, rating: Number(e.target.value) })}
                    className="w-full rounded-xl border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-alt px-4 py-3 text-sm focus:border-pink outline-none"
                  />
                </FormField>

                <div className="md:col-span-2">
                  <FormField label="Description" required>
                    <textarea
                      required
                      value={form.description}
                      onChange={(e) => setForm({ ...form, description: e.target.value })}
                      className="w-full rounded-xl border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-alt px-4 py-3 text-sm focus:border-pink outline-none min-h-[96px]"
                      placeholder="Décris clairement l'offre"
                    />
                  </FormField>
                </div>

                <div className="md:col-span-2">
                  <FormField label="Détails" helper="Un point par ligne (optionnel)">
                    <textarea
                      value={form.details}
                      onChange={(e) => setForm({ ...form, details: e.target.value })}
                      className="w-full rounded-xl border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-alt px-4 py-3 text-sm focus:border-pink outline-none min-h-[96px]"
                      placeholder={`Exemple:\n- Valable en semaine\n- Sur réservation`}
                    />
                  </FormField>
                </div>
              </div>

              {geocodeError && (
                <div className="flex items-start gap-2 text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2">
                  <MapPin size={16} className="mt-0.5" />
                  <span>{geocodeError}</span>
                </div>
              )}

              {formError && (
                <div className="flex items-start gap-2 text-sm text-red-600 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/40 rounded-xl px-3 py-2">
                  <AlertTriangle size={16} className="mt-0.5" />
                  <span>{formError}</span>
                </div>
              )}

              {formState === 'success' && (
                <div className="flex items-start gap-2 text-sm text-green-700 bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-900/40 rounded-xl px-3 py-2">
                  <ShieldCheck size={16} className="mt-0.5" />
                  <span>Offre créée avec succès {createdId ? `(id: ${createdId})` : ''}. Redirection...</span>
                </div>
              )}

              <div className="flex items-center justify-between flex-wrap gap-3">
                <p className="text-xs text-gray-500 dark:text-gray-400">Le gradient est appliqué automatiquement selon la catégorie.</p>
                <Button type="submit" disabled={disabled} className="disabled:opacity-60" variant="primary">
                  {formState === 'loading' ? (
                    <span className="flex items-center gap-2"><Loader2 className="animate-spin" size={16} /> Création...</span>
                  ) : (
                    <span className="flex items-center gap-2"><PlusCircle size={16} /> Créer l&apos;offre</span>
                  )}
                </Button>
              </div>
            </form>
          </section>
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
