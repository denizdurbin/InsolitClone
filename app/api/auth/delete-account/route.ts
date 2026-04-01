import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { ADMIN_ENV_ERROR_MESSAGE } from '@/utils/supabase/admin'
import {
  SESSION_COOKIE_NAME,
  deleteCurrentUserFromCookie,
  deleteSessionByToken,
  getSessionCookieOptions,
} from '@/lib/custom-auth-server'

export async function POST() {
  try {
    const deleted = await deleteCurrentUserFromCookie()

    const cookieStore = await cookies()
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value ?? null
    await deleteSessionByToken(token)

    const response = NextResponse.json(
      deleted ? { success: true } : { message: 'Utilisateur non authentifie.' },
      deleted ? undefined : { status: 401 }
    )

    response.cookies.set(SESSION_COOKIE_NAME, '', getSessionCookieOptions(0))
    return response
  } catch (error) {
    const message = error instanceof Error && error.message === ADMIN_ENV_ERROR_MESSAGE
      ? ADMIN_ENV_ERROR_MESSAGE
      : 'Impossible de supprimer le compte pour le moment.'

    return NextResponse.json({ message }, { status: 500 })
  }
}
