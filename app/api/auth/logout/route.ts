import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { SESSION_COOKIE_NAME, deleteSessionByToken, getSessionCookieOptions } from '@/lib/custom-auth-server'
import { ADMIN_ENV_ERROR_MESSAGE } from '@/utils/supabase/admin'

export async function POST() {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value ?? null

    await deleteSessionByToken(token)

    const response = NextResponse.json({ success: true })
    response.cookies.set(SESSION_COOKIE_NAME, '', getSessionCookieOptions(0))
    return response
  } catch (error) {
    const message = error instanceof Error && error.message === ADMIN_ENV_ERROR_MESSAGE
      ? ADMIN_ENV_ERROR_MESSAGE
      : 'Impossible de fermer la session pour le moment.'

    return NextResponse.json({ message }, { status: 500 })
  }
}
