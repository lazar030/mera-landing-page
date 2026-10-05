/**
 * Pricing — product spec §6.4.
 *
 * "Show a price where it is known. Where price or availability is unknown,
 *  mark it 'on request'. The total is therefore 'from X + items on request',
 *  labelled honestly."
 *
 * We never invent a number. A missing price rule produces `null`, not a guess.
 * The customer sees the truth and the maker is never held to a price they
 * did not set.
 */

import type { Catalog, Configuration, PriceRule } from './interface'
import { indexCatalog } from './catalog'

export type OnRequestReason =
  | 'customWidth' // resized off the standard grid
  | 'noRule' // the tenant has not priced this element
  | 'noAmount' // a rule exists and deliberately says "ask us"
  | 'unknownDef' // element references a definition we cannot resolve

export interface PriceLine {
  elementId: string
  elementDefId: string
  label: string
  /** null means "on request" — never zero, never a guess. */
  amount: number | null
  reason?: OnRequestReason
}

export interface PriceResult {
  currency: string
  /** Sum of the lines we can actually price. */
  knownTotal: number
  lines: PriceLine[]
  onRequest: PriceLine[]
  /** True when every line has a price, so the total is the real total. */
  complete: boolean
}

export function price(config: Configuration, catalog: Catalog): PriceResult {
  const index = indexCatalog(catalog)
  const lines: PriceLine[] = []

  for (const row of config.rows) {
    for (const element of row.elements) {
      // A reserved opening is customer-supplied — the workshop prices nothing.
      if (element.reserved) continue

      const def = index.elementDef(element.elementDefId)

      if (!def) {
        lines.push({
          elementId: element.id,
          elementDefId: element.elementDefId,
          label: element.elementDefId,
          amount: null,
          reason: 'unknownDef',
        })
        continue
      }

      // A bounded custom size is buildable but usually not quotable from a
      // price list — spec §6.4. Tenants can opt an element out of this.
      if (element.isCustomWidth && def.customWidthPricing === 'onRequest') {
        lines.push({
          elementId: element.id,
          elementDefId: def.id,
          label: def.name,
          amount: null,
          reason: 'customWidth',
        })
        continue
      }

      const optionValueIds = Object.values(element.options)
      const rule = bestRule(catalog.priceRules, def.id, element.width, optionValueIds)

      if (!rule) {
        lines.push({ elementId: element.id, elementDefId: def.id, label: def.name, amount: null, reason: 'noRule' })
        continue
      }
      if (rule.amount === null) {
        lines.push({ elementId: element.id, elementDefId: def.id, label: def.name, amount: null, reason: 'noAmount' })
        continue
      }

      lines.push({ elementId: element.id, elementDefId: def.id, label: def.name, amount: rule.amount })
    }
  }

  const onRequest = lines.filter((l) => l.amount === null)
  const knownTotal = lines.reduce((sum, l) => sum + (l.amount ?? 0), 0)

  return {
    currency: catalog.currency,
    knownTotal,
    lines,
    onRequest,
    complete: onRequest.length === 0,
  }
}

/**
 * Most specific matching rule wins: an option-specific rule beats a generic
 * one, and a narrow width band beats an open one.
 */
function bestRule(
  rules: PriceRule[],
  elementDefId: string,
  width: number,
  optionValueIds: string[],
): PriceRule | undefined {
  const matches = rules.filter((r) => {
    if (r.elementDefId !== elementDefId) return false
    if (r.optionValueId && !optionValueIds.includes(r.optionValueId)) return false
    if (typeof r.minWidth === 'number' && width < r.minWidth) return false
    if (typeof r.maxWidth === 'number' && width > r.maxWidth) return false
    return true
  })

  if (matches.length === 0) return undefined

  return matches.sort((a, b) => specificity(b) - specificity(a))[0]
}

function specificity(rule: PriceRule): number {
  let score = 0
  if (rule.optionValueId) score += 4
  if (typeof rule.minWidth === 'number') score += 1
  if (typeof rule.maxWidth === 'number') score += 1
  return score
}

/** Format for display. Kept here so browser and server agree on the string. */
export function formatPrice(result: PriceResult, locale = 'sr-RS'): string {
  const total = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: result.currency,
    maximumFractionDigits: 0,
  }).format(result.knownTotal)

  if (result.complete) return total
  return `${total} + ${result.onRequest.length} on request`
}
