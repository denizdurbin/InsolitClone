import { redirect } from 'next/navigation'

export default function ActivitesPage() {
  redirect('/offres?cat=activite')
}
