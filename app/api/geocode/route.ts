import { NextResponse } from 'next/server'
import { geocodeAddress } from '@/lib/geocoding'

export async function POST(request: Request) {
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
    return NextResponse.json({ error: 'Adresse introuvable' }, { status: 404 })
  }

  return NextResponse.json(geocoded)
}
