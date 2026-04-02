'use client'

import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Search, MapPin, SlidersHorizontal, Loader2, Navigation, AlertCircle } from 'lucide-react'
import { OfferCard } from '@/components/ui/OfferCard'
import type { Offer, Category } from '@/lib/data'

type Filter = 'all' | Category

const filters: { label: string; value: Filter }[] = [
  { label: 'Tout', value: 'all' },
  { label: '🍕 Restaurants', value: 'restaurant' },
  { label: '🎯 Activités', value: 'activite' },
  { label: '🎁 Cadeaux', value: 'cadeau' },
  { label: '🏋️ Sport', value: 'sport' },
  { label: '🎬 Cinéma', value: 'cinema' },
]

interface OffresClientProps {
  offers: Offer[]
  initialFilter: Filter
  initialSearch: string
  initialLocation: string
}

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

function normalizeText(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}

export function OffresClient({ offers, initialFilter, initialSearch, initialLocation }: OffresClientProps) {
  const [active, setActive] = useState<Filter>(initialFilter)
  const [search, setSearch] = useState(initialSearch)
  const [userPosition, setUserPosition] = useState<[number, number] | null>(null)
  const [geoStatus, setGeoStatus] = useState<GeoStatus>('idle')

  useEffect(() => {
    setActive(initialFilter)
  }, [initialFilter])

  useEffect(() => {
    setSearch(initialSearch)
  }, [initialSearch])

  const normalizedLocation = useMemo(() => normalizeText(initialLocation), [initialLocation])

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

  const filtered = useMemo(() => {
    return offers.filter((offer) => {
      const matchCategory = active === 'all' || offer.category === active
      const query = normalizeText(search)
      const matchSearch =
        query.length === 0 ||
        normalizeText(offer.title).includes(query) ||
        normalizeText(offer.description).includes(query)

      const locationSource = `${offer.address ?? ''} ${offer.title}`
      const matchLocation =
        normalizedLocation.length === 0 || normalizeText(locationSource).includes(normalizedLocation)

      return matchCategory && matchSearch && matchLocation
    })
  }, [offers, active, search, normalizedLocation])

  const offersWithComputedDistance = useMemo(() => {
    if (!userPosition) {
      return filtered
    }

    return filtered.map((offer) => {
      if (!offer.coords) {
        return offer
      }

      const distanceKm = haversine(userPosition[0], userPosition[1], offer.coords[0], offer.coords[1])
      return { ...offer, distance: formatDistance(distanceKm) }
    })
  }, [filtered, userPosition])

  const visibleOffers = useMemo(() => {
    if (!userPosition) {
      return offersWithComputedDistance
    }

    return [...offersWithComputedDistance].sort((left, right) => {
      const leftDistance = left.coords
        ? haversine(userPosition[0], userPosition[1], left.coords[0], left.coords[1])
        : Number.MAX_SAFE_INTEGER
      const rightDistance = right.coords
        ? haversine(userPosition[0], userPosition[1], right.coords[0], right.coords[1])
        : Number.MAX_SAFE_INTEGER
      return leftDistance - rightDistance
    })
  }, [offersWithComputedDistance, userPosition])

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-bg">
      <div className="bg-white dark:bg-dark-alt border-b border-gray-100 dark:border-dark-border py-10">
        <div className="max-w-6xl mx-auto px-6">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-2">
            <span className="text-pink">{visibleOffers.length}</span> offres disponibles près de toi
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-7">
          </p>
          {normalizedLocation.length > 0 && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
              Zone: <span className="font-semibold text-gray-700 dark:text-gray-200">{initialLocation}</span>
            </p>
          )}

          <form
            role="search"
            aria-label="Rechercher des offres"
            onSubmit={(event) => event.preventDefault()}
            className="flex flex-col sm:flex-row gap-2 max-w-2xl"
          >
            <div className="flex items-center gap-2 flex-1 bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border rounded-xl px-4 py-3 focus-within:border-pink transition-colors">
              <Search size={16} className="text-gray-400 flex-shrink-0" aria-hidden="true" />
              <label htmlFor="offerSearch" className="sr-only">
                Rechercher une offre
              </label>
              <input
                id="offerSearch"
                type="search"
                placeholder="Rechercher une offre…"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="flex-1 bg-transparent border-none outline-none text-sm text-gray-800 dark:text-gray-100 placeholder:text-gray-400"
              />
            </div>
            <button
              type="button"
              onClick={requestGeolocation}
              disabled={geoStatus === 'loading'}
              className={`
                flex items-center gap-2 px-4 py-3 rounded-xl border text-sm font-semibold transition-all
                ${
                  geoStatus === 'success'
                    ? 'bg-green/10 border-green text-green'
                    : geoStatus === 'denied' || geoStatus === 'error'
                      ? 'bg-red-50 dark:bg-red-900/20 border-red-300 text-red-500'
                      : 'bg-white dark:bg-dark-card border-gray-200 dark:border-dark-border text-gray-600 dark:text-gray-300 hover:border-pink hover:text-pink'
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
            <button
              type="button"
              aria-label="Filtres avancés"
              className="flex items-center gap-2 bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border rounded-xl px-4 py-3 text-sm text-gray-600 dark:text-gray-300 hover:border-pink hover:text-pink transition-colors"
            >
              <SlidersHorizontal size={16} />
              Filtres
            </button>
          </form>

          {geoStatus === 'denied' && (
            <p className="text-xs text-red-400 mt-2">
              Autorise la localisation dans les réglages du site puis reclique sur "Ma position".
            </p>
          )}
          {geoStatus === 'success' && (
            <p className="text-xs text-green mt-2">Offres triées par proximité depuis ta position.</p>
          )}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        <div role="tablist" aria-label="Filtrer par catégorie" className="flex flex-wrap gap-2 mb-8">
          {filters.map(({ label, value }) => (
            <button
              key={value}
              role="tab"
              aria-selected={active === value}
              onClick={() => setActive(value)}
              className={`px-4 py-2 rounded-full text-sm font-medium border transition-all duration-200
                ${
                  active === value
                    ? 'bg-pink text-white border-pink'
                    : 'bg-white dark:bg-dark-card text-gray-600 dark:text-gray-400 border-gray-200 dark:border-dark-border hover:border-pink hover:text-pink'
                }`}
            >
              {label}
            </button>
          ))}
        </div>

        {visibleOffers.length > 0 ? (
          <motion.div
            layout
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4"
            role="list"
            aria-live="polite"
            aria-label={`${visibleOffers.length} offres affichées`}
          >
            {visibleOffers.map((offer, index) => (
              <motion.div
                key={offer.id}
                role="listitem"
                layout
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.04 }}
              >
                <OfferCard offer={offer} />
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <div className="text-center py-24 text-gray-400" role="status" aria-live="polite">
            <p className="text-5xl mb-4">🔍</p>
            <p className="text-lg font-semibold text-gray-600 dark:text-gray-300">Aucune offre trouvée</p>
            <p className="text-sm mt-1">Essaie une autre recherche ou catégorie</p>
          </div>
        )}
      </div>
    </div>
  )
}
