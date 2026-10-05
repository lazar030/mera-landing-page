/**
 * The exact-fill solver — product spec §6.3 rule 2, and the single most
 * important algorithm in Mera.
 *
 *   "Σ element widths MUST equal the wall width exactly — no leftover space.
 *    Fill with standard modules, then absorb the remaining millimetres by
 *    resizing an element to a custom width, within its min/max bounds."
 *
 * Deliberately NOT a general bin-packing solver. It is a greedy standard-module
 * fill followed by a bounded absorb pass, which is what a workshop actually
 * does. If the pilot company's real kitchens break it, we revisit — see open
 * question 1 in 02_TECH_STACK.md §14.
 */

import type { Mm } from './types'
import type { ElementDef } from './interface'
import { issue, type ValidationIssue } from './errors'
import { DEFAULT_CUSTOM_WIDTH_STEP_MM } from './constants'

export interface FillSlot {
  elementDefId: string
  width: Mm
  /** True when the width was pushed off the standard grid to close the gap. */
  isCustomWidth: boolean
}

export interface FillResult {
  slots: FillSlot[]
  /** Millimetres that could not be absorbed. Zero on success. */
  remainder: Mm
  /** True when the slots sum exactly to the target. */
  exact: boolean
  issues: ValidationIssue[]
}

export interface FillOptions {
  /**
   * Preference when several standard modules fit. 'widest' produces fewer,
   * larger units (cheaper to build); 'narrowest' produces more, smaller ones.
   */
  prefer?: 'widest' | 'narrowest'
  /** Cap on how many modules we will place. Guards against absurd inputs. */
  maxSlots?: number
  /**
   * Force absorbed widths onto the element's `customWidthStep` grid.
   *
   * Default false, deliberately. A wall is 3925mm whether we like it or not,
   * and a workshop cuts a panel to any millimetre — so exact fill wins over
   * grid tidiness. The step is a UI increment for customer-driven resizing.
   *
   * Set true only if the pilot company tells us their saw/edging really is
   * step-constrained (product spec §9 open question 2). When true, a leftover
   * smaller than the step becomes an honest error rather than a silent misfit.
   */
  snapCustomToStep?: boolean
}

interface Candidate {
  def: ElementDef
  width: Mm
}

export function exactFill(
  targetWidth: Mm,
  defs: ElementDef[],
  options: FillOptions = {},
): FillResult {
  const prefer = options.prefer ?? 'widest'
  const maxSlots = options.maxSlots ?? 64
  const issues: ValidationIssue[] = []

  if (!Number.isFinite(targetWidth) || targetWidth <= 0) {
    return {
      slots: [],
      remainder: 0,
      exact: false,
      issues: [issue('SPACE_INVALID', `Target width ${targetWidth} is not a positive number.`)],
    }
  }

  // Every (definition, standard width) pair we are allowed to place.
  const candidates: Candidate[] = []
  for (const def of defs) {
    for (const width of def.standardWidths) {
      if (width > 0) candidates.push({ def, width })
    }
  }

  if (candidates.length === 0) {
    // No standard grid at all — the only hope is one bounded custom element.
    const custom = defs.find(
      (d) => d.allowCustomWidth && targetWidth >= d.minWidth && targetWidth <= d.maxWidth,
    )
    if (custom) {
      return {
        slots: [{ elementDefId: custom.id, width: targetWidth, isCustomWidth: true }],
        remainder: 0,
        exact: true,
        issues,
      }
    }
    return {
      slots: [],
      remainder: targetWidth,
      exact: false,
      issues: [issue('FILL_NO_CANDIDATES', 'No element definition can fill this width.', { params: { targetWidth } })],
    }
  }

  candidates.sort((a, b) => (prefer === 'widest' ? b.width - a.width : a.width - b.width))
  const smallest = Math.min(...candidates.map((c) => c.width))

  // --- Pass 1: greedy standard-module fill --------------------------------
  const slots: FillSlot[] = []
  let remaining = targetWidth

  while (remaining >= smallest && slots.length < maxSlots) {
    const pick = candidates.find((c) => c.width <= remaining)
    if (!pick) break
    slots.push({ elementDefId: pick.def.id, width: pick.width, isCustomWidth: false })
    remaining -= pick.width
  }

  if (remaining === 0) {
    return { slots, remainder: 0, exact: true, issues }
  }

  // --- Pass 2: absorb the remainder into bounded custom widths ------------
  // Widen from the right, because the rightmost unit is the one a fitter
  // would scribe to the wall in practice.
  const defsById = new Map(defs.map((d) => [d.id, d]))
  const snap = options.snapCustomToStep ?? false
  let unabsorbed = remaining

  const headroomOf = (slot: FillSlot): number => {
    const def = defsById.get(slot.elementDefId)
    if (!def || !def.allowCustomWidth) return 0
    return Math.max(0, def.maxWidth - slot.width)
  }
  const stepOf = (slot: FillSlot): number => {
    const def = defsById.get(slot.elementDefId)
    const step = def?.customWidthStep ?? 0
    return step > 0 ? step : DEFAULT_CUSTOM_WIDTH_STEP_MM
  }

  // Preferred outcome: one element takes the whole gap. Fewer odd sizes on the
  // cutting list, and it matches how a fitter actually scribes a run.
  for (let i = slots.length - 1; i >= 0; i--) {
    const slot = slots[i]!
    const take = snap ? unabsorbed - (unabsorbed % stepOf(slot)) : unabsorbed
    if (take === unabsorbed && take > 0 && headroomOf(slot) >= take) {
      slot.width += take
      slot.isCustomWidth = true
      unabsorbed = 0
      break
    }
  }

  // Fallback: spread the gap across several elements, right to left.
  for (let i = slots.length - 1; i >= 0 && unabsorbed > 0; i--) {
    const slot = slots[i]!
    const headroom = headroomOf(slot)
    if (headroom <= 0) continue

    let take = Math.min(unabsorbed, headroom)
    if (snap) take -= take % stepOf(slot)
    if (take <= 0) continue

    slot.width += take
    slot.isCustomWidth = true
    unabsorbed -= take
  }

  if (unabsorbed === 0) {
    return { slots, remainder: 0, exact: true, issues }
  }

  // --- Nothing worked -----------------------------------------------------
  // Almost always because the leftover is smaller than the smallest custom
  // step. Product spec §9 open question 2 covers what the pilot company wants
  // here (a scribe filler? round the space? refuse?). Until they answer, we
  // refuse loudly rather than silently building something that will not fit.
  issues.push(
    issue(
      'FILL_REMAINDER_UNABSORBABLE',
      `${unabsorbed}mm could not be absorbed into any element within its bounds.`,
      { params: { remainder: unabsorbed, targetWidth } },
    ),
  )

  return { slots, remainder: unabsorbed, exact: false, issues }
}

/** Sum of a fill result, for assertions and tests. */
export function fillWidth(result: FillResult): Mm {
  return result.slots.reduce((sum, s) => sum + s.width, 0)
}
