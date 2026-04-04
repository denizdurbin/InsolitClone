import { NextResponse } from 'next/server'
import { isAdminEmailServer } from '@/lib/admin-server'
import { geocodeAddress } from '@/lib/geocoding'

function getAdminEmail(request: Request) {
  const headerEmail = request.headers.get('x-admin-email')
  if (headerEmail) return headerEmail

  try {
    const { email } = Object.fromEntries(new URL(request.url).searchParams)
    if (typeof email === 'string') return email
  } catch {}

  return null
}

export async function POST(request: Request) {
  const email = getAdminEmail(request)
  if (!isAdminEmailServer(email)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let payload: any
  try {
    payload = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 })
  }

  const address = typeof payload.address === 'string' ? payload.address.trim() : ''
  if (!address) {
    return NextResponse.json({ error: 'Address is required' }, { status: 400 })
  }

  const geocoded = await geocodeAddress(address)
  if (!geocoded) {
    return NextResponse.json({ error: 'Adresse introuvable. Ajoute plus de détails (numéro, ville, code postal, pays).' }, { status: 404 })
  }

  return NextResponse.json(geocoded)
}
