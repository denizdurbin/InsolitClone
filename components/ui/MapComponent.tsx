'use client'

import { useEffect, useRef } from 'react'
import type { Offer } from '@/lib/data'

interface MapComponentProps {
  offers: Offer[]
  userPosition: [number, number] | null
  selected: Offer | null
  onSelectOffer: (offer: Offer) => void
}

const categoryColor: Record<string, string> = {
  restaurant: '#ff6b35',
  activite: '#a855f7',
  cadeau: '#ff1870',
  sport: '#00c896',
  cinema: '#4a9eff',
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

function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;')
}

const INITIAL_MARKER_LIMIT = 80

export default function MapComponent({ offers, userPosition, selected, onSelectOffer }: MapComponentProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapObj = useRef<import('leaflet').Map | null>(null)
  const markersRef = useRef<Map<string, import('leaflet').Marker>>(new Map())
  const renderedIdRef = useRef<Set<string>>(new Set())
  const redrawFuncRef = useRef<(() => void) | null>(null)
  const userMarkerRef = useRef<import('leaflet').Marker | null>(null)
  const offersRef = useRef(offers)
  const selectedRef = useRef(selected)
  const userPositionRef = useRef(userPosition)

  // Keep refs in sync
  offersRef.current = offers
  selectedRef.current = selected
  userPositionRef.current = userPosition

  useEffect(() => {
    if (!mapRef.current || mapObj.current) return

    let cancelled = false

    import('leaflet').then((L) => {
      if (cancelled || !mapRef.current || mapObj.current) return

      const center: [number, number] = userPosition ?? [48.8566, 2.3522]
      const map = L.map(mapRef.current, { zoomControl: true, attributionControl: true }).setView(center, userPosition ? 13 : 12)
      mapObj.current = map

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://openstreetmap.org">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map)

      const createMarker = (offer: Offer, coords: [number, number]) => {
        if (!mapObj.current) return null

        const color = categoryColor[offer.category] ?? '#ff1870'
        const isImage = offer.emoji?.startsWith('http')
        const emojiText = escapeHtml(offer.emoji.slice(0, 2))

        const iconHtml = isImage
          ? `<img src="${escapeHtml(offer.emoji)}" alt="${escapeHtml(offer.title)}" style="width:100%;height:100%;object-fit:cover;transform:rotate(45deg) scale(1.15);display:block;" />`
          : `<span style="transform:rotate(45deg);font-size:14px;line-height:1;font-weight:700;color:${color};">${emojiText}</span>`

        const icon = L.divIcon({
          className: '',
          html: `<div style="width:42px;height:42px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);background:white;border:2px solid ${color};box-shadow:0 4px 12px rgba(0,0,0,0.25);overflow:hidden;display:flex;align-items:center;justify-content:center;cursor:pointer;">${iconHtml}</div>`,
          iconSize: [42, 42],
          iconAnchor: [21, 42],
          popupAnchor: [0, -42],
        })

        const popupVisual = isImage
          ? `<img src="${escapeHtml(offer.emoji)}" alt="${escapeHtml(offer.title)}" style="width:100%;height:90px;object-fit:cover;display:block;border-radius:10px;margin-bottom:8px;" />`
          : `<div style="width:100%;height:90px;display:flex;align-items:center;justify-content:center;border-radius:10px;margin-bottom:8px;color:white;font-size:30px;font-weight:800;background:${color};">${escapeHtml(offer.emoji)}</div>`

        const distance =
          userPositionRef.current && coords
            ? formatDistance(haversine(userPositionRef.current[0], userPositionRef.current[1], coords[0], coords[1]))
            : null

        const marker = L.marker(coords, { icon })
          .addTo(mapObj.current)
          .bindPopup(`
            <div style="font-family:Inter,sans-serif;min-width:200px;max-width:220px;">
              ${popupVisual}
              <span style="font-size:10px;font-weight:700;color:${color};text-transform:uppercase;letter-spacing:1px;">${escapeHtml(offer.categoryLabel)}</span>
              <h3 style="font-size:14px;font-weight:700;margin:4px 0 2px;color:#111;">${escapeHtml(offer.title)}</h3>
              <p style="font-size:12px;color:#666;margin:0 0 8px;">${escapeHtml(offer.description)}</p>
              ${distance ? `<span style="font-size:11px;color:#999;">${escapeHtml(distance)}</span>` : ''}
              <br />
              <a href="/offres/${escapeHtml(offer.id)}" style="display:block;text-align:center;margin-top:8px;background:${color};color:white;border-radius:8px;padding:6px 12px;font-size:12px;font-weight:600;text-decoration:none;">Voir l'offre</a>
            </div>
          `)
          .on('click', () => onSelectOffer(offer))

        return marker
      }

      const redrawVisibleMarkers = () => {
        if (cancelled || !mapObj.current) return

        const bounds = mapObj.current.getBounds()
        const allOffers = offersRef.current.filter(o => o.coords)
        const visibleOffers = allOffers.filter(o => {
          if (!o.coords) return false
          return bounds.contains(L.latLng(o.coords[0], o.coords[1]))
        })

        // Keep selected always rendered
        const toRender = new Set<string>()
        if (selectedRef.current?.coords) {
          toRender.add(selectedRef.current.id)
        }

        // Add visible offers
        visibleOffers.forEach(o => toRender.add(o.id))

        // Add first N offers outside view if we don't have enough
        if (toRender.size < INITIAL_MARKER_LIMIT) {
          let count = toRender.size
          for (const offer of allOffers) {
            if (count >= INITIAL_MARKER_LIMIT) break
            toRender.add(offer.id)
            count++
          }
        }

        // Remove markers not in toRender
        Array.from(markersRef.current.entries()).forEach(([id, marker]) => {
          if (!toRender.has(id)) {
            marker.remove()
            markersRef.current.delete(id)
            renderedIdRef.current.delete(id)
          }
        })

        // Add new markers
        allOffers.forEach(offer => {
          if (!toRender.has(offer.id) || renderedIdRef.current.has(offer.id)) return
          const marker = createMarker(offer, offer.coords!)
          if (marker) {
            markersRef.current.set(offer.id, marker)
            renderedIdRef.current.add(offer.id)
          }
        })
      }

      redrawFuncRef.current = redrawVisibleMarkers
      redrawVisibleMarkers()
      map.on('moveend', redrawVisibleMarkers)
      map.on('zoomend', redrawVisibleMarkers)

      // Initialize user marker if position exists
      if (userPosition) {
        const pulsingIcon = L.divIcon({
          className: '',
          html: '<div style="width:20px;height:20px;border-radius:50%;background:#ff1870;border:3px solid white;box-shadow:0 0 0 4px rgba(255,24,112,0.3),0 2px 8px rgba(0,0,0,0.3);animation:pulse 2s infinite;"></div><style>@keyframes pulse {0%,100% { box-shadow:0 0 0 4px rgba(255,24,112,0.3) }50% { box-shadow:0 0 0 8px rgba(255,24,112,0.1) }}</style>',
          iconSize: [20, 20],
          iconAnchor: [10, 10],
        })

        userMarkerRef.current = L.marker(userPosition, { icon: pulsingIcon })
          .addTo(map)
          .bindPopup('<strong style="color:#ff1870">📍 Ma position</strong>')
      }
    })

    return () => {
      cancelled = true
      if (mapObj.current) {
        mapObj.current.remove()
        mapObj.current = null
        markersRef.current.clear()
        userMarkerRef.current = null
      }
    }
  }, [])

  useEffect(() => {
    if (!mapObj.current || !redrawFuncRef.current) return

    // Reset rendered markers and trigger full redraw
    renderedIdRef.current.clear()
    markersRef.current.forEach((marker) => marker.remove())
    markersRef.current.clear()

    // Trigger redraw on next animation frame
    requestAnimationFrame(() => {
      if (redrawFuncRef.current) {
        redrawFuncRef.current()
      }
    })
  }, [offers, selected])

  useEffect(() => {
    if (!mapObj.current || !redrawFuncRef.current) return

    // When userPosition changes, update user marker
    if (userPosition) {
      // Remove old marker
      if (userMarkerRef.current) {
        userMarkerRef.current.remove()
      }

      // Add new marker at updated position
      import('leaflet').then((L) => {
        const pulsingIcon = L.divIcon({
          className: '',
          html: '<div style="width:20px;height:20px;border-radius:50%;background:#ff1870;border:3px solid white;box-shadow:0 0 0 4px rgba(255,24,112,0.3),0 2px 8px rgba(0,0,0,0.3);animation:pulse 2s infinite;"></div><style>@keyframes pulse {0%,100% { box-shadow:0 0 0 4px rgba(255,24,112,0.3) }50% { box-shadow:0 0 0 8px rgba(255,24,112,0.1) }}</style>',
          iconSize: [20, 20],
          iconAnchor: [10, 10],
        })

        if (mapObj.current) {
          userMarkerRef.current = L.marker(userPosition, { icon: pulsingIcon })
            .addTo(mapObj.current)
            .bindPopup('<strong style="color:#ff1870">📍 Ma position</strong>')
        }
      })

      // Pan to user position
      mapObj.current.setView(userPosition, 13, { animate: true })
    } else {
      // Remove marker if userPosition is null
      if (userMarkerRef.current) {
        userMarkerRef.current.remove()
        userMarkerRef.current = null
      }
    }

    // Redraw offer markers (some may now have distances)
    requestAnimationFrame(() => {
      if (redrawFuncRef.current) {
        redrawFuncRef.current()
      }
    })
  }, [userPosition])

  useEffect(() => {
    if (!selectedRef.current || !mapObj.current || !redrawFuncRef.current) return

    // Redraw to ensure selected is visible, then navigate to it
    redrawFuncRef.current()

    requestAnimationFrame(() => {
      if (!selectedRef.current || !mapObj.current) return
      const marker = markersRef.current.get(selectedRef.current.id)
      if (marker && selectedRef.current.coords) {
        mapObj.current.setView(selectedRef.current.coords as [number, number], 15, { animate: true })
        marker.openPopup()
      }
    })
  }, [selected])

  return <div ref={mapRef} className="w-full h-full rounded-2xl overflow-hidden" aria-label="Carte des offres Insolit" role="application" />
}
