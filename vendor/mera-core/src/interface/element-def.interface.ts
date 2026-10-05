import type { CustomWidthPricing, ElementCategory, Mm } from '../types'
import type { ApplianceSlot } from './appliance-slot.interface'

/** A catalog element definition — the template an element is instantiated from. */
export interface ElementDef {
  id: string
  tenantId: string
  furnitureTypeId: string
  name: string
  description?: string
  category: ElementCategory

  /** The standard module grid, e.g. [300, 400, 600, 800, 900]. */
  standardWidths: Mm[]

  /** Hard bounds. Custom widths are allowed only inside these. */
  minWidth: Mm
  maxWidth: Mm
  minHeight: Mm
  maxHeight: Mm
  minDepth: Mm
  maxDepth: Mm

  defaultHeight: Mm
  defaultDepth: Mm

  /** May the customer resize this element off the standard grid? */
  allowCustomWidth: boolean
  /** Increment for a custom width, e.g. 10mm. */
  customWidthStep: Mm
  customWidthPricing: CustomWidthPricing

  /** Set when this element is an appliance slot. */
  applianceSlot?: ApplianceSlot

  /** Option groups this element exposes (material, colour, front style...). */
  optionGroupIds: string[]

  /**
   * Largest single panel this element can be built from, if narrower than the
   * tenant default. Transport and board-size constraints live here.
   */
  maxPanelWidth?: Mm
}
