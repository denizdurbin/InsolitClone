import { NextResponse } from 'next/server'
import { isAdminEmailServer } from '@/lib/admin-server'
import { createAdminClient } from '@/utils/supabase/admin'

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

  const admin = createAdminClient()
  const { data, error } = await admin
    .from('users')
    .select('id,prenom,nom,email,location,birth_date,savings_cents,offers_used,reviews_count,created_at,updated_at')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('[Supabase] list users', error.message)
    return NextResponse.json({ error: 'Failed to load users' }, { status: 500 })
  }

  return NextResponse.json({ users: data ?? [] })
}
