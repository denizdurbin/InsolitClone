'use client'

import { motion } from 'framer-motion'
import { Star, Heart, Award, MapPin, Settings } from 'lucide-react'
import type { Offer } from '@/lib/data'
import { OfferCard } from '@/components/ui/OfferCard'
import { Button } from '@/components/ui/Button'

const badges = [
  { emoji: '🏆', label: 'Early adopter', color: 'from-yellow-400 to-orange-400' },
  { emoji: '🍔', label: 'Gourmet', color: 'from-red-500 to-orange-500' },
  { emoji: '🎯', label: 'Aventurier', color: 'from-purple-500 to-pink-500' },
  { emoji: '⭐', label: 'Top avis', color: 'from-blue-400 to-teal-400' },
]

interface ProfilClientProps {
  recentPurchases: Offer[]
}

export default function ProfilClient({ recentPurchases }: ProfilClientProps) {
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
              SM
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-extrabold tracking-tight text-gray-900 dark:text-white">Sophia M.</h1>
                  <div className="flex items-center gap-2 mt-1 text-sm text-gray-500 dark:text-gray-400">
                    <MapPin size={13} aria-hidden="true" />
                    <span>Argenteuil, Île-de-France</span>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="flex-shrink-0">
                  <Settings size={14} aria-hidden="true" />
                  Modifier le profil
                </Button>
              </div>

              <div className="flex flex-wrap gap-6 mt-5 pt-5 border-t border-gray-100 dark:border-dark-border">
                {[
                  { label: 'Économies', value: '47 €28' },
                  { label: 'Offres utilisées', value: '12' },
                  { label: 'Avis laissés', value: '8' },
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
