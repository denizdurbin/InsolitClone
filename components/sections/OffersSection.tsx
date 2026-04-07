'use client'

import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { MapPin, Loader2, Navigation, AlertCircle } from 'lucide-react'
import { OfferCard } from '@/components/ui/OfferCard'
import { Button } from '@/components/ui/Button'
import type { Offer, Category } from '@/lib/data'

type GeoStatus = 'idle' | 'loading' | 'success' | 'denied' | 'error'

function haversine(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const radius = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2
  return radius * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

function formatDistance(km: number): string {
  return km < 1 ? `${Math.round(km * 1000)} m` : `${km.toFixed(1)} km`
}

interface OffersSectionProps {
  offers: Offer[]
}

type Filter = 'all' | Category

const filters: { label: string; value: Filter }[] = [
  { label: 'Tout',         value: 'all' },
  { label: '🍕 Restaurants', value: 'restaurant' },
  { label: '🎯 Activités',   value: 'activite' },
  { label: '🎁 Cadeaux',     value: 'cadeau' },
  { label: '🏋️ Sport',       value: 'sport' },
  { label: '🎬 Cinéma',      value: 'cinema' },
]

export function OffersSection({ offers }: OffersSectionProps) {
  const [active, setActive] = useState<Filter>('all')
  const [userPosition, setUserPosition] = useState<[number, number] | null>(null)
  const [geoStatus, setGeoStatus] = useState<GeoStatus>('idle')

  const filtered = useMemo(
    () => (active === 'all' ? offers.slice(0, 8) : offers.filter((o) => o.category === active)),
    [offers, active]
  )

  function requestGeolocation() {
    if (!('geolocation' in navigator)) {
      setGeoStatus('error')
      return
    }
    setGeoStatus('loading')
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserPosition([position.coords.latitude, position.coords.longitude])
        setGeoStatus('success')
      },
      (error) => {
        setGeoStatus(error.code === error.PERMISSION_DENIED ? 'denied' : 'error')
      },
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }

  const displayOffers = useMemo(() => {
    if (!userPosition) {
      return filtered.map((offer) => ({ ...offer, distance: '' }))
    }
    return filtered.map((offer) => {
      if (!offer.coords) {
        return offer
      }
      const distanceKm = haversine(userPosition[0], userPosition[1], offer.coords[0], offer.coords[1])
      return { ...offer, distance: formatDistance(distanceKm) }
    })
  }, [filtered, userPosition])

  return (
    <section
      id="offres"
      aria-labelledby="offers-title"
      className="py-24 bg-white dark:bg-dark-alt"
    >
      <div className="max-w-6xl mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h2 id="offers-title" className="text-3xl md:text-4xl font-extrabold tracking-tight mb-6">
            <span className="text-pink">{offers.length}</span> offres disponibles
          </h2>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div
              role="tablist"
              aria-label="Filtrer les offres"
              className="flex flex-wrap gap-2"
            >
              {filters.map(({ label, value }) => (
                <button
                  key={value}
                  role="tab"
                  aria-selected={active === value}
                  onClick={() => setActive(value)}
                  className={`
                  px-4 py-2 rounded-full text-sm font-medium border transition-all duration-200
                  ${active === value
                    ? 'bg-pink text-white border-pink'
                    : 'bg-gray-100 dark:bg-dark-card text-gray-600 dark:text-gray-400 border-gray-200 dark:border-dark-border hover:border-pink hover:text-pink'
                  }
                `}
                >
                  {label}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={requestGeolocation}
              disabled={geoStatus === 'loading'}
              className={`
                flex items-center justify-center gap-2 px-4 py-2 rounded-full border text-sm font-semibold transition-all shrink-0
                ${
                  geoStatus === 'success'
                    ? 'bg-green/10 border-green text-green'
                    : geoStatus === 'denied' || geoStatus === 'error'
                      ? 'bg-red-50 dark:bg-red-900/20 border-red-300 text-red-500'
                      : 'bg-gray-100 dark:bg-dark-card border-gray-200 dark:border-dark-border text-gray-600 dark:text-gray-300 hover:border-pink hover:text-pink'
                }
              `}
            >
              {geoStatus === 'loading' ? (
                <Loader2 size={16} className="animate-spin" />
              ) : geoStatus === 'success' ? (
                <Navigation size={16} />
              ) : geoStatus === 'denied' ? (
                <AlertCircle size={16} />
              ) : (
                <MapPin size={16} />
              )}
              {geoStatus === 'loading'
                ? 'Localisation…'
                : geoStatus === 'success'
                  ? 'Position détectée'
                  : geoStatus === 'denied'
                    ? 'Réessayer'
                    : geoStatus === 'error'
                      ? 'Erreur GPS'
                      : 'Ma position'}
            </button>
          </div>
          {geoStatus === 'denied' && (
            <p className="text-xs text-red-400 mt-2">
              Autorise la localisation puis reclique sur « Ma position » pour afficher les distances.
            </p>
          )}
        </motion.div>

        {/* Grid */}
        <motion.div
          layout
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4"
          role="list"
        >
          {displayOffers.map((offer, i) => (
            <motion.div
              key={offer.id}
              role="listitem"
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: i * 0.05 }}
            >
              <OfferCard offer={offer} />
            </motion.div>
          ))}
        </motion.div>

        {/* CTA */}
        <div className="text-center mt-12">
          <Button href="/offres" size="lg">Voir toutes les offres</Button>
        </div>
      </div>
    </section>
  )
}
