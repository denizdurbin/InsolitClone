import { NextResponse } from 'next/server'
import { isAdminEmailServer } from '@/lib/admin-server'
import { getOffers } from '@/lib/supabase-data'
import { computeOfferAnalytics } from '@/lib/admin'

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
  if (!isAdminEmailServer(email)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const offers = await getOffers()
  const analytics = computeOfferAnalytics(offers)

  return NextResponse.json({ analytics })
}
