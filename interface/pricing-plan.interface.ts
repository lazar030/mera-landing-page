/** One subscription plan card. Prices mirror apps/admin/app/subscription. */
export interface PricingPlan {
  name: string
  price: string
  period: string
  body: string
  badge?: string
  /** The recommended plan is rendered as the dark card. */
  featured: boolean
}
