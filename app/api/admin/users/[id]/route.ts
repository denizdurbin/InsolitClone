import { NextResponse } from 'next/server'
import { isAdminEmailServer } from '@/lib/admin-server'
import { createAdminClient } from '@/utils/supabase/admin'
import { isAtLeast16YearsOld, isValidIsoDate, normalizeEmail, normalizePersonName } from '@/lib/custom-auth-server'

function getAdminEmail(request: Request) {
  const headerEmail = request.headers.get('x-admin-email')
  if (headerEmail) return headerEmail

  try {
    const { email } = Object.fromEntries(new URL(request.url).searchParams)
    if (typeof email === 'string') return email
  } catch {}

  return null
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const email = getAdminEmail(request)
  if (!isAdminEmailServer(email)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let payload: { prenom?: string; nom?: string; email?: string; location?: string; birthDate?: string }
  try {
    payload = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 })
  }

  const updates: Record<string, string> = {}

  if (typeof payload.prenom === 'string') updates.prenom = normalizePersonName(payload.prenom)
  if (typeof payload.nom === 'string') updates.nom = normalizePersonName(payload.nom)
  if (typeof payload.location === 'string') updates.location = payload.location.trim()

  if (typeof payload.email === 'string') {
    const normalized = normalizeEmail(payload.email)
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) {
      return NextResponse.json({ error: 'Invalid email' }, { status: 400 })
    }
    updates.email = normalized
  }

  if (typeof payload.birthDate === 'string') {
    const birthDate = payload.birthDate.trim()
    if (!isValidIsoDate(birthDate)) {
      return NextResponse.json({ error: 'Invalid birth date' }, { status: 400 })
    }
    if (!isAtLeast16YearsOld(birthDate)) {
      return NextResponse.json({ error: 'User must be 16+' }, { status: 400 })
    }
    updates.birth_date = birthDate
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'No fields to update' }, { status: 400 })
  }

  const admin = createAdminClient()

  if (updates.email) {
    const { data: existing } = await admin
      .from('users')
      .select('id')
      .eq('email', updates.email)
      .neq('id', params.id)
      .maybeSingle()

    if (existing) {
      return NextResponse.json({ error: 'Email already used' }, { status: 409 })
    }
  }

  const { data, error } = await admin
    .from('users')
    .update(updates)
    .eq('id', params.id)
    .select('id,prenom,nom,email,location,birth_date,savings_cents,offers_used,reviews_count,created_at,updated_at')
    .maybeSingle()

  if (error || !data) {
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 })
  }

  return NextResponse.json({ user: data })
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const email = getAdminEmail(request)
  if (!isAdminEmailServer(email)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const admin = createAdminClient()
  await admin.from('user_sessions').delete().eq('user_id', params.id)
  const { error } = await admin.from('users').delete().eq('id', params.id)

  if (error) {
    return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
