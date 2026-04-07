import { NextResponse } from 'next/server'
import { getCurrentUserFromCookie } from '@/lib/custom-auth-server'
import { createAdminClient, ADMIN_ENV_ERROR_MESSAGE } from '@/utils/supabase/admin'

type FavoritePayload = {
  offerId?: string
}

export async function GET(request: Request) {
  try {
    const user = await getCurrentUserFromCookie()
    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const url = new URL(request.url)
    const offerId = url.searchParams.get('offerId')?.trim()
    const admin = createAdminClient()

    if (offerId) {
      const { data, error } = await admin
        .from('favorites')
        .select('offer_id')
        .eq('user_id', user.id)
        .eq('offer_id', offerId)
        .maybeSingle()

      if (error) {
        return NextResponse.json({ message: 'Impossible de lire les favoris.' }, { status: 500 })
      }

      return NextResponse.json({ isFavorite: Boolean(data) })
    }

    const { data, error } = await admin
      .from('favorites')
      .select('offer_id')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json({ message: 'Impossible de lire les favoris.' }, { status: 500 })
    }

    return NextResponse.json({
      favorites: (data ?? []).map((row) => row.offer_id),
    })
  } catch (error) {
    const message = error instanceof Error && error.message === ADMIN_ENV_ERROR_MESSAGE
      ? ADMIN_ENV_ERROR_MESSAGE
      : 'Impossible de lire les favoris.'
    return NextResponse.json({ message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUserFromCookie()
    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const body = (await request.json()) as FavoritePayload
    const offerId = body.offerId?.trim()

    if (!offerId) {
      return NextResponse.json({ message: "L'identifiant de l'offre est requis." }, { status: 400 })
    }

    const admin = createAdminClient()

    const { error } = await admin
      .from('favorites')
      .upsert(
        {
          user_id: user.id,
          offer_id: offerId,
        },
        { onConflict: 'user_id,offer_id' }
      )

    if (error) {
      return NextResponse.json({ message: "Impossible d'ajouter aux favoris." }, { status: 500 })
    }

    return NextResponse.json({ success: true }, { status: 201 })
  } catch (error) {
    const message = error instanceof Error && error.message === ADMIN_ENV_ERROR_MESSAGE
      ? ADMIN_ENV_ERROR_MESSAGE
      : "Impossible d'ajouter aux favoris."
    return NextResponse.json({ message }, { status: 500 })
  }
}
