import type { NavCopy } from './nav-copy.interface'
import type { HeroCopy } from './hero-copy.interface'
import type { DemoCopy } from './demo-copy.interface'
import type { HowCopy } from './how-copy.interface'
import type { FeaturesCopy } from './features-copy.interface'
import type { CopyItem } from './copy-item.interface'
import type { PricingPlan } from './pricing-plan.interface'

/**
 * Every user-facing string on the landing page, for one locale. Components never
 * hold copy; the v2 i18n pass only adds a dictionary of this shape.
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
  /** One statement: `lead` in ink, `rest` muted. */
  problem: { lead: string; rest: string }
  how: HowCopy
  features: FeaturesCopy
  promise: { eyebrow: string; title: string; facts: CopyItem[] }
  pricing: {
    eyebrow: string
    title: string
    lead: string
    cta: string
    includedTitle: string
    included: string[]
    plans: PricingPlan[]
  }
  faq: { title: string; aside: string; contact: string; contactSuffix: string; items: CopyItem[] }
  finalCta: {
    title: string
    body: string
    emailLabel: string
    emailPlaceholder: string
    submit: string
    hint: string
    success: string
  }
  footer: { tagline: string; links: { label: string; href: string }[]; copyright: string }
}
