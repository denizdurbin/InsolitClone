import { NextResponse } from 'next/server'
import { type Category, CATEGORIES } from '@/lib/data'
import { getServiceSupabaseClient, isAdminEmailServer } from '@/lib/admin-server'

function getAdminEmail(request: Request) {
  const headerEmail = request.headers.get('x-admin-email')
  if (headerEmail) return headerEmail

  try {
    const { email } = Object.fromEntries(new URL(request.url).searchParams)
    if (typeof email === 'string') return email
  } catch {}

  return null
}

type GeocodeResult = {
  lat: number
  lng: number
  displayName?: string
}

async function geocodeAddress(address: string): Promise<GeocodeResult | null> {
  if (!address.trim()) return null

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
      return {
        lat,
        lng,
        displayName: firstFeature?.properties?.label,
      }
    }
  }

  const nominatimUrl = new URL('https://nominatim.openstreetmap.org/search')
  nominatimUrl.searchParams.set('q', address)
  nominatimUrl.searchParams.set('format', 'jsonv2')
  nominatimUrl.searchParams.set('limit', '1')

  try {
    const fallbackResponse = await fetch(nominatimUrl.toString(), {
      headers: {
        'Accept-Language': 'fr',
        'User-Agent': 'InsolitAdmin/1.0',
      },
      cache: 'no-store',
    })

    if (!fallbackResponse.ok) return null

    const results = (await fallbackResponse.json()) as Array<{ lat?: string; lon?: string; display_name?: string }>
    const first = results?.[0]

    if (!first?.lat || !first?.lon) return null

    return {
      lat: Number(first.lat),
      lng: Number(first.lon),
      displayName: first.display_name,
    }
  } catch {
    return null
  }
}

function sanitizeDetails(value: unknown) {
  if (Array.isArray(value)) {
    return value
      .map((item) => (typeof item === 'string' ? item.trim() : ''))
      .filter(Boolean)
  }

  if (typeof value === 'string') {
    return value
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
  }

  return [] as string[]
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
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

  const updates: Record<string, any> = {}

  if (typeof payload.title === 'string') updates.title = payload.title.trim()
  if (typeof payload.description === 'string') updates.description = payload.description.trim()
  if (typeof payload.emoji === 'string') updates.emoji = payload.emoji.trim()
  if (typeof payload.gradient === 'string') updates.gradient = payload.gradient.trim()
  if (typeof payload.distance === 'string') updates.distance = payload.distance.trim()
  if (typeof payload.price === 'string') updates.price = payload.price.trim() || null
  if (typeof payload.badge === 'string') updates.badge = payload.badge.trim() || null
  if (typeof payload.address === 'string') updates.address = payload.address.trim() || null

  if (payload.latitude !== undefined) {
    if (payload.latitude === null || payload.latitude === '') {
      updates.latitude = null
    } else {
      const latitude = Number(payload.latitude)
      if (!Number.isFinite(latitude)) {
        return NextResponse.json({ error: 'Invalid latitude' }, { status: 400 })
      }
      updates.latitude = latitude
    }
  }

  if (payload.longitude !== undefined) {
    if (payload.longitude === null || payload.longitude === '') {
      updates.longitude = null
    } else {
      const longitude = Number(payload.longitude)
      if (!Number.isFinite(longitude)) {
        return NextResponse.json({ error: 'Invalid longitude' }, { status: 400 })
      }
      updates.longitude = longitude
    }
  }

  // Auto-geocode if address provided but coordinates missing or cleared
  if (payload.address !== undefined && typeof updates.address === 'string') {
    const hasCoords = (updates.latitude !== undefined && updates.latitude !== null) || (updates.longitude !== undefined && updates.longitude !== null)
    if (!hasCoords && updates.address) {
      const geocoded = await geocodeAddress(updates.address)
      if (geocoded) {
        updates.latitude = geocoded.lat
        updates.longitude = geocoded.lng
      }
    }
  }

  if (payload.rating !== undefined) {
    const rating = Number(payload.rating)
    updates.rating = Math.min(5, Math.max(0, Number.isFinite(rating) ? rating : 0))
  }

  if (payload.category) {
    if (!CATEGORIES.includes(payload.category as Category)) {
      return NextResponse.json({ error: 'Invalid category' }, { status: 400 })
    }
    updates.category = payload.category
    updates.category_label = {
      restaurant: 'Restaurant',
      activite: 'Activité',
      cadeau: 'Cadeau',
      sport: 'Sport',
      cinema: 'Cinéma',
    }[payload.category as Category]
  }

  if (payload.details !== undefined) {
    updates.details = sanitizeDetails(payload.details)
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'No fields to update' }, { status: 400 })
  }

  const supabase = getServiceSupabaseClient()
  const { error } = await supabase.from('offers').update(updates).eq('id', params.id)

  if (error) {
    console.error('[Supabase] update offer', error.message)
    return NextResponse.json({ error: 'Failed to update offer' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const email = getAdminEmail(request)
  if (!isAdminEmailServer(email)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = getServiceSupabaseClient()
  const { error } = await supabase.from('offers').delete().eq('id', params.id)

  if (error) {
    console.error('[Supabase] delete offer', error.message)
    return NextResponse.json({ error: 'Failed to delete offer' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
