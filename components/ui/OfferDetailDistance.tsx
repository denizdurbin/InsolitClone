'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { AlertCircle, Loader2, MapPin, Navigation } from 'lucide-react'

type GeoStatus = 'idle' | 'loading' | 'success' | 'denied' | 'error'

interface OfferDetailDistanceProps {
  coords?: [number, number]
}

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

export default function OfferDetailDistance({ coords }: OfferDetailDistanceProps) {
  const [geoStatus, setGeoStatus] = useState<GeoStatus>('idle')
  const [userPosition, setUserPosition] = useState<[number, number] | null>(null)
  const watchIdRef = useRef<number | null>(null)

  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current)
        watchIdRef.current = null
      }
    }
  }, [])

  const distance = useMemo(() => {
    if (!coords || !userPosition) return null
    return formatDistance(haversine(userPosition[0], userPosition[1], coords[0], coords[1]))
  }, [coords, userPosition])

  if (!coords) return null

  function requestGeolocation() {
    if (!('geolocation' in navigator)) {
      setGeoStatus('error')
      return
    }

    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current)
      watchIdRef.current = null
    }

    setGeoStatus('loading')

    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        setUserPosition([position.coords.latitude, position.coords.longitude])
        setGeoStatus('success')
      },
      (error) => {
        setGeoStatus(error.code === error.PERMISSION_DENIED ? 'denied' : 'error')
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    )
  }

  return (
    <div className="flex items-center gap-2">
      {distance && (
        <div className="flex items-center gap-1">
          <MapPin size={14} className="text-pink" aria-hidden="true" />
          <span>{distance}</span>
        </div>
      )}
      <button
        type="button"
        onClick={requestGeolocation}
        disabled={geoStatus === 'loading'}
        className="inline-flex items-center gap-1 rounded-full border border-gray-200 px-2 py-0.5 text-xs font-semibold text-gray-600 transition-colors hover:border-pink hover:text-pink disabled:opacity-70 dark:border-dark-border dark:text-gray-300"
      >
        {geoStatus === 'loading' ? (
          <Loader2 size={12} className="animate-spin" />
        ) : geoStatus === 'success' ? (
          <Navigation size={12} />
        ) : geoStatus === 'denied' || geoStatus === 'error' ? (
          <AlertCircle size={12} />
        ) : (
          <MapPin size={12} />
        )}
        {geoStatus === 'loading'
          ? 'Localisation...'
          : geoStatus === 'success'
            ? 'Position active'
            : geoStatus === 'denied'
              ? 'Permission refusee'
              : geoStatus === 'error'
                ? 'Erreur GPS'
                : 'Ma position'}
      </button>
    </div>
  )
}
