'use client'

import { useState, useEffect, useMemo, useRef } from 'react'
import dynamic from 'next/dynamic'
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
type ManualLocationStatus = 'idle' | 'loading' | 'success' | 'error'

const categoryColor: Record<string, string> = {
  restaurant: 'bg-orange-500',
  activite: 'bg-purple-500',
  cadeau: 'bg-pink',
  sport: 'bg-green',
  cinema: 'bg-blue',
}

interface LieuxClientProps {
  offers: Offer[]
}

export default function LieuxClient({ offers }: LieuxClientProps) {
  const offersWithLocation = useMemo(() => offers.filter((offer) => offer.coords || offer.address), [offers])

  const [selected, setSelected] = useState<Offer | null>(offersWithLocation[0] ?? null)
  const [search, setSearch] = useState('')
  const [userPosition, setUserPosition] = useState<[number, number] | null>(null)
  const [geoStatus, setGeoStatus] = useState<GeoStatus>('idle')
  const [manualAddress, setManualAddress] = useState('')
  const [manualStatus, setManualStatus] = useState<ManualLocationStatus>('idle')
  const [manualMessage, setManualMessage] = useState('')
  const [distances, setDistances] = useState<Record<string, string>>({})
  const geoWatchRef = useRef<number | null>(null)
  const geoTimeoutRef = useRef<number | null>(null)

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
    console.log('[Lieux] geolocation request started')

    if (!('geolocation' in navigator)) {
      console.log('[Lieux] geolocation unsupported')
      setGeoStatus('error')
      return
    }

    if (geoWatchRef.current !== null) {
      navigator.geolocation.clearWatch(geoWatchRef.current)
      geoWatchRef.current = null
    }
    if (geoTimeoutRef.current !== null) {
      window.clearTimeout(geoTimeoutRef.current)
      geoTimeoutRef.current = null
    }

    setGeoStatus('loading')
    setManualStatus('idle')
    setManualMessage('')

    const applyPosition = (coords: [number, number]) => {
      setUserPosition(coords)
      setGeoStatus('success')

      const nextDistances: Record<string, string> = {}
      offersWithLocation.forEach((offer) => {
        if (!offer.coords) return
        const distance = haversine(coords[0], coords[1], offer.coords[0], offer.coords[1])
        nextDistances[offer.id] = distance < 1 ? `${Math.round(distance * 1000)} m` : `${distance.toFixed(1)} km`
      })
      setDistances(nextDistances)
    }

    const stopTracking = () => {
      if (geoWatchRef.current !== null) {
        navigator.geolocation.clearWatch(geoWatchRef.current)
        geoWatchRef.current = null
      }
      if (geoTimeoutRef.current !== null) {
        window.clearTimeout(geoTimeoutRef.current)
        geoTimeoutRef.current = null
      }
    }

    let best: { coords: [number, number]; accuracy: number } | null = null

    geoWatchRef.current = navigator.geolocation.watchPosition(
      (position) => {
        const accuracy = Math.round(position.coords.accuracy)
        const coords: [number, number] = [position.coords.latitude, position.coords.longitude]

        console.log('[Lieux] geolocation sample', {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy,
        })

        if (!best || accuracy < best.accuracy) {
          best = { coords, accuracy }
          applyPosition(coords)
        }

        // Consider fix good enough, no need to keep waiting.
        if (accuracy <= 25) {
          stopTracking()
        }
      },
      (error) => {
        console.log('[Lieux] geolocation error', {
          code: error.code,
          message: error.message,
        })

        if (error.code === error.PERMISSION_DENIED) {
          stopTracking()
          setGeoStatus('denied')
          return
        }

        // Keep best known point if one sample was captured.
        if (best) {
          applyPosition(best.coords)
        } else {
          setGeoStatus('error')
        }
        stopTracking()
      },
      { enableHighAccuracy: true, maximumAge: 0, timeout: 15000 }
    )

    geoTimeoutRef.current = window.setTimeout(() => {
      if (best) {
        applyPosition(best.coords)
      } else {
        setGeoStatus('error')
      }
      stopTracking()
    }, 12000)
  }

  async function applyManualLocation() {
    const address = manualAddress.trim()
    if (!address) {
      setManualStatus('error')
      setManualMessage('Entre une adresse pour te localiser.')
      return
    }

    setManualStatus('loading')
    setManualMessage('')

    try {
      const response = await fetch('/api/geocode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address }),
      })

      const payload = await response.json()
      if (!response.ok || !Number.isFinite(payload?.lat) || !Number.isFinite(payload?.lng)) {
        setManualStatus('error')
        setManualMessage(payload?.error || 'Adresse introuvable.')
        return
      }

      const coords: [number, number] = [Number(payload.lat), Number(payload.lng)]
      setUserPosition(coords)
      setGeoStatus('idle')

      const nextDistances: Record<string, string> = {}
      offersWithLocation.forEach((offer) => {
        if (!offer.coords) return
        const distance = haversine(coords[0], coords[1], offer.coords[0], offer.coords[1])
        nextDistances[offer.id] = distance < 1 ? `${Math.round(distance * 1000)} m` : `${distance.toFixed(1)} km`
      })
      setDistances(nextDistances)

      setManualStatus('success')
      setManualMessage(payload?.displayName || 'Position mise a jour depuis l\'adresse.')
    } catch {
      setManualStatus('error')
      setManualMessage('Impossible de geocoder cette adresse pour le moment.')
    }
  }

  function resetManualLocation() {
    if (geoWatchRef.current !== null) {
      navigator.geolocation.clearWatch(geoWatchRef.current)
      geoWatchRef.current = null
    }
    if (geoTimeoutRef.current !== null) {
      window.clearTimeout(geoTimeoutRef.current)
      geoTimeoutRef.current = null
    }

    setManualAddress('')
    setManualStatus('idle')
    setManualMessage('')
    setUserPosition(null)
    setDistances({})
    setGeoStatus('idle')
  }

  useEffect(() => {
    return () => {
      if (geoWatchRef.current !== null) {
        navigator.geolocation.clearWatch(geoWatchRef.current)
      }
      if (geoTimeoutRef.current !== null) {
        window.clearTimeout(geoTimeoutRef.current)
      }
    }
  }, [])

  const filtered = useMemo(() => {
    const query = search.toLowerCase()

    return offersWithLocation.filter(
      (offer) => !query || offer.title.toLowerCase().includes(query) || offer.categoryLabel.toLowerCase().includes(query)
    )
  }, [offersWithLocation, search])

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
                  ? 'Réessayer'
                  : geoStatus === 'error'
                    ? 'Erreur GPS'
                    : 'Me localiser'}
          </button>

          {geoStatus === 'denied' && (
            <p className="text-xs text-red-400 w-full">
              Autorise la localisation dans les réglages du site puis reclique sur le bouton.
            </p>
          )}
          {geoStatus === 'success' && (
            <p className="text-xs text-green w-full">✓ Offres triées par distance depuis ta position</p>
          )}

          <div className="w-full flex flex-col sm:flex-row gap-2 items-stretch sm:items-center">
            <input
              type="text"
              value={manualAddress}
              onChange={(event) => setManualAddress(event.target.value)}
              placeholder="Adresse precise (ex: 12 rue du Temple, Paris)"
              className="w-full sm:max-w-md rounded-xl border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-alt px-3 py-2 text-sm focus:border-pink outline-none"
            />
            <button
              type="button"
              onClick={applyManualLocation}
              disabled={manualStatus === 'loading'}
              className="px-4 py-2 rounded-xl border border-pink text-pink hover:bg-pink hover:text-white text-sm font-semibold transition-all disabled:opacity-60"
            >
              {manualStatus === 'loading' ? 'Adresse…' : 'Utiliser cette adresse'}
            </button>
            <button
              type="button"
              onClick={resetManualLocation}
              className="px-4 py-2 rounded-xl border border-gray-300 dark:border-dark-border text-gray-600 dark:text-gray-300 hover:border-pink hover:text-pink text-sm font-semibold transition-all"
            >
              Réinitialiser
            </button>
          </div>

          {manualStatus === 'success' && manualMessage && (
            <p className="text-xs text-green w-full">✓ {manualMessage}</p>
          )}
          {manualStatus === 'error' && manualMessage && (
            <p className="text-xs text-red-500 w-full">{manualMessage}</p>
          )}
        </div>
      </div>

      <div className="flex flex-col md:flex-row flex-1 overflow-hidden max-w-6xl mx-auto w-full px-6 py-4 gap-4">
        <div className="w-full md:w-72 flex-shrink-0 overflow-y-auto space-y-1.5 pb-2">
            {sorted.map((offer) => {
                const distance = userPosition ? distances[offer.id] ?? '' : ''
                const isImage = offer.emoji?.startsWith('http')

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
                        <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100 dark:bg-dark-border border border-gray-100 dark:border-dark-border">
                            {isImage ? (
                                <img
                                    src={offer.emoji}
                                    alt={offer.title}
                                    className="w-full h-full object-cover block"
                                />
                            ) : (
                                <div className={`w-full h-full flex items-center justify-center text-base bg-gradient-to-br ${offer.gradient} text-white font-bold`}>
                                    {offer.emoji.slice(0, 2)}
                                </div>
                            )}
                        </div>

                        <div className="min-w-0 flex-1">
                            <p
                                className={`text-xs font-bold truncate ${selected?.id === offer.id ? 'text-pink' : 'text-gray-800 dark:text-gray-100'}`}
                            >
                                {offer.title}
                            </p>
                            <p className="text-[10px] text-gray-400 truncate">{offer.categoryLabel}</p>
                        </div>

                        {distance && (
                            <div className="flex flex-col items-end flex-shrink-0">
                                <span className="text-[10px] text-gray-400 font-medium">{distance}</span>
                            </div>
                        )}
                    </button>
                )
            })}
        </div>

        <div className="flex-1 min-h-[400px] md:min-h-0 relative">
          <MapComponent offers={sorted} userPosition={userPosition} selected={selected} onSelectOffer={setSelected} />

        </div>
      </div>
    </div>
  )
}
