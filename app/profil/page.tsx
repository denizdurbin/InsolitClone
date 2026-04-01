import ProfilClient from '@/app/profil/ProfilClient'
import { getOffers } from '@/lib/supabase-data'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

type UserProfileRow = {
  id: string
  prenom: string
  nom: string
  email: string
  location: string
  savings_cents: number
  offers_used: number
  reviews_count: number
}

export default async function ProfilPage() {
  const supabase = await createClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    redirect('/connexion')
  }

  const { data: profileData } = await supabase
    .from('users')
    .select('id,prenom,nom,email,location,savings_cents,offers_used,reviews_count')
    .eq('id', user.id)
    .maybeSingle()

  const row = profileData as UserProfileRow | null
  const prenom = row?.prenom?.trim() || ((user.user_metadata?.prenom as string | undefined)?.trim() ?? 'Utilisateur')
  const nom = row?.nom?.trim() || ((user.user_metadata?.nom as string | undefined)?.trim() ?? '')
  const email = row?.email ?? user.email ?? ''

  const offers = await getOffers()
  const recentPurchases = offers.slice(0, 4)

  return (
    <ProfilClient
      recentPurchases={recentPurchases}
      profile={{
        prenom,
        nom,
        email,
        location: row?.location ?? 'Argenteuil, Ile-de-France',
        savingsCents: row?.savings_cents ?? 0,
        offersUsed: row?.offers_used ?? 0,
        reviewsCount: row?.reviews_count ?? 0,
      }}
    />
  )
}
