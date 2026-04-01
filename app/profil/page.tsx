import ProfilClient from '@/app/profil/ProfilClient'
import { getOffers } from '@/lib/supabase-data'

export default async function ProfilPage() {
  const offers = await getOffers()
  const recentPurchases = offers.slice(0, 4)

  return <ProfilClient recentPurchases={recentPurchases} />
}
