/** One subscription plan card. Prices mirror apps/admin/app/subscription. */
export interface PricingPlan {
  name: string
  price: string
  period: string
  body: string
  /** Optional highlight badge, e.g. "2 meseca gratis". */
  badge?: string
  /** The recommended plan gets the filled button and brand border. */
  featured: boolean
}
