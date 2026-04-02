'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Star, Heart, Award, MapPin, Settings, Trash2, Check, X } from 'lucide-react'
import type { Offer } from '@/lib/data'
import { OfferCard } from '@/components/ui/OfferCard'
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/lib/auth'

const badges = [
  { emoji: '🏆', label: 'Early adopter', color: 'from-yellow-400 to-orange-400' },
  { emoji: '🍔', label: 'Gourmet', color: 'from-red-500 to-orange-500' },
  { emoji: '🎯', label: 'Aventurier', color: 'from-purple-500 to-pink-500' },
  { emoji: '⭐', label: 'Top avis', color: 'from-blue-400 to-teal-400' },
]

interface ProfileData {
  prenom: string
  nom: string
  email: string
  location: string
  savingsCents: number
  offersUsed: number
  reviewsCount: number
}

interface ProfilClientProps {
  recentPurchases: Offer[]
  profile: ProfileData
}

function formatMoney(cents: number) {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(cents / 100)
}

export default function ProfilClient({ recentPurchases, profile }: ProfilClientProps) {
  const router = useRouter()
  const { setAuthenticatedUser } = useAuth()
  const [isDeletingAccount, setIsDeletingAccount] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [isEditingProfile, setIsEditingProfile] = useState(false)
  const [isSavingProfile, setIsSavingProfile] = useState(false)
  const [profileError, setProfileError] = useState<string | null>(null)
  const [cityOptions, setCityOptions] = useState<string[]>([])
  const [displayProfile, setDisplayProfile] = useState<ProfileData>(profile)
  const [editableProfile, setEditableProfile] = useState(() => ({
    prenom: profile.prenom,
    nom: profile.nom,
    location: profile.location,
  }))

  useEffect(() => {
    if (!isEditingProfile) {
      setCityOptions([])
      return
    }

    const query = editableProfile.location.trim()

    if (query.length < 2) {
      setCityOptions([])
      return
    }

    const controller = new AbortController()
    const timeout = window.setTimeout(async () => {
      try {
        const response = await fetch(
          `https://geo.api.gouv.fr/communes?nom=${encodeURIComponent(query)}&fields=nom,codeDepartement&boost=population&limit=12`,
          {
            signal: controller.signal,
          }
        )

        if (!response.ok) {
          setCityOptions([])
          return
        }

        const data = (await response.json()) as Array<{ nom: string; codeDepartement?: string }>
        const options = Array.from(
          new Set(
            data.map((city) =>
              city.codeDepartement ? `${city.nom}, France (${city.codeDepartement})` : `${city.nom}, France`
            )
          )
        )

        setCityOptions(options)
      } catch {
        if (!controller.signal.aborted) {
          setCityOptions([])
        }
      }
    }, 250)

    return () => {
      controller.abort()
      window.clearTimeout(timeout)
    }
  }, [editableProfile.location, isEditingProfile])

  const initials = `${displayProfile.prenom[0] ?? ''}${displayProfile.nom[0] ?? ''}`.trim().toUpperCase() || (displayProfile.email[0] ?? 'U').toUpperCase()
  const fullName = `${displayProfile.prenom} ${displayProfile.nom}`.trim() || 'Utilisateur'

  const setEditableField = (field: 'prenom' | 'nom' | 'location', value: string) => {
    setEditableProfile((prev) => ({ ...prev, [field]: value }))
    setProfileError(null)
  }

  const handleStartProfileEdition = () => {
    setEditableProfile({
      prenom: displayProfile.prenom,
      nom: displayProfile.nom,
      location: displayProfile.location,
    })
    setProfileError(null)
    setIsEditingProfile(true)
  }

  const handleCancelProfileEdition = () => {
    setEditableProfile({
      prenom: displayProfile.prenom,
      nom: displayProfile.nom,
      location: displayProfile.location,
    })
    setProfileError(null)
    setCityOptions([])
    setIsEditingProfile(false)
  }

  const handleConfirmProfileEdition = async () => {
    const prenom = editableProfile.prenom.trim()
    const nom = editableProfile.nom.trim()
    const location = editableProfile.location.trim()

    if (!prenom || !nom || !location) {
      setProfileError('Le prenom, le nom et l adresse sont obligatoires.')
      return
    }

    setIsSavingProfile(true)
    setProfileError(null)

    try {
      const response = await fetch('/api/auth/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prenom, nom, location }),
      })

      const payload = (await response.json().catch(() => null)) as
        | {
            message?: string
            user?: {
              id: string
              prenom: string
              nom: string
              email: string
              location: string
              savingsCents: number
              offersUsed: number
              reviewsCount: number
            }
          }
        | null

      if (!response.ok || !payload?.user) {
        throw new Error(payload?.message ?? 'Impossible de mettre a jour le profil pour le moment.')
      }

      const updatedProfile: ProfileData = {
        prenom: payload.user.prenom,
        nom: payload.user.nom,
        email: payload.user.email,
        location: payload.user.location,
        savingsCents: payload.user.savingsCents,
        offersUsed: payload.user.offersUsed,
        reviewsCount: payload.user.reviewsCount,
      }

      setDisplayProfile(updatedProfile)
      setEditableProfile({
        prenom: payload.user.prenom,
        nom: payload.user.nom,
        location: payload.user.location,
      })
      setAuthenticatedUser(payload.user)
      setCityOptions([])
      setIsEditingProfile(false)
      router.refresh()
    } catch (error) {
      setProfileError(error instanceof Error ? error.message : 'Impossible de mettre a jour le profil pour le moment.')
    } finally {
      setIsSavingProfile(false)
    }
  }

  const handleDeleteAccount = async () => {
    setDeleteError(null)

    const confirmed = window.confirm('Supprimer votre compte ? Cette action est definitive et supprimera vos donnees de profil.')
    if (!confirmed) {
      return
    }

    setIsDeletingAccount(true)

    try {
      const response = await fetch('/api/auth/delete-account', {
        method: 'POST',
      })

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { message?: string } | null
        throw new Error(payload?.message ?? 'Impossible de supprimer le compte pour le moment.')
      }

      router.replace('/')
      router.refresh()
    } catch (error) {
      setDeleteError(error instanceof Error ? error.message : 'Impossible de supprimer le compte pour le moment.')
      setIsDeletingAccount(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-bg">
      <div className="max-w-5xl mx-auto px-6 py-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-dark-card border border-gray-100 dark:border-dark-border rounded-2xl p-6 md:p-8 mb-6"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center text-white text-2xl font-black flex-shrink-0 bg-gradient-to-br from-pink-500 to-orange-400"
              aria-hidden="true"
            >
              {initials}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  {isEditingProfile ? (
                    <div className="space-y-3 min-w-[260px] sm:min-w-[320px]">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <label className="text-xs font-semibold text-gray-600 dark:text-gray-300">
                          Prenom
                          <input
                            type="text"
                            value={editableProfile.prenom}
                            onChange={(event) => setEditableField('prenom', event.target.value)}
                            className="mt-1 w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-dark-alt text-sm text-gray-900 dark:text-white outline-none focus:border-pink focus:ring-1 focus:ring-pink"
                          />
                        </label>
                        <label className="text-xs font-semibold text-gray-600 dark:text-gray-300">
                          Nom
                          <input
                            type="text"
                            value={editableProfile.nom}
                            onChange={(event) => setEditableField('nom', event.target.value)}
                            className="mt-1 w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-dark-alt text-sm text-gray-900 dark:text-white outline-none focus:border-pink focus:ring-1 focus:ring-pink"
                          />
                        </label>
                      </div>
                      <label className="text-xs font-semibold text-gray-600 dark:text-gray-300 block">
                        Adresse (ville)
                        <div className="relative mt-1">
                          <MapPin size={13} aria-hidden="true" className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                          <input
                            type="text"
                            value={editableProfile.location}
                            list="profile-france-cities-list"
                            autoComplete="address-level2"
                            onChange={(event) => setEditableField('location', event.target.value)}
                            className="w-full pl-9 pr-3 py-2 rounded-xl border border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-dark-alt text-sm text-gray-900 dark:text-white outline-none focus:border-pink focus:ring-1 focus:ring-pink"
                          />
                        </div>
                      </label>
                      <datalist id="profile-france-cities-list">
                        {cityOptions.map((city) => (
                          <option key={city} value={city} />
                        ))}
                      </datalist>
                    </div>
                  ) : (
                    <>
                      <h1 className="text-2xl font-extrabold tracking-tight text-gray-900 dark:text-white">{fullName}</h1>
                      <div className="flex items-center gap-2 mt-1 text-sm text-gray-500 dark:text-gray-400">
                        <MapPin size={13} aria-hidden="true" />
                        <span>{displayProfile.location}</span>
                      </div>
                    </>
                  )}
                </div>
                <div className="flex flex-col items-stretch gap-2 w-full sm:w-auto">
                  {isEditingProfile ? (
                    <div className="flex flex-col sm:flex-row gap-2">
                      <Button
                        variant="primary"
                        size="sm"
                        className="flex-shrink-0 justify-center"
                        onClick={handleConfirmProfileEdition}
                        disabled={isSavingProfile || isDeletingAccount}
                      >
                        <Check size={14} aria-hidden="true" />
                        {isSavingProfile ? 'Enregistrement...' : 'Confirmer'}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-shrink-0 justify-center"
                        onClick={handleCancelProfileEdition}
                        disabled={isSavingProfile || isDeletingAccount}
                      >
                        <X size={14} aria-hidden="true" />
                        Annuler
                      </Button>
                    </div>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-shrink-0"
                      disabled={isDeletingAccount}
                      onClick={handleStartProfileEdition}
                    >
                      <Settings size={14} aria-hidden="true" />
                      Modifier
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDeleteAccount}
                    disabled={isDeletingAccount || isSavingProfile}
                    className="flex-shrink-0 border-red-200 text-red-600 hover:border-red-500 hover:text-red-700 dark:border-red-900/60 dark:text-red-400 dark:hover:text-red-300"
                  >
                    <Trash2 size={14} aria-hidden="true" />
                    {isDeletingAccount ? 'Suppression...' : 'Supprimer le compte'}
                  </Button>
                  {profileError && <p className="text-xs text-red-600 dark:text-red-400">{profileError}</p>}
                  {deleteError && <p className="text-xs text-red-600 dark:text-red-400">{deleteError}</p>}
                </div>
              </div>

              <div className="flex flex-wrap gap-6 mt-5 pt-5 border-t border-gray-100 dark:border-dark-border">
                {[
                  { label: 'Economies', value: formatMoney(displayProfile.savingsCents) },
                  { label: 'Offres utilisees', value: String(displayProfile.offersUsed) },
                  { label: 'Avis laisses', value: String(displayProfile.reviewsCount) },
                ].map(({ label, value }) => (
                  <div key={label}>
                    <p className="text-xl font-black text-gray-900 dark:text-white">{value}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        <div className="grid md:grid-cols-[1fr_320px] gap-6">
          <div className="space-y-6">
            <motion.section
              aria-labelledby="purchases-title"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white dark:bg-dark-card border border-gray-100 dark:border-dark-border rounded-2xl p-6"
            >
              <div className="flex items-center justify-between mb-5">
                <h2 id="purchases-title" className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <Heart size={16} className="text-pink" aria-hidden="true" />
                  Mes achats favoris
                </h2>
                <a href="/offres" className="text-xs text-pink hover:underline font-medium">
                  Voir tout
                </a>
              </div>

              <div className="grid grid-cols-2 gap-3" role="list">
                {recentPurchases.map((offer) => (
                  <div key={offer.id} role="listitem">
                    <OfferCard offer={offer} size="sm" />
                  </div>
                ))}
              </div>
            </motion.section>

            <motion.section
              aria-labelledby="reviews-title"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white dark:bg-dark-card border border-gray-100 dark:border-dark-border rounded-2xl p-6"
            >
              <h2 id="reviews-title" className="font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-5">
                <Star size={16} className="text-yellow" aria-hidden="true" />
                Mes avis
              </h2>

              <ul className="space-y-4">
                {[
                  { title: 'KFC Villiers-sur-Marne', rating: 5, text: 'Super offre, le burger était délicieux !' },
                  { title: 'Escape Game Paris', rating: 4, text: 'Très bonne expérience, je recommande.' },
                ].map(({ title, rating, text }) => (
                  <li key={title} className="pb-4 border-b border-gray-50 dark:border-dark-border last:border-0 last:pb-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{title}</p>
                      <div className="flex gap-0.5" aria-label={`${rating} étoiles`}>
                        {Array.from({ length: 5 }).map((_, index) => (
                          <Star
                            key={index}
                            size={11}
                            className={index < rating ? 'fill-yellow text-yellow' : 'fill-gray-200 text-gray-200'}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{text}</p>
                  </li>
                ))}
              </ul>
            </motion.section>
          </div>

          <motion.section
            aria-labelledby="badges-title"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="bg-white dark:bg-dark-card border border-gray-100 dark:border-dark-border rounded-2xl p-6 h-fit"
          >
            <h2 id="badges-title" className="font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-5">
              <Award size={16} className="text-pink" aria-hidden="true" />
              Mes badges
            </h2>

            <div className="grid grid-cols-2 gap-3" role="list">
              {badges.map((badge) => (
                <div
                  key={badge.label}
                  role="listitem"
                  className="flex flex-col items-center gap-2 p-4 rounded-xl bg-gray-50 dark:bg-dark-alt border border-gray-100 dark:border-dark-border hover:border-pink/30 transition-colors"
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xl bg-gradient-to-br ${badge.color}`} aria-hidden="true">
                    {badge.emoji}
                  </div>
                  <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 text-center">{badge.label}</p>
                </div>
              ))}
            </div>

            <div className="mt-5 pt-5 border-t border-gray-100 dark:border-dark-border">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 font-medium">Prochain badge — Explorer</p>
              <div className="w-full h-2 bg-gray-100 dark:bg-dark-alt rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-pink to-purple rounded-full"
                  style={{ width: '65%' }}
                  role="progressbar"
                  aria-valuenow={65}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label="65% vers le badge Explorer"
                />
              </div>
              <p className="text-xs text-gray-400 mt-1">3 offres restantes</p>
            </div>
          </motion.section>
        </div>
      </div>
    </div>
  )
}
