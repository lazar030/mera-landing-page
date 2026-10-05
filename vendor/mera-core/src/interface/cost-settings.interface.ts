import type { Mm } from '../types'

/** How labour is charged: a percentage of the material subtotal, or a flat amount. */
export type LabourMode = 'percent' | 'fixed'

/**
 * A tenant's cost inputs — the prices and rates the calculation multiplies the
 * geometry against. Owned by the maker (one row per tenant), edited in
 * Podešavanja / Materijali.
 *
 * V1 is "mid-depth": single board/front/back prices rather than per-material
 * pricing. Per-material prices are a later refinement behind the same interface.
 */
export interface CostSettings {
  currency: string
  /**
   * Board thickness. Reserved for thickness-aware panel sizing (e.g. subtracting
   * it from interior panels); the mid-depth V1 calc does not yet use it.
   */
  boardThicknessMm: Mm

  /** Carcass board (sides, top, bottom, shelves). */
  carcassPricePerM2: number
  /** Door/front board. */
  frontPricePerM2: number
  /** Back panels. */
  backLesonitPricePerM2: number
  backDecorPricePerM2: number
  /** Worktop slab. */
  worktopPricePerM2: number

  /** Edge banding, priced by the running metre. */
  edgeBandingPricePerM: number

  /** Per-piece hardware prices. */
  hardware: {
    hinge: number
    leg: number
    shelfSupport: number
    handle: number
  }

  /** Labour: a percentage of material+edge, or a fixed amount per element. */
  labour: {
    mode: LabourMode
    value: number
  }
}
