import { Hero }         from '@/components/sections/Hero'
import { Features }     from '@/components/sections/Features'
import { OffersSection } from '@/components/sections/OffersSection'
import { HowToUse }     from '@/components/sections/HowToUse'
import { Stats }        from '@/components/sections/Stats'
import { Testimonials } from '@/components/sections/Testimonials'
import { getHomePageData } from '@/lib/supabase-data'

function buildLocationSuggestions(addresses: Array<string | undefined>): string[] {
  const suggestions = new Set<string>()

  addresses.forEach((address) => {
    if (!address) return

    // Usually matches patterns like "94350 Villiers-sur-Marne" from full addresses.
    const cityMatch = address.match(/\b(\d{5}\s+[\p{L}' -]+)$/u)
    if (cityMatch?.[1]) {
      suggestions.add(cityMatch[1].trim())
      return
    }

    suggestions.add(address)
  })

  return Array.from(suggestions).sort((a, b) => a.localeCompare(b, 'fr'))
}

export default async function HomePage() {
  const { offers, features, steps, testimonials } = await getHomePageData()
  const locationSuggestions = buildLocationSuggestions(offers.map((offer) => offer.address))

  return (
    <>
      <Hero locations={locationSuggestions} />
      <Features features={features} />
      <OffersSection offers={offers} />
      <HowToUse steps={steps} />
      <Stats />
      <Testimonials testimonials={testimonials} />
    </>
  )
}
