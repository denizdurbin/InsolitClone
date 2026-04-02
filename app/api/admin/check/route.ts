import { NextResponse } from 'next/server'
import { isAdminEmailServer } from '@/lib/admin-server'

function getAdminEmail(request: Request) {
  const headerEmail = request.headers.get('x-admin-email')
  if (headerEmail) return headerEmail

  try {
    const { email } = Object.fromEntries(new URL(request.url).searchParams)
    if (typeof email === 'string') return email
  } catch {}

  return null
}

export async function GET(request: Request) {
  const email = getAdminEmail(request)
  const authorized = isAdminEmailServer(email)

  return NextResponse.json({ authorized })
}
