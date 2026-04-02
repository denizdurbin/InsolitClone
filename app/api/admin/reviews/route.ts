import { NextResponse } from 'next/server'
import { isAdminEmailServer } from '@/lib/admin-server'
import { createAdminClient } from '@/utils/supabase/admin'

function getAdminEmail(request: Request) {
  const headerEmail = request.headers.get('x-admin-email')
  if (headerEmail) return headerEmail

  try {
    const { email } = Object.fromEntries(new URL(request.url).searchParams)
    if (typeof email === 'string') return email
  } catch {}

  return null
}

type UserRow = {
  id: string
  prenom: string
  nom: string
  email: string
  location: string
  birth_date: string | null
  savings_cents: number
  offers_used: number
  reviews_count: number
  created_at: string
  updated_at: string
}

type OfferRow = {
  id: string
  title: string
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

export async function GET(request: Request) {
  const email = getAdminEmail(request)
  if (!isAdminEmailServer(email)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const admin = createAdminClient()
  const { data: reviews, error } = await admin
    .from('reviews')
    .select('id,user_id,user_name_snapshot,user_email_snapshot,offer_id,offer_title_snapshot,rating,title,text,created_at')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('[Supabase] list reviews', error.message)
    return NextResponse.json({ error: 'Failed to load reviews' }, { status: 500 })
  }

  const reviewRows = (reviews ?? []) as ReviewRow[]
  const userIds = Array.from(new Set(reviewRows.map((review) => review.user_id).filter((value): value is string => Boolean(value))))
  const offerIds = Array.from(new Set(reviewRows.map((review) => review.offer_id).filter((value): value is string => Boolean(value))))

  const [{ data: users }, { data: offers }] = await Promise.all([
    userIds.length > 0
      ? admin.from('users').select('id,prenom,nom,email,location,birth_date,savings_cents,offers_used,reviews_count,created_at,updated_at').in('id', userIds)
      : Promise.resolve({ data: [] as UserRow[] }),
    offerIds.length > 0
      ? admin.from('offers').select('id,title').in('id', offerIds)
      : Promise.resolve({ data: [] as OfferRow[] }),
  ])

  const usersById = new Map((users ?? []).map((user) => [user.id, user]))
  const offersById = new Map((offers ?? []).map((offer) => [offer.id, offer]))

  const payload = reviewRows.map((review) => {
    const author = review.user_id ? usersById.get(review.user_id) : null
    const offer = review.offer_id ? offersById.get(review.offer_id) : null

    return {
      id: review.id,
      rating: review.rating,
      title: review.title,
      text: review.text,
      createdAt: review.created_at,
      author: author
        ? {
            id: author.id,
            prenom: author.prenom,
            nom: author.nom,
            email: author.email,
            location: author.location,
            birthDate: author.birth_date,
            savingsCents: author.savings_cents,
            offersUsed: author.offers_used,
            reviewsCount: author.reviews_count,
            created_at: author.created_at,
            updated_at: author.updated_at,
          }
        : {
            id: review.user_id,
            prenom: review.user_name_snapshot.split(' ')[0] ?? review.user_name_snapshot,
            nom: review.user_name_snapshot.split(' ').slice(1).join(' '),
            email: review.user_email_snapshot,
            location: '—',
            birthDate: null,
            savingsCents: 0,
            offersUsed: 0,
            reviewsCount: 0,
          },
      offer: {
        id: review.offer_id,
        title: offer?.title ?? review.offer_title_snapshot,
      },
    }
  })

  return NextResponse.json({ reviews: payload })
}
