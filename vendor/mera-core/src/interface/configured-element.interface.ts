import type { ApplianceKind, Mm } from '../types'

/** A single element as placed in a configuration (part of the source of truth). */
export interface ConfiguredElement {
  id: string
  elementDefId: string
  width: Mm
  height: Mm
  depth: Mm
  /** True when width is off the standard grid (drives pricing). */
  isCustomWidth: boolean
  /** optionGroupKey -> optionValueId */
  options: Record<string, string>
  /**
   * The appliance this slot represents, when it stands in for one. Drives the
   * symbol the renderers draw (a sink basin, a hob, a fridge…). Orthogonal to
   * `reserved`: a maker-built sink cabinet carries `appliance: 'sink'` AND is
   * built; a customer's fridge carries `appliance: 'fridge'` AND is reserved.
   * Absent on a plain cabinet.
   */
  appliance?: ApplianceKind
  /**
   * Whether the front has a visible handle/pull. Read from a sketch (a drawn
   * pull or knob) or set by the maker; drives whether renderers draw a handle.
   * `undefined` means unspecified — renderers fall back to a per-category
   * default. Not meaningful for worktops or reserved openings.
   */
  hasHandle?: boolean
  /**
   * A reserved opening rather than a built element — an empty slot in the run
   * for something the workshop does NOT make (a fridge, a bought-elsewhere sink,
   * a customer-supplied appliance).
   *
   * It still occupies width, so the run exact-fills the wall and validation
   * passes, but it is not priced (the workshop builds nothing) and its
   * `elementDefId`/`options` are ignored. Only its dimensions and fit are
   * checked.
   */
  reserved?: boolean
  /** Optional human label for a reserved opening, e.g. "Frižider (kupac)". */
  label?: string
}
