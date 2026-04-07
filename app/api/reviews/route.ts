import { NextResponse } from 'next/server'
import type { Review } from '@/lib/data'
import { getCurrentUserFromCookie } from '@/lib/custom-auth-server'
import { ADMIN_ENV_ERROR_MESSAGE, createAdminClient } from '@/utils/supabase/admin'

interface InsertedReviewRow {
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

export async function POST(request: Request) {
  try {
    const currentUser = await getCurrentUserFromCookie()

    if (!currentUser) {
      return NextResponse.json({ message: 'Utilisateur non connecte.' }, { status: 401 })
    }

    const body = (await request.json()) as {
      offerId?: string
      rating?: number
      title?: string
      text?: string
    }

    const offerId = body.offerId?.trim() ?? ''
    const title = body.title?.trim() ?? ''
    const text = body.text?.trim() ?? ''
    const rating = Number(body.rating)

    if (!offerId || !title || !text) {
      return NextResponse.json({ message: 'Merci de remplir tous les champs.' }, { status: 400 })
    }

    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      return NextResponse.json({ message: 'La note doit etre comprise entre 1 et 5.' }, { status: 400 })
    }

    if (title.length > 120) {
      return NextResponse.json({ message: 'Le titre est trop long (120 caracteres max).' }, { status: 400 })
    }

    if (text.length > 1000) {
      return NextResponse.json({ message: 'Le commentaire est trop long (1000 caracteres max).' }, { status: 400 })
    }

    const admin = createAdminClient()

    const { data: offer, error: offerError } = await admin
      .from('offers')
      .select('id,title')
      .eq('id', offerId)
      .maybeSingle()

    if (offerError || !offer) {
      return NextResponse.json({ message: 'Offre introuvable.' }, { status: 404 })
    }

    const userNameSnapshot = `${currentUser.prenom} ${currentUser.nom}`.trim() || currentUser.email

    const { data: inserted, error: insertError } = await admin
      .from('reviews')
      .insert({
        user_id: currentUser.id,
        user_name_snapshot: userNameSnapshot,
        user_email_snapshot: currentUser.email,
        offer_id: offer.id,
        offer_title_snapshot: offer.title,
        rating,
        title,
        text,
      })
      .select('id,user_id,user_name_snapshot,user_email_snapshot,offer_id,offer_title_snapshot,rating,title,text,created_at')
      .single()

    if (insertError || !inserted) {
      return NextResponse.json({ message: 'Impossible de publier le commentaire.' }, { status: 500 })
    }

    const { count } = await admin
      .from('reviews')
      .select('id', { head: true, count: 'exact' })
      .eq('user_id', currentUser.id)

    if (typeof count === 'number') {
      await admin
        .from('users')
        .update({ reviews_count: count })
        .eq('id', currentUser.id)
    }

    const row = inserted as InsertedReviewRow
    const review: Review = {
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

    return NextResponse.json({ review }, { status: 201 })
  } catch (error) {
    const message = error instanceof Error && error.message === ADMIN_ENV_ERROR_MESSAGE
      ? ADMIN_ENV_ERROR_MESSAGE
      : 'Impossible de publier le commentaire pour le moment.'

    return NextResponse.json({ message }, { status: 500 })
  }
}
