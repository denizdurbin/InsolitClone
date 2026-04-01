import LieuxClient from '@/app/lieux/LieuxClient'
import { getOffers } from '@/lib/supabase-data'

export default async function LieuxPage() {
  const offers = await getOffers()

  return <LieuxClient offers={offers} />
}
