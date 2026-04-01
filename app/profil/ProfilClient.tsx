'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Star, Heart, Award, MapPin, Settings, Trash2 } from 'lucide-react'
import type { Offer } from '@/lib/data'
import { OfferCard } from '@/components/ui/OfferCard'
import { Button } from '@/components/ui/Button'
import { createClient } from '@/utils/supabase/client'

const badges = [
  { emoji: '🏆', label: 'Early adopter', color: 'from-yellow-400 to-orange-400' },
  { emoji: '🍔', label: 'Gourmet', color: 'from-red-500 to-orange-500' },
  { emoji: '🎯', label: 'Aventurier', color: 'from-purple-500 to-pink-500' },
  { emoji: '⭐', label: 'Top avis', color: 'from-blue-400 to-teal-400' },
]

interface ProfilClientProps {
  recentPurchases: Offer[]
  profile: {
    prenom: string
    nom: string
    email: string
    location: string
    savingsCents: number
    offersUsed: number
    reviewsCount: number
  }
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
  const supabase = useMemo(() => createClient(), [])
  const [isDeletingAccount, setIsDeletingAccount] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  const initials = `${profile.prenom[0] ?? ''}${profile.nom[0] ?? ''}`.trim().toUpperCase() || (profile.email[0] ?? 'U').toUpperCase()
  const fullName = `${profile.prenom} ${profile.nom}`.trim() || 'Utilisateur'

  const handleDeleteAccount = async () => {
    setDeleteError(null)

    const confirmed = window.confirm('Supprimer votre compte ? Cette action est definitive et supprimera vos donnees de profil.')
    if (!confirmed) {
      return
    }

    setIsDeletingAccount(true)

    try {
      const {
        data: { user },
        error: getUserError,
      } = await supabase.auth.getUser()

      if (getUserError || !user) {
        throw new Error(getUserError?.message ?? 'Utilisateur non authentifie.')
      }

      const { error: deleteProfileError } = await supabase.from('users').delete().eq('id', user.id)

      if (deleteProfileError) {
        throw new Error(deleteProfileError.message)
      }

      await supabase.auth.signOut({ scope: 'local' })
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
                  <h1 className="text-2xl font-extrabold tracking-tight text-gray-900 dark:text-white">{fullName}</h1>
                  <div className="flex items-center gap-2 mt-1 text-sm text-gray-500 dark:text-gray-400">
                    <MapPin size={13} aria-hidden="true" />
                    <span>{profile.location}</span>
                  </div>
                </div>
                <div className="flex flex-col items-stretch gap-2 w-full sm:w-auto">
                  <Button variant="outline" size="sm" className="flex-shrink-0" disabled={isDeletingAccount}>
                    <Settings size={14} aria-hidden="true" />
                    Modifier le profil
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDeleteAccount}
                    disabled={isDeletingAccount}
                    className="flex-shrink-0 border-red-200 text-red-600 hover:border-red-500 hover:text-red-700 dark:border-red-900/60 dark:text-red-400 dark:hover:text-red-300"
                  >
                    <Trash2 size={14} aria-hidden="true" />
                    {isDeletingAccount ? 'Suppression...' : 'Supprimer le compte'}
                  </Button>
                  {deleteError && <p className="text-xs text-red-600 dark:text-red-400">{deleteError}</p>}
                </div>
              </div>

              <div className="flex flex-wrap gap-6 mt-5 pt-5 border-t border-gray-100 dark:border-dark-border">
                {[
                  { label: 'Economies', value: formatMoney(profile.savingsCents) },
                  { label: 'Offres utilisees', value: String(profile.offersUsed) },
                  { label: 'Avis laisses', value: String(profile.reviewsCount) },
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
