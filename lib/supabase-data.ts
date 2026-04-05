import type { PostgrestError } from '@supabase/supabase-js'
import type { Category, Feature, Offer, Step, Testimonial } from '@/lib/data'
import { createClient } from '@/utils/supabase/server'

type PartnerRow = {
  address: string | null
  latitude: number | null
  longitude: number | null
}

type OfferRow = {
  id: string
  sort_order: number
  title: string
  description: string
  category: Category
  category_label: string
  emoji: string
  gradient: string
  rating: number
  distance: string | null
  badge: string | null
  price: string | null
  details: string[] | null
  partner: PartnerRow | PartnerRow[] | null
}

type FeatureRow = {
  sort_order: number
  icon: string
  gradient: string
  title: string
  description: string
}

type StepRow = {
  id: number
  sort_order: number
  emoji: string
  title: string
  description: string
}

type TestimonialRow = {
  id: number
  sort_order: number
  name: string
  role: string
  avatar: string
  gradient: string
  rating: number
  text: string
}

const OFFER_SELECT =
  'id,sort_order,title,description,category,category_label,emoji,gradient,rating,distance,badge,price,details,partner:partners(address,latitude,longitude)'

const FEATURE_SELECT = 'sort_order,icon,gradient,title,description'
const STEP_SELECT = 'id,sort_order,emoji,title,description'
const TESTIMONIAL_SELECT = 'id,sort_order,name,role,avatar,gradient,rating,text'

function logQueryError(context: string, error: PostgrestError | null) {
  if (error) {
    console.error(`[Supabase] ${context}: ${error.message}`)
  }
}

function normalizePartner(partner: OfferRow['partner']): PartnerRow | null {
  if (Array.isArray(partner)) {
    return partner[0] ?? null
  }
  return partner
}

function mapOffer(row: OfferRow): Offer {
  const partner = normalizePartner(row.partner)

  const coords: [number, number] | undefined =
    partner?.latitude !== null &&
    partner?.latitude !== undefined &&
    partner?.longitude !== null &&
    partner?.longitude !== undefined
      ? [partner.latitude, partner.longitude]
      : undefined

  return {
    id: row.id,
    title: row.title,
    description: row.description,
    category: row.category,
    categoryLabel: row.category_label,
    emoji: row.emoji,
    gradient: row.gradient,
    rating: row.rating,
    distance: row.distance ?? '—',
    badge: row.badge ?? undefined,
    price: row.price ?? undefined,
    address: partner?.address ?? undefined,
    details: row.details && row.details.length > 0 ? row.details : undefined,
    coords,
  }
}

export async function getOffers(): Promise<Offer[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('offers')
    .select(OFFER_SELECT)
    .order('sort_order', { ascending: true })

  logQueryError('getOffers', error)

  if (!data) {
    return []
  }

  return (data as unknown as OfferRow[]).map(mapOffer)
}

export async function getOfferById(id: string): Promise<Offer | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('offers')
    .select(OFFER_SELECT)
    .eq('id', id)
    .maybeSingle()

  logQueryError('getOfferById', error)

  if (!data) {
    return null
  }

  return mapOffer(data as unknown as OfferRow)
}

export async function getRelatedOffers(category: Category, excludeId: string, limit = 3): Promise<Offer[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('offers')
    .select(OFFER_SELECT)
    .eq('category', category)
    .neq('id', excludeId)
    .order('sort_order', { ascending: true })
    .limit(limit)

  logQueryError('getRelatedOffers', error)

  if (!data) {
    return []
  }

  return (data as unknown as OfferRow[]).map(mapOffer)
}

export async function getFeatures(): Promise<Feature[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('features')
    .select(FEATURE_SELECT)
    .order('sort_order', { ascending: true })

  logQueryError('getFeatures', error)

  if (!data) {
    return []
  }

  return (data as FeatureRow[]).map((row) => ({
    icon: row.icon,
    gradient: row.gradient,
    title: row.title,
    desc: row.description,
  }))
}

export async function getSteps(): Promise<Step[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('steps')
    .select(STEP_SELECT)
    .order('sort_order', { ascending: true })

  logQueryError('getSteps', error)

  if (!data) {
    return []
  }

  return (data as StepRow[]).map((row) => ({
    number: row.id,
    emoji: row.emoji,
    title: row.title,
    desc: row.description,
  }))
}

export async function getTestimonials(): Promise<Testimonial[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('testimonials')
    .select(TESTIMONIAL_SELECT)
    .order('sort_order', { ascending: true })

  logQueryError('getTestimonials', error)

  if (!data) {
    return []
  }

  return (data as TestimonialRow[]).map((row) => ({
    id: row.id,
    name: row.name,
    role: row.role,
    avatar: row.avatar,
    gradient: row.gradient,
    rating: row.rating,
    text: row.text,
  }))
}

export async function getHomePageData() {
  const [offers, features, steps, testimonials] = await Promise.all([
    getOffers(),
    getFeatures(),
    getSteps(),
    getTestimonials(),
  ])

  return {
    offers,
    features,
    steps,
    testimonials,
  }
}