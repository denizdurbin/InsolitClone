'use client'

import { useState, useEffect, useMemo } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { MapPin, Search, Navigation, Loader2, AlertCircle } from 'lucide-react'
import type { Offer } from '@/lib/data'
import 'leaflet/dist/leaflet.css'

const MapComponent = dynamic(() => import('@/components/ui/MapComponent'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-dark-card rounded-2xl">
      <div className="flex flex-col items-center gap-3 text-gray-400">
        <Loader2 size={32} className="animate-spin text-pink" />
        <p className="text-sm font-medium">Chargement de la carte…</p>
      </div>
    </div>
  ),
})

type GeoStatus = 'idle' | 'loading' | 'success' | 'denied' | 'error'

const categoryColor: Record<string, string> = {
  restaurant: 'bg-orange-500',
  activite: 'bg-purple-500',
  cadeau: 'bg-pink',
  sport: 'bg-green',
  cinema: 'bg-blue',
}

const categoryEmoji: Record<string, string> = {
  restaurant: '🍔',
  activite: '🎯',
  cadeau: '🎁',
  sport: '🏋️',
  cinema: '🎬',
}

interface LieuxClientProps {
  offers: Offer[]
}

export default function LieuxClient({ offers }: LieuxClientProps) {
  const offersWithCoords = useMemo(() => offers.filter((offer) => offer.coords), [offers])

  const [selected, setSelected] = useState<Offer | null>(offersWithCoords[0] ?? null)
  const [search, setSearch] = useState('')
  const [userPosition, setUserPosition] = useState<[number, number] | null>(null)
  const [geoStatus, setGeoStatus] = useState<GeoStatus>('idle')
  const [distances, setDistances] = useState<Record<string, string>>({})

  function haversine(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const radius = 6371
    const dLat = ((lat2 - lat1) * Math.PI) / 180
    const dLon = ((lon2 - lon1) * Math.PI) / 180
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2
    return radius * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  }

  function requestGeolocation() {
    if (!('geolocation' in navigator)) {
      setGeoStatus('error')
      return
    }

    setGeoStatus('loading')

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords: [number, number] = [position.coords.latitude, position.coords.longitude]
        setUserPosition(coords)
        setGeoStatus('success')

        const nextDistances: Record<string, string> = {}
        offersWithCoords.forEach((offer) => {
          if (!offer.coords) {
            return
          }
          const distance = haversine(coords[0], coords[1], offer.coords[0], offer.coords[1])
          nextDistances[offer.id] = distance < 1 ? `${Math.round(distance * 1000)} m` : `${distance.toFixed(1)} km`
        })

        setDistances(nextDistances)
      },
      (error) => {
        setGeoStatus(error.code === error.PERMISSION_DENIED ? 'denied' : 'error')
      },
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }

  const filtered = useMemo(() => {
    const query = search.toLowerCase()

    return offersWithCoords.filter(
      (offer) => !query || offer.title.toLowerCase().includes(query) || offer.categoryLabel.toLowerCase().includes(query)
    )
  }, [offersWithCoords, search])

  const sorted = useMemo(() => {
    if (!userPosition || Object.keys(distances).length === 0) {
      return filtered
    }

    return [...filtered].sort((left, right) => {
      const leftDistance = left.coords
        ? haversine(userPosition[0], userPosition[1], left.coords[0], left.coords[1])
        : Number.MAX_SAFE_INTEGER
      const rightDistance = right.coords
        ? haversine(userPosition[0], userPosition[1], right.coords[0], right.coords[1])
        : Number.MAX_SAFE_INTEGER
      return leftDistance - rightDistance
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtered, userPosition, distances])

  useEffect(() => {
    requestGeolocation()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!selected && sorted.length > 0) {
      setSelected(sorted[0])
    }
  }, [selected, sorted])

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] bg-gray-50 dark:bg-dark-bg">
      <div className="bg-white dark:bg-dark-alt border-b border-gray-100 dark:border-dark-border px-6 py-4 flex-shrink-0">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center gap-3">
          <div>
            <h1 className="text-xl font-extrabold tracking-tight text-gray-900 dark:text-white">
              <span className="text-pink">{sorted.length}</span> offres sur la carte
            </h1>
          </div>

          <div className="flex items-center gap-2 bg-gray-50 dark:bg-dark-card border border-gray-200 dark:border-dark-border rounded-xl px-3 py-2 flex-1 min-w-[200px] max-w-sm focus-within:border-pink transition-colors">
            <Search size={14} className="text-gray-400 flex-shrink-0" />
            <input
              type="search"
              placeholder="Rechercher un lieu…"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="bg-transparent border-none outline-none text-sm text-gray-800 dark:text-gray-100 placeholder:text-gray-400 w-full"
            />
          </div>

          <button
            onClick={requestGeolocation}
            disabled={geoStatus === 'loading'}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-semibold transition-all
              ${
                geoStatus === 'success'
                  ? 'bg-green/10 border-green text-green'
                  : geoStatus === 'denied' || geoStatus === 'error'
                    ? 'bg-red-50 dark:bg-red-900/20 border-red-300 text-red-500'
                    : 'bg-pink/10 border-pink text-pink hover:bg-pink hover:text-white'
              }
            `}
          >
            {geoStatus === 'loading' ? (
              <Loader2 size={14} className="animate-spin" />
            ) : geoStatus === 'success' ? (
              <Navigation size={14} />
            ) : geoStatus === 'denied' ? (
              <AlertCircle size={14} />
            ) : (
              <MapPin size={14} />
            )}
            {geoStatus === 'loading'
              ? 'Localisation…'
              : geoStatus === 'success'
                ? 'Localisé ✓'
                : geoStatus === 'denied'
                  ? 'Accès refusé'
                  : geoStatus === 'error'
                    ? 'Erreur GPS'
                    : 'Me localiser'}
          </button>

          {geoStatus === 'denied' && (
            <p className="text-xs text-red-400 w-full">
              Autorise la localisation dans ton navigateur pour voir les offres près de toi.
            </p>
          )}
          {geoStatus === 'success' && (
            <p className="text-xs text-green w-full">✓ Offres triées par distance depuis ta position</p>
          )}
        </div>
      </div>

      <div className="flex flex-col md:flex-row flex-1 overflow-hidden max-w-6xl mx-auto w-full px-6 py-4 gap-4">
        <div className="w-full md:w-72 flex-shrink-0 overflow-y-auto space-y-1.5 pb-2">
          {sorted.map((offer) => {
            const distance = distances[offer.id] || offer.distance

            return (
              <button
                key={offer.id}
                onClick={() => setSelected(offer)}
                className={`
                  w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all duration-150
                  ${
                    selected?.id === offer.id
                      ? 'bg-pink/8 border-pink/40 shadow-sm'
                      : 'bg-white dark:bg-dark-card border-gray-100 dark:border-dark-border hover:border-pink/30 hover:bg-pink/4'
                  }
                `}
              >
                <div
                  className={`w-9 h-9 rounded-xl flex-shrink-0 flex items-center justify-center text-sm bg-gradient-to-br ${offer.gradient} text-white font-bold`}
                >
                  {offer.emoji.slice(0, 2)}
                </div>
                <div className="min-w-0 flex-1">
                  <p
                    className={`text-xs font-bold truncate ${selected?.id === offer.id ? 'text-pink' : 'text-gray-800 dark:text-gray-100'}`}
                  >
                    {offer.title}
                  </p>
                  <p className="text-[10px] text-gray-400 truncate">{offer.categoryLabel}</p>
                </div>
                {distance && distance !== '—' && (
                  <div className="flex flex-col items-end flex-shrink-0">
                    <span className="text-[10px] text-gray-400 font-medium">{distance}</span>
                    <span className="text-[10px]">{categoryEmoji[offer.category]}</span>
                  </div>
                )}
              </button>
            )
          })}
        </div>

        <div className="flex-1 min-h-[400px] md:min-h-0 relative">
          <MapComponent offers={sorted} userPosition={userPosition} selected={selected} onSelectOffer={setSelected} />

          <div className="absolute bottom-3 left-3 bg-white dark:bg-dark-card border border-gray-100 dark:border-dark-border rounded-xl px-3 py-2 shadow-md z-[400]">
            <p className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">Légende</p>
            <div className="flex flex-col gap-1">
              {Object.entries(categoryColor).map(([category, color]) => (
                <div key={category} className="flex items-center gap-1.5">
                  <div className={`w-2.5 h-2.5 rounded-full ${color}`} />
                  <span className="text-[10px] text-gray-600 dark:text-gray-400 capitalize">
                    {category === 'activite' ? 'Activité' : category.charAt(0).toUpperCase() + category.slice(1)}
                  </span>
                </div>
              ))}
              {userPosition && (
                <div className="flex items-center gap-1.5 mt-1 pt-1 border-t border-gray-100 dark:border-dark-border">
                  <div className="w-2.5 h-2.5 rounded-full bg-pink ring-2 ring-pink/30" />
                  <span className="text-[10px] text-pink font-semibold">Ma position</span>
                </div>
              )}
            </div>
          </div>

          {selected && (
            <div className="absolute top-3 right-3 w-64 bg-white dark:bg-dark-card border border-gray-100 dark:border-dark-border rounded-2xl shadow-xl overflow-hidden z-[400]">
              <div
                className={`h-16 bg-gradient-to-br ${selected.gradient} flex items-center justify-center text-white text-2xl font-black`}
              >
                {selected.emoji}
              </div>
              <div className="p-4">
                <span className="text-[10px] font-bold text-pink uppercase tracking-widest">{selected.categoryLabel}</span>
                <h3 className="text-sm font-bold text-gray-900 dark:text-white mt-0.5 mb-1 leading-tight">{selected.title}</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{selected.description}</p>
                {selected.address && (
                  <p className="text-[10px] text-gray-400 flex items-start gap-1 mb-3">
                    <MapPin size={10} className="flex-shrink-0 mt-0.5" />
                    {selected.address}
                  </p>
                )}
                {distances[selected.id] && <p className="text-xs text-pink font-semibold mb-2">📍 {distances[selected.id]} de toi</p>}
                <Link
                  href={`/offres/${selected.id}`}
                  className="block w-full text-center bg-pink text-white text-xs font-bold py-2.5 rounded-xl hover:bg-pink-dark transition-colors"
                >
                  Voir l&apos;offre →
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
