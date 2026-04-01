import ProfilClient from '@/app/profil/ProfilClient'
import { getOffers } from '@/lib/supabase-data'
import { getCurrentUserFromCookie } from '@/lib/custom-auth-server'
import { redirect } from 'next/navigation'

export default async function ProfilPage() {
  const user = await getCurrentUserFromCookie()

  if (!user) {
    redirect('/connexion')
  }

  const offers = await getOffers()
  const recentPurchases = offers.slice(0, 4)

  return (
    <ProfilClient
      recentPurchases={recentPurchases}
      profile={{
        prenom: user.prenom,
        nom: user.nom,
        email: user.email,
        location: user.location,
        savingsCents: user.savingsCents,
        offersUsed: user.offersUsed,
        reviewsCount: user.reviewsCount,
      }}
    />
  )
}
