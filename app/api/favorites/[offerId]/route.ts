import { NextResponse } from 'next/server'
import { getCurrentUserFromCookie } from '@/lib/custom-auth-server'
import { createAdminClient, ADMIN_ENV_ERROR_MESSAGE } from '@/utils/supabase/admin'

export async function DELETE(_request: Request, { params }: { params: { offerId: string } }) {
  try {
    const user = await getCurrentUserFromCookie()
    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const offerId = params.offerId?.trim()
    if (!offerId) {
      return NextResponse.json({ message: "L'identifiant de l'offre est requis." }, { status: 400 })
    }

    const admin = createAdminClient()
    const { error } = await admin
      .from('favorites')
      .delete()
      .eq('user_id', user.id)
      .eq('offer_id', offerId)

    if (error) {
      return NextResponse.json({ message: 'Impossible de supprimer le favori.' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    const message = error instanceof Error && error.message === ADMIN_ENV_ERROR_MESSAGE
      ? ADMIN_ENV_ERROR_MESSAGE
      : 'Impossible de supprimer le favori.'
    return NextResponse.json({ message }, { status: 500 })
  }
}
