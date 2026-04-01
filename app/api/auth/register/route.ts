import { NextResponse } from 'next/server'
import { ADMIN_ENV_ERROR_MESSAGE } from '@/utils/supabase/admin'
import {
  SESSION_COOKIE_NAME,
  createSessionForUser,
  createUser,
  findUserByEmail,
  getSessionCookieOptions,
  hashPassword,
  normalizeEmail,
  toClientAuthUser,
} from '@/lib/custom-auth-server'

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      prenom?: string
      nom?: string
      location?: string
      email?: string
      password?: string
    }

    const prenom = body.prenom?.trim() ?? ''
    const nom = body.nom?.trim() ?? ''
    const location = body.location?.trim() ?? ''
    const email = normalizeEmail(body.email ?? '')
    const password = body.password ?? ''

    if (!prenom || !nom || !location || !email || !password) {
      return NextResponse.json({ message: 'Merci de remplir tous les champs.' }, { status: 400 })
    }

    if (!emailRegex.test(email)) {
      return NextResponse.json({ message: 'Adresse e-mail invalide.' }, { status: 400 })
    }

    if (password.length < 8) {
      return NextResponse.json({ message: 'Mot de passe trop court (8 caracteres minimum).' }, { status: 400 })
    }

    const existingUser = await findUserByEmail(email)
    if (existingUser) {
      return NextResponse.json({ message: 'Un compte existe deja avec cet e-mail.' }, { status: 409 })
    }

    const user = await createUser({
      prenom,
      nom,
      location,
      email,
      passwordHash: hashPassword(password),
    })

    const { token } = await createSessionForUser(user.id)

    const response = NextResponse.json({ user: toClientAuthUser(user) }, { status: 201 })
    response.cookies.set(SESSION_COOKIE_NAME, token, getSessionCookieOptions())
    return response
  } catch (error) {
    const message = error instanceof Error && error.message === ADMIN_ENV_ERROR_MESSAGE
      ? ADMIN_ENV_ERROR_MESSAGE
      : 'Impossible de creer le compte pour le moment. Reessaie.'

    return NextResponse.json({ message }, { status: 500 })
  }
}
