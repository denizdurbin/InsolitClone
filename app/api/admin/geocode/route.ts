import { NextResponse } from 'next/server'
import { isAdminEmailServer } from '@/lib/admin-server'

type GeocodeResult = {
  lat: number
  lng: number
  displayName?: string
}

function getAdminEmail(request: Request) {
  const headerEmail = request.headers.get('x-admin-email')
  if (headerEmail) return headerEmail

  try {
    const { email } = Object.fromEntries(new URL(request.url).searchParams)
    if (typeof email === 'string') return email
  } catch {}

  return null
}

export async function POST(request: Request) {
  const email = getAdminEmail(request)
  if (!isAdminEmailServer(email)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let payload: any
  try {
    payload = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 })
  }

  const address = typeof payload.address === 'string' ? payload.address.trim() : ''
  if (!address) {
    return NextResponse.json({ error: 'Address is required' }, { status: 400 })
  }

  // 1) Try the French national address API first for better precision in FR.
  const banUrl = new URL('https://api-adresse.data.gouv.fr/search/')
  banUrl.searchParams.set('q', address)
  banUrl.searchParams.set('limit', '1')

  const banResponse = await fetch(banUrl.toString(), { cache: 'no-store' })
  if (banResponse.ok) {
    const banData = (await banResponse.json()) as {
      features?: Array<{
        geometry?: { coordinates?: [number, number] }
        properties?: { label?: string }
      }>
    }

    const firstFeature = banData.features?.[0]
    const coords = firstFeature?.geometry?.coordinates
    if (coords && Number.isFinite(coords[0]) && Number.isFinite(coords[1])) {
      const [lng, lat] = coords
      const payload: GeocodeResult = {
        lat,
        lng,
        displayName: firstFeature?.properties?.label,
      }
      return NextResponse.json(payload)
    }
  }

  // 2) Fallback to Nominatim for non-FR or unmatched addresses.
  const url = new URL('https://nominatim.openstreetmap.org/search')
  url.searchParams.set('q', address)
  url.searchParams.set('format', 'jsonv2')
  url.searchParams.set('limit', '1')

  const response = await fetch(url.toString(), {
    headers: {
      'Accept-Language': 'fr',
      'User-Agent': 'InsolitAdmin/1.0 (contact: admin@insolit.local)'
    },
    cache: 'no-store',
  })

  if (!response.ok) {
    return NextResponse.json({ error: 'Geocoding service unavailable' }, { status: 502 })
  }

  const results = (await response.json()) as Array<{ lat?: string; lon?: string; display_name?: string }>
  const first = results?.[0]

  if (!first?.lat || !first?.lon) {
    return NextResponse.json({ error: 'Adresse introuvable. Ajoute plus de détails (numéro, ville, code postal, pays).' }, { status: 404 })
  }

  const fallbackPayload: GeocodeResult = {
    lat: Number(first.lat),
    lng: Number(first.lon),
    displayName: first.display_name,
  }

  return NextResponse.json(fallbackPayload)
}
