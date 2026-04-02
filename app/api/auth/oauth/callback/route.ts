import { NextRequest, NextResponse } from 'next/server'
import { ADMIN_ENV_ERROR_MESSAGE } from '@/utils/supabase/admin'
import { createClient } from '@/utils/supabase/server'
import {
  SESSION_COOKIE_NAME,
  createOAuthUser,
  createSessionForUser,
  findUserByEmail,
  getSessionCookieOptions,
  normalizeEmail,
  normalizeLocation,
  normalizePersonName,
} from '@/lib/custom-auth-server'

function getSafeRedirectPath(rawNext: string | null) {
  if (!rawNext || !rawNext.startsWith('/')) {
    return '/profil'
  }

  return rawNext
}

function stringValue(value: unknown): string {
  return typeof value === 'string' ? value.trim() : ''
}

function getErrorRedirect(request: NextRequest) {
  const redirectUrl = request.nextUrl.clone()
  redirectUrl.pathname = '/connexion'
  redirectUrl.search = ''
  redirectUrl.searchParams.set('error', 'oauth')
  return redirectUrl
}

export async function GET(request: NextRequest) {
  const nextPath = getSafeRedirectPath(request.nextUrl.searchParams.get('next'))
  const code = request.nextUrl.searchParams.get('code')

  if (!code) {
    return NextResponse.redirect(getErrorRedirect(request))
  }

  try {
    const supabase = await createClient()
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

    if (exchangeError) {
      return NextResponse.redirect(getErrorRedirect(request))
    }

    const { data, error: userError } = await supabase.auth.getUser()
    if (userError || !data.user) {
      return NextResponse.redirect(getErrorRedirect(request))
    }

    const oauthUser = data.user
    const email = normalizeEmail(oauthUser.email ?? '')

    if (!email) {
      return NextResponse.redirect(getErrorRedirect(request))
    }

    const metadata = (oauthUser.user_metadata ?? {}) as Record<string, unknown>
    const givenName = stringValue(metadata.given_name)
    const familyName = stringValue(metadata.family_name)
    const fullName = stringValue(metadata.full_name) || stringValue(metadata.name)
    const nameParts = fullName ? fullName.split(/\s+/).filter(Boolean) : []

    const prenom = normalizePersonName(givenName || nameParts[0] || 'Utilisateur')
    const nom = normalizePersonName(familyName || nameParts.slice(1).join(' ') || 'Insolit')
    const location = normalizeLocation(stringValue(metadata.location) || 'Paris, Ile-de-France')

    let localUser = await findUserByEmail(email)

    if (!localUser) {
      localUser = await createOAuthUser({
        email,
        prenom,
        nom,
        location,
      })
    }

    const { token } = await createSessionForUser(localUser.id)
    const redirectUrl = request.nextUrl.clone()
    redirectUrl.pathname = nextPath
    redirectUrl.search = ''

    const response = NextResponse.redirect(redirectUrl)
    response.cookies.set(SESSION_COOKIE_NAME, token, getSessionCookieOptions())
    return response
  } catch (error) {
    const isEnvIssue = error instanceof Error && error.message === ADMIN_ENV_ERROR_MESSAGE
    if (isEnvIssue) {
      return NextResponse.redirect(getErrorRedirect(request))
    }

    return NextResponse.redirect(getErrorRedirect(request))
  }
}
