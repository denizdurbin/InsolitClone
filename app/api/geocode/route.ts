import { NextResponse } from 'next/server'

type GeocodeResult = {
  lat: number
  lng: number
  displayName?: string
}

export async function POST(request: Request) {
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

  // Address geocoder (FR) for postal/street precision.
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
      const result: GeocodeResult = {
        lat,
        lng,
        displayName: firstFeature?.properties?.label,
      }
      return NextResponse.json(result)
    }
  }

  const nominatimUrl = new URL('https://nominatim.openstreetmap.org/search')
  nominatimUrl.searchParams.set('q', address)
  nominatimUrl.searchParams.set('format', 'jsonv2')
  nominatimUrl.searchParams.set('limit', '1')

  const fallbackResponse = await fetch(nominatimUrl.toString(), {
    headers: {
      'Accept-Language': 'fr',
      'User-Agent': 'InsolitPublic/1.0 (contact: support@insolit.local)',
    },
    cache: 'no-store',
  })

  if (!fallbackResponse.ok) {
    return NextResponse.json({ error: 'Geocoding service unavailable' }, { status: 502 })
  }

  const results = (await fallbackResponse.json()) as Array<{ lat?: string; lon?: string; display_name?: string }>
  const first = results?.[0]

  if (!first?.lat || !first?.lon) {
    return NextResponse.json({ error: 'Adresse introuvable' }, { status: 404 })
  }

  const fallbackResult: GeocodeResult = {
    lat: Number(first.lat),
    lng: Number(first.lon),
    displayName: first.display_name,
  }

  return NextResponse.json(fallbackResult)
}
