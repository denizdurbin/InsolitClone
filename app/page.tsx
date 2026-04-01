import { Hero }         from '@/components/sections/Hero'
import { Features }     from '@/components/sections/Features'
import { OffersSection } from '@/components/sections/OffersSection'
import { HowToUse }     from '@/components/sections/HowToUse'
import { Stats }        from '@/components/sections/Stats'
import { Testimonials } from '@/components/sections/Testimonials'
import { getHomePageData } from '@/lib/supabase-data'

export default async function HomePage() {
  const { offers, features, steps, testimonials } = await getHomePageData()

  return (
    <>
      <Hero />
      <Features features={features} />
      <OffersSection offers={offers} />
      <HowToUse steps={steps} />
      <Stats />
      <Testimonials testimonials={testimonials} />
    </>
  )
}
