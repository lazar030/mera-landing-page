import type { ApplianceKind, ElementCategory, Mm } from '../types'

/** One element with absolute geometry, ready for a renderer to draw. */
export interface DerivedElement {
  elementId: string
  rowId: string
  elementDefId: string
  category: ElementCategory
  /** Left edge, measured from the left wall. */
  x: Mm
  /** Bottom edge, measured from the floor. */
  y: Mm
  width: Mm
  height: Mm
  depth: Mm
  /** Resolved material for texturing, when the element selects one. */
  materialId?: string
  label: string
  /** True when this is a reserved opening — renderers draw it as an empty slot. */
  reserved?: boolean
  /** The appliance occupying this slot, if any — renderers draw its symbol. */
  appliance?: ApplianceKind
  /** Whether to draw a handle on the front (see ConfiguredElement.hasHandle). */
  hasHandle?: boolean
}
