import { CATEGORIES, type Category } from '@/lib/data'
import { getOffers } from '@/lib/supabase-data'
import { OffresClient } from '@/app/offres/OffresClient'

type Filter = 'all' | Category

interface OffresPageProps {
  searchParams?: {
    cat?: string | string[]
  }
}

function normalizeFilter(value: string | string[] | undefined): Filter {
  const candidate = Array.isArray(value) ? value[0] : value

  if (candidate && CATEGORIES.includes(candidate as Category)) {
    return candidate as Category
  }

  return 'all'
}

export default async function OffresPage({ searchParams }: OffresPageProps) {
  const offers = await getOffers()
  const initialFilter = normalizeFilter(searchParams?.cat)

  return <OffresClient offers={offers} initialFilter={initialFilter} />
}
