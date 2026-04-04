import NodeGeocoder from 'node-geocoder'

export type GeocodeResult = {
  lat: number
  lng: number
  displayName?: string
}

const geocoder = NodeGeocoder({
  provider: 'openstreetmap',
  httpAdapter: 'https',
})

function toFiniteNumber(value: unknown): number | null {
  const parsed = typeof value === 'string' || typeof value === 'number' ? Number(value) : NaN
  return Number.isFinite(parsed) ? parsed : null
}

export async function geocodeAddress(address: string): Promise<GeocodeResult | null> {
  const query = address.trim()
  if (!query) return null

  try {
    const [result] = await geocoder.geocode(query)
    if (!result) return null

    const lat = toFiniteNumber(result.latitude)
    const lng = toFiniteNumber(result.longitude)

    if (lat === null || lng === null) {
      return null
    }

    return {
      lat,
      lng,
      displayName: result.formattedAddress ?? undefined,
    }
  } catch (error) {
    console.error('[Geocoding] failed', error)
    return null
  }
}
