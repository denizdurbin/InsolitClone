'use client'

import 'leaflet/dist/leaflet.css'
import { useEffect, useMemo, useRef, useState } from 'react'
import type { Offer } from '@/lib/data'

interface OfferDetailMapProps {
    offer: Offer
}

const categoryColor: Record<string, string> = {
    restaurant: '#ff6b35',
    activite: '#a855f7',
    cadeau: '#ff1870',
    sport: '#00c896',
    cinema: '#4a9eff',
}

function escapeHtml(value: string) {
    return value
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#039;')
}

async function geocodeAddress(address: string): Promise<[number, number] | null> {
    try {
        const response = await fetch('/api/geocode', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ address }),
        })
        if (!response.ok) return null
        const data = (await response.json()) as { lat?: number; lng?: number }
        if (!Number.isFinite(data.lat) || !Number.isFinite(data.lng)) return null
        return [data.lat as number, data.lng as number]
    } catch {
        return null
    }
}

export default function OfferDetailMap({ offer }: OfferDetailMapProps) {
    const mapRef = useRef<HTMLDivElement>(null)
    const mapInstanceRef = useRef<import('leaflet').Map | null>(null)
    const [resolvedCoords, setResolvedCoords] = useState<[number, number] | null>(offer.coords ?? null)

    const markerCoords = useMemo(() => offer.coords ?? resolvedCoords, [offer.coords, resolvedCoords])

    useEffect(() => {
        setResolvedCoords(offer.coords ?? null)
    }, [offer.coords, offer.id])

    useEffect(() => {
        if (offer.coords || !offer.address) return
        geocodeAddress(offer.address).then((coords) => {
            if (coords) setResolvedCoords(coords)
        })
    }, [offer.address, offer.coords])

    useEffect(() => {
        if (!markerCoords) return

        const container = mapRef.current
        if (!container) return

        let cancelled = false

        void import('leaflet').then((L) => {
            if (cancelled || !container.isConnected) return

            if (mapInstanceRef.current) {
                mapInstanceRef.current.remove()
                mapInstanceRef.current = null
            }

            const color = categoryColor[offer.category] ?? '#ff1870'
            const map = L.map(container, {
                zoomControl: true,
                attributionControl: true,
            }).setView(markerCoords, 15)

            if (cancelled) {
                map.remove()
                return
            }

            mapInstanceRef.current = map

            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© OpenStreetMap',
                maxZoom: 19,
            }).addTo(map)

            const isImage = offer.emoji?.startsWith('http')

            const icon = L.divIcon({
                className: '',
                html: `
          <div style="
            width:46px;
            height:46px;
            border-radius:50% 50% 50% 0;
            transform:rotate(-45deg);
            background:white;
            border:2px solid ${color};
            box-shadow:0 4px 12px rgba(0,0,0,0.22);
            overflow:hidden;
            display:flex;
            align-items:center;
            justify-content:center;
          ">
            ${
                    isImage
                        ? `
                  <img
                    src="${escapeHtml(offer.emoji)}"
                    alt="${escapeHtml(offer.title)}"
                    style="
                      width:100%;
                      height:100%;
                      object-fit:cover;
                      display:block;
                      transform:rotate(45deg) scale(1.12);
                    "
                  />
                `
                        : `
                  <span style="
                    transform:rotate(45deg);
                    color:${color};
                    font-size:14px;
                    font-weight:700;
                    line-height:1;
                  ">
                    ${escapeHtml(offer.emoji.slice(0, 2))}
                  </span>
                `
                }
          </div>
        `,
                iconSize: [46, 46],
                iconAnchor: [23, 46],
                popupAnchor: [0, -42],
            })

            L.marker(markerCoords, { icon }).addTo(map)

            requestAnimationFrame(() => {
                if (!cancelled) map.invalidateSize()
            })
            setTimeout(() => {
                if (!cancelled) map.invalidateSize()
            }, 100)
        })

        return () => {
            cancelled = true
            if (mapInstanceRef.current) {
                mapInstanceRef.current.remove()
                mapInstanceRef.current = null
            }
        }
    }, [markerCoords, offer.category, offer.emoji, offer.title, offer.id])

    if (!markerCoords) {
        return (
            <div
                className="mt-4 h-56 rounded-xl bg-gray-100 dark:bg-dark-alt border border-gray-200 dark:border-dark-border flex items-center justify-center"
                aria-label="Carte de localisation"
            >
                <span className="text-gray-400 text-sm">Localisation indisponible pour cette offre.</span>
            </div>
        )
    }

    return (
        <div
            className="mt-4 h-56 rounded-xl overflow-hidden border border-gray-200 dark:border-dark-border"
            aria-label="Carte de localisation"
        >
            <div ref={mapRef} className="w-full h-full" />
        </div>
    )
}