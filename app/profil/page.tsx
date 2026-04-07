import ProfilClient from '@/app/profil/ProfilClient'
import { getOffersByIds } from '@/lib/supabase-data'
import { getCurrentUserFromCookie } from '@/lib/custom-auth-server'
import { createAdminClient } from '@/utils/supabase/admin'
import { redirect } from 'next/navigation'
import type { Offer } from '@/lib/data'

export default async function ProfilPage() {
  const user = await getCurrentUserFromCookie()

  if (!user) {
    redirect('/connexion')
  }

  let recentPurchases: Offer[] = []
  try {
    const admin = createAdminClient()
    const { data } = await admin
      .from('favorites')
      .select('offer_id')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(4)

    const favoriteIds = (data ?? []).map((row) => row.offer_id as string)
    recentPurchases = await getOffersByIds(favoriteIds)
  } catch {
    recentPurchases = []
  }

  return (
    <ProfilClient
      recentPurchases={recentPurchases}
      profile={{
        prenom: user.prenom,
        nom: user.nom,
        email: user.email,
        location: user.location,
        birthDate: user.birthDate,
        savingsCents: user.savingsCents,
        offersUsed: user.offersUsed,
        reviewsCount: user.reviewsCount,
      }}
    />
  )
}
