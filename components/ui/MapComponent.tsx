'use client'

import { useEffect, useRef } from 'react'
import type { Offer } from '@/lib/data'

interface MapComponentProps {
  offers: Offer[]
  userPosition: [number, number] | null
  selected: Offer | null
  onSelectOffer: (offer: Offer) => void
}

// Couleur par catégorie
const categoryColor: Record<string, string> = {
  restaurant: '#ff6b35',
  activite:   '#a855f7',
  cadeau:     '#ff1870',
  sport:      '#00c896',
  cinema:     '#4a9eff',
}

export default function MapComponent({ offers, userPosition, selected, onSelectOffer }: MapComponentProps) {
  const mapRef    = useRef<HTMLDivElement>(null)
  const mapObj    = useRef<import('leaflet').Map | null>(null)
  const markersRef = useRef<Map<string, import('leaflet').Marker>>(new Map())

  useEffect(() => {
    if (!mapRef.current || mapObj.current) return

    // Import Leaflet côté client uniquement
    import('leaflet').then((L) => {
      // Fix icônes Leaflet avec Next.js
      delete (L.Icon.Default.prototype as any)._getIconUrl
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      })

      // Initialiser la carte centrée sur Paris par défaut
      const center: [number, number] = userPosition ?? [48.8566, 2.3522]
      const map = L.map(mapRef.current!, { zoomControl: true, attributionControl: true })
        .setView(center, userPosition ? 13 : 12)

      mapObj.current = map

      // Tuiles OpenStreetMap (gratuites)
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://openstreetmap.org">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map)

      // Marqueur de position utilisateur
      if (userPosition) {
        const pulsingIcon = L.divIcon({
          className: '',
          html: `
            <div style="
              width:20px;height:20px;border-radius:50%;
              background:#ff1870;border:3px solid white;
              box-shadow:0 0 0 4px rgba(255,24,112,0.3),0 2px 8px rgba(0,0,0,0.3);
              animation:pulse 2s infinite;
            "></div>
            <style>@keyframes pulse{0%,100%{box-shadow:0 0 0 4px rgba(255,24,112,0.3)}50%{box-shadow:0 0 0 8px rgba(255,24,112,0.1)}}</style>
          `,
          iconSize: [20, 20],
          iconAnchor: [10, 10],
        })
        L.marker(userPosition, { icon: pulsingIcon })
          .addTo(map)
          .bindPopup('<strong style="color:#ff1870">📍 Ma position</strong>')
      }

      // Marqueurs des offres
      offers.forEach((offer) => {
        if (!offer.coords) return
        const color = categoryColor[offer.category] ?? '#ff1870'

        const icon = L.divIcon({
          className: '',
          html: `
            <div style="
              display:flex;align-items:center;justify-content:center;
              width:36px;height:36px;border-radius:50% 50% 50% 0;
              transform:rotate(-45deg);
              background:${color};
              border:2px solid white;
              box-shadow:0 2px 8px rgba(0,0,0,0.25);
              cursor:pointer;
            ">
              <span style="transform:rotate(45deg);font-size:14px;line-height:1;">
                ${offer.emoji.slice(0, 2)}
              </span>
            </div>
          `,
          iconSize: [36, 36],
          iconAnchor: [18, 36],
          popupAnchor: [0, -38],
        })

        const marker = L.marker(offer.coords, { icon })
          .addTo(map)
          .bindPopup(`
            <div style="font-family:Inter,sans-serif;min-width:180px;">
              <span style="font-size:10px;font-weight:700;color:${color};text-transform:uppercase;letter-spacing:1px;">${offer.categoryLabel}</span>
              <h3 style="font-size:14px;font-weight:700;margin:4px 0 2px;color:#111;">${offer.title}</h3>
              <p style="font-size:12px;color:#666;margin:0 0 8px;">${offer.description}</p>
              ${offer.distance !== '—' ? `<span style="font-size:11px;color:#999;">📍 ${offer.distance}</span>` : ''}
              <br/>
              <a href="/offres/${offer.id}" style="
                display:block;text-align:center;margin-top:8px;
                background:${color};color:white;border-radius:8px;
                padding:6px 12px;font-size:12px;font-weight:600;text-decoration:none;
              ">Voir l'offre</a>
            </div>
          `)
          .on('click', () => onSelectOffer(offer))

        markersRef.current.set(offer.id, marker)
      })
    })

    return () => {
      if (mapObj.current) {
        mapObj.current.remove()
        mapObj.current = null
        markersRef.current.clear()
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Centrer sur la position utilisateur quand elle change
  useEffect(() => {
    if (mapObj.current && userPosition) {
      mapObj.current.setView(userPosition, 13, { animate: true })
    }
  }, [userPosition])

  // Ouvrir la popup du marqueur sélectionné
  useEffect(() => {
    if (!selected || !mapObj.current) return
    const marker = markersRef.current.get(selected.id)
    if (marker && selected.coords) {
      mapObj.current.setView(selected.coords, 15, { animate: true })
      marker.openPopup()
    }
  }, [selected])

  return (
    <div
      ref={mapRef}
      className="w-full h-full rounded-2xl overflow-hidden"
      aria-label="Carte des offres Insolit"
      role="application"
    />
  )
}
