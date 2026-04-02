import { NextResponse } from 'next/server'
import { ADMIN_ENV_ERROR_MESSAGE } from '@/utils/supabase/admin'
import {
  getCurrentUserFromCookie,
  isAtLeast16YearsOld,
  isValidIsoDate,
  normalizePersonName,
} from '@/lib/custom-auth-server'
import { createAdminClient } from '@/utils/supabase/admin'

export async function PATCH(request: Request) {
  try {
    const currentUser = await getCurrentUserFromCookie()

    if (!currentUser) {
      return NextResponse.json({ message: 'Utilisateur non connecte.' }, { status: 401 })
    }

    const body = (await request.json()) as {
      prenom?: string
      nom?: string
      birthDate?: string
    }

    const prenom = body.prenom?.trim() ?? ''
    const nom = body.nom?.trim() ?? ''
    const birthDate = body.birthDate?.trim() ?? ''

    if (!prenom || !nom || !birthDate) {
      return NextResponse.json({ message: 'Merci de remplir tous les champs.' }, { status: 400 })
    }

    if (!isValidIsoDate(birthDate)) {
      return NextResponse.json({ message: 'Date de naissance invalide.' }, { status: 400 })
    }

    if (!isAtLeast16YearsOld(birthDate)) {
      return NextResponse.json({ message: 'Ce service est reserve aux 16 ans et plus.' }, { status: 400 })
    }

    const admin = createAdminClient()

    const { data, error } = await admin
      .from('users')
      .update({
        prenom: normalizePersonName(prenom),
        nom: normalizePersonName(nom),
        birth_date: birthDate,
      })
      .eq('id', currentUser.id)
      .select('id,prenom,nom,email,location,birth_date,savings_cents,offers_used,reviews_count,password_hash')
      .single()

    if (error || !data) {
      return NextResponse.json({ message: 'Impossible de mettre a jour le profil.' }, { status: 500 })
    }

    return NextResponse.json({
      user: {
        id: data.id,
        prenom: data.prenom,
        nom: data.nom,
        email: data.email,
        location: data.location,
        birthDate: data.birth_date,
        savingsCents: data.savings_cents,
        offersUsed: data.offers_used,
        reviewsCount: data.reviews_count,
      },
    })
  } catch (error) {
    const message = error instanceof Error && error.message === ADMIN_ENV_ERROR_MESSAGE
      ? ADMIN_ENV_ERROR_MESSAGE
      : 'Impossible de mettre a jour le profil pour le moment.'

    return NextResponse.json({ message }, { status: 500 })
  }
}
