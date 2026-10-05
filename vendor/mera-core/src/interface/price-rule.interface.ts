import type { Mm } from '../types'

/** A price entry. `amount: null` means "on request" — we say so honestly. */
export interface PriceRule {
  id: string
  tenantId: string
  elementDefId: string
  /** Narrow the rule to a specific option value (usually a material). */
  optionValueId?: string | null
  /** Width band this rule covers, inclusive. Null = any width. */
  minWidth?: Mm | null
  maxWidth?: Mm | null
  amount: number | null
  currency: string
}
