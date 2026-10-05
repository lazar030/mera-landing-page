import type { ApplianceKind, Mm } from '../types'

/**
 * An appliance slot locks an element to the real sizes appliances come in
 * (product spec §6.3 rule 7). A "600 oven" is 600mm, full stop.
 */
export interface ApplianceSlot {
  kind: ApplianceKind
  /** Exact widths this appliance is available in, e.g. [600, 450]. */
  allowedWidths: Mm[]
}
