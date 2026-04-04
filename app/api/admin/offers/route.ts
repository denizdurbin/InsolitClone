import { NextResponse } from 'next/server'
import { type Category, CATEGORIES } from '@/lib/data'
import { buildOfferIdFromTitle } from '@/lib/admin'
import { getOffers } from '@/lib/supabase-data'
import { getServiceSupabaseClient, isAdminEmailServer } from '@/lib/admin-server'
import { geocodeAddress } from '@/lib/geocoding'

function getAdminEmail(request: Request) {
  const headerEmail = request.headers.get('x-admin-email')
  if (headerEmail) return headerEmail

  try {
    const { email } = Object.fromEntries(new URL(request.url).searchParams)
    if (typeof email === 'string') return email
  } catch {}

  return null
}

function categoryLabel(category: Category) {
  const labels: Record<Category, string> = {
    restaurant: 'Restaurant',
    activite: 'Activité',
    cadeau: 'Cadeau',
    sport: 'Sport',
    cinema: 'Cinéma',
  }

  return labels[category]
}

function defaultGradient(category: Category) {
  const gradients: Record<Category, string> = {
    restaurant: 'from-orange-500 to-red-500',
    activite: 'from-purple-600 to-pink-500',
    cadeau: 'from-pink-500 to-orange-400',
    sport: 'from-green-500 to-emerald-600',
    cinema: 'from-blue-500 to-indigo-600',
  }

  return gradients[category]
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

  const title = typeof payload.title === 'string' ? payload.title.trim() : ''
  const description = typeof payload.description === 'string' ? payload.description.trim() : ''
  const category = typeof payload.category === 'string' ? payload.category.trim() : ''

  if (!title || !description || !CATEGORIES.includes(category as Category)) {
    return NextResponse.json({ error: 'Missing or invalid fields' }, { status: 400 })
  }

  const rating = Math.min(5, Math.max(0, Number(payload.rating ?? 4)))
  const emoji = typeof payload.emoji === 'string' && payload.emoji.trim() ? payload.emoji.trim() : '✨'
  const gradient = typeof payload.gradient === 'string' && payload.gradient.trim()
    ? payload.gradient.trim()
    : defaultGradient(category as Category)
  const distance = typeof payload.distance === 'string' && payload.distance.trim()
    ? payload.distance.trim()
    : '—'
  const price = typeof payload.price === 'string' && payload.price.trim() ? payload.price.trim() : null
  const badge = typeof payload.badge === 'string' && payload.badge.trim() ? payload.badge.trim() : null
  const address = typeof payload.address === 'string' && payload.address.trim() ? payload.address.trim() : null
  const details = sanitizeDetails(payload.details)
  let latitude = payload.latitude !== undefined && payload.latitude !== null && payload.latitude !== ''
    ? Number(payload.latitude)
    : null
  let longitude = payload.longitude !== undefined && payload.longitude !== null && payload.longitude !== ''
    ? Number(payload.longitude)
    : null

  if ((latitude !== null && !Number.isFinite(latitude)) || (longitude !== null && !Number.isFinite(longitude))) {
    return NextResponse.json({ error: 'Invalid latitude/longitude' }, { status: 400 })
  }

  // Auto-geocode if address provided but coordinates missing
  if (address && latitude === null && longitude === null) {
    const geocoded = await geocodeAddress(address)
    if (geocoded) {
      latitude = geocoded.lat
      longitude = geocoded.lng
    }
  }

  const supabase = getServiceSupabaseClient()

  const { data: lastSort } = await supabase
    .from('offers')
    .select('sort_order')
    .order('sort_order', { ascending: false })
    .limit(1)
    .maybeSingle()

  const sortOrder = (lastSort?.sort_order ?? 0) + 1
  const id = buildOfferIdFromTitle(title)

  const { error } = await supabase.from('offers').insert({
    id,
    sort_order: sortOrder,
    title,
    description,
    category,
    category_label: categoryLabel(category as Category),
    emoji,
    gradient,
    rating,
    distance,
    badge,
    price,
    address,
    details,
    latitude,
    longitude,
  })

  if (error) {
    console.error('[Supabase] create offer', error.message)
    return NextResponse.json({ error: 'Failed to create offer' }, { status: 500 })
  }

  return NextResponse.json({ id })
}

export async function GET(request: Request) {
  const email = getAdminEmail(request)
  if (!isAdminEmailServer(email)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const offers = await getOffers()
  return NextResponse.json({ offers })
}
