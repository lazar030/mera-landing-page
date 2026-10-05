import type { NavCopy } from './nav-copy.interface'
import type { HeroCopy } from './hero-copy.interface'
import type { DemoCopy } from './demo-copy.interface'
import type { CopyItem } from './copy-item.interface'
import type { PricingPlan } from './pricing-plan.interface'

/**
 * Every user-facing string on the landing page, for one locale. Components never
 * hold copy; they read it from here, so the v2 i18n pass only adds a dictionary.
 */
export interface LandingCopy {
  meta: {
    /** BCP 47 tag for <html lang>. */
    lang: string
    /** Intl locale for number formatting, e.g. 'sr-RS'. */
    locale: string
    title: string
    description: string
  }
  nav: NavCopy
  hero: HeroCopy
  demo: DemoCopy
  problem: { title: string; body: string }
  how: { eyebrow: string; title: string; steps: CopyItem[] }
  features: {
    eyebrow: string
    title: string
    items: CopyItem[]
    /** Shown under the grid for something announced but not shipped. */
    upcoming: { badge: string; body: string }
  }
  promise: {
    title: string
    /** `title` is the big mono figure, `body` explains it. */
    facts: CopyItem[]
  }
  pricing: { eyebrow: string; title: string; lead: string; choose: string; plans: PricingPlan[] }
  faq: { title: string; items: CopyItem[] }
  finalCta: { title: string; body: string; cta: string }
  footer: { tagline: string; links: { label: string; href: string }[]; copyright: string }
}
