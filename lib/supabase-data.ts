import type { PostgrestError } from '@supabase/supabase-js'
import type { Category, Feature, Offer, Review, Step, Testimonial } from '@/lib/data'
import { createClient } from '@/utils/supabase/server'

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
  address: string | null
  details: string[] | null
  latitude: number | null
  longitude: number | null
  partner: {
    address: string | null
    latitude: number | null
    longitude: number | null
  } | Array<{
    address: string | null
    latitude: number | null
    longitude: number | null
  }> | null
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

type ReviewRow = {
  id: number
  user_id: string | null
  user_name_snapshot: string
  user_email_snapshot: string
  offer_id: string | null
  offer_title_snapshot: string
  rating: number
  title: string
  text: string
  created_at: string
}

const OFFER_SELECT =
  'id,sort_order,title,description,category,category_label,emoji,gradient,rating,distance,badge,price,address,details,latitude,longitude,partner:partners!offers_partner_id_fkey(address,latitude,longitude)'

const FEATURE_SELECT = 'sort_order,icon,gradient,title,description'
const STEP_SELECT = 'id,sort_order,emoji,title,description'
const TESTIMONIAL_SELECT = 'id,sort_order,name,role,avatar,gradient,rating,text'
const REVIEW_SELECT = 'id,user_id,user_name_snapshot,user_email_snapshot,offer_id,offer_title_snapshot,rating,title,text,created_at'

function logQueryError(context: string, error: PostgrestError | null) {
  if (error) {
    console.error(`[Supabase] ${context}: ${error.message}`)
  }
}

function getPartnerLocation(row: OfferRow) {
  if (!row.partner) return null
  return Array.isArray(row.partner) ? (row.partner[0] ?? null) : row.partner
}

function mapOffer(row: OfferRow): Offer {
  const partner = getPartnerLocation(row)

  const latitude = row.latitude ?? partner?.latitude ?? null
  const longitude = row.longitude ?? partner?.longitude ?? null
  const coords: [number, number] | undefined =
    latitude !== null && longitude !== null ? [latitude, longitude] : undefined

  const address = row.address ?? partner?.address ?? undefined

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
    address,
    details: row.details && row.details.length > 0 ? row.details : undefined,
    coords,
  }
}

function mapReview(row: ReviewRow): Review {
  return {
    id: row.id,
    userId: row.user_id,
    userName: row.user_name_snapshot,
    userEmail: row.user_email_snapshot,
    offerId: row.offer_id,
    offerTitle: row.offer_title_snapshot,
    rating: row.rating,
    title: row.title,
    text: row.text,
    createdAt: row.created_at,
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

  return (data as OfferRow[]).map(mapOffer)
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

  return mapOffer(data as OfferRow)
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

  return (data as OfferRow[]).map(mapOffer)
}

export async function getOffersByIds(ids: string[]): Promise<Offer[]> {
  if (ids.length === 0) {
    return []
  }

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('offers')
    .select(OFFER_SELECT)
    .in('id', ids)

  logQueryError('getOffersByIds', error)

  if (!data) {
    return []
  }

  const offers = (data as OfferRow[]).map(mapOffer)
  const order = new Map(ids.map((id, index) => [id, index]))
  return offers.sort((left, right) => (order.get(left.id) ?? Number.MAX_SAFE_INTEGER) - (order.get(right.id) ?? Number.MAX_SAFE_INTEGER))
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

export async function getReviewsByUserId(userId: string, limit = 20): Promise<Review[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('reviews')
    .select(REVIEW_SELECT)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit)

  logQueryError('getReviewsByUserId', error)

  if (!data) {
    return []
  }

  return (data as ReviewRow[]).map(mapReview)
}

export async function getReviewsForOffer(offerId: string, limit = 20): Promise<Review[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('reviews')
    .select(REVIEW_SELECT)
    .eq('offer_id', offerId)
    .order('created_at', { ascending: false })
    .limit(limit)

  logQueryError('getReviewsForOffer', error)

  if (!data) {
    return []
  }

  return (data as ReviewRow[]).map(mapReview)
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
