import { Hero }         from '@/components/sections/Hero'
import { Features }     from '@/components/sections/Features'
import { OffersSection } from '@/components/sections/OffersSection'
import { HowToUse }     from '@/components/sections/HowToUse'
import { Stats }        from '@/components/sections/Stats'
import { Testimonials } from '@/components/sections/Testimonials'

export default function HomePage() {
  return (
    <>
      <Hero />
      <Features />
      <OffersSection />
      <HowToUse />
      <Stats />
      <Testimonials />
    </>
  )
}
