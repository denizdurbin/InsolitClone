import { NextResponse } from 'next/server'
import { getCurrentUserFromCookie } from '@/lib/custom-auth-server'
import { ADMIN_ENV_ERROR_MESSAGE } from '@/utils/supabase/admin'

export async function GET() {
  try {
    const user = await getCurrentUserFromCookie()

    if (!user) {
      return NextResponse.json({ user: null }, { status: 401 })
    }

    return NextResponse.json({ user })
  } catch (error) {
    const message = error instanceof Error && error.message === ADMIN_ENV_ERROR_MESSAGE
      ? ADMIN_ENV_ERROR_MESSAGE
      : 'Impossible de recuperer la session utilisateur.'

    return NextResponse.json({ message, user: null }, { status: 500 })
  }
}
