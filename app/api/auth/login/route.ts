import { NextResponse } from 'next/server'
import { ADMIN_ENV_ERROR_MESSAGE } from '@/utils/supabase/admin'
import {
  SESSION_COOKIE_NAME,
  createSessionForUser,
  findUserByEmail,
  getSessionCookieOptions,
  normalizeEmail,
  toClientAuthUser,
  verifyPassword,
} from '@/lib/custom-auth-server'

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { email?: string; password?: string }

    const email = normalizeEmail(body.email ?? '')
    const password = body.password ?? ''

    if (!email || !password) {
      return NextResponse.json({ message: 'Merci de remplir tous les champs.' }, { status: 400 })
    }

    if (!emailRegex.test(email)) {
      return NextResponse.json({ message: 'Adresse e-mail invalide.' }, { status: 400 })
    }

    const user = await findUserByEmail(email)
    const isPasswordValid = user ? verifyPassword(password, user.password_hash) : false

    if (!user || !isPasswordValid) {
      return NextResponse.json({ message: 'E-mail ou mot de passe incorrect.' }, { status: 401 })
    }

    const { token } = await createSessionForUser(user.id)

    const response = NextResponse.json({ user: toClientAuthUser(user) })
    response.cookies.set(SESSION_COOKIE_NAME, token, getSessionCookieOptions())
    return response
  } catch (error) {
    const message = error instanceof Error && error.message === ADMIN_ENV_ERROR_MESSAGE
      ? ADMIN_ENV_ERROR_MESSAGE
      : 'Impossible de se connecter pour le moment. Reessaie.'

    return NextResponse.json({ message }, { status: 500 })
  }
}
