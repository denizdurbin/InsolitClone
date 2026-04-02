import { NextResponse } from 'next/server'
import { ADMIN_ENV_ERROR_MESSAGE, createAdminClient } from '@/utils/supabase/admin'
import {
  getCurrentUserFromCookie,
  normalizeLocation,
  normalizePersonName,
  toClientAuthUser,
} from '@/lib/custom-auth-server'

export async function PATCH(request: Request) {
  try {
    const currentUser = await getCurrentUserFromCookie()

    if (!currentUser) {
      return NextResponse.json({ message: 'Utilisateur non authentifie.' }, { status: 401 })
    }

    const body = (await request.json()) as {
      prenom?: string
      nom?: string
      location?: string
    }

    const prenom = body.prenom?.trim() ?? ''
    const nom = body.nom?.trim() ?? ''
    const location = body.location?.trim() ?? ''

    if (!prenom || !nom || !location) {
      return NextResponse.json({ message: 'Le prenom, le nom et l adresse sont obligatoires.' }, { status: 400 })
    }

    const admin = createAdminClient()

    const { data, error } = await admin
      .from('users')
      .update({
        prenom: normalizePersonName(prenom),
        nom: normalizePersonName(nom),
        location: normalizeLocation(location),
      })
      .eq('id', currentUser.id)
      .select('id,prenom,nom,email,location,savings_cents,offers_used,reviews_count,password_hash')
      .single()

    if (error || !data) {
      throw new Error('Impossible de mettre a jour le profil.')
    }

    return NextResponse.json({ user: toClientAuthUser(data as Parameters<typeof toClientAuthUser>[0]) })
  } catch (error) {
    const message = error instanceof Error && error.message === ADMIN_ENV_ERROR_MESSAGE
      ? ADMIN_ENV_ERROR_MESSAGE
      : 'Impossible de mettre a jour le profil pour le moment.'

    return NextResponse.json({ message }, { status: 500 })
  }
}
