import { SiteHeader } from '@/components/SiteHeader'
import { Hero } from '@/components/Hero'
import { Problem } from '@/components/Problem'
import { HowItWorks } from '@/components/HowItWorks'
import { Features } from '@/components/Features'
import { PromiseBand } from '@/components/PromiseBand'
import { Pricing } from '@/components/Pricing'
import { Faq } from '@/components/Faq'
import { FinalCta } from '@/components/FinalCta'
import { SiteFooter } from '@/components/SiteFooter'

/**
 * The Mera landing page, aimed at makers (MAKER_FIRST_REBUILD.md §1). Each
 * section is its own component and reads its strings from `@/content`.
 */
export default function LandingPage() {
  return (
    <>
      <SiteHeader />
      <main>
        <Hero />
        <Problem />
        <HowItWorks />
        <Features />
        <PromiseBand />
        <Pricing />
        <Faq />
        <FinalCta />
      </main>
      <SiteFooter />
    </>
  )
}
