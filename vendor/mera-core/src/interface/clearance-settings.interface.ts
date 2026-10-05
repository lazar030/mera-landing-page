import type { Mm } from '../types'

/**
 * Workshop clearances and board thickness (Stolario settings, screen 07). Every
 * value is an integer number of MILLIMETRES. These are the small gaps and
 * insets that make a cut list buildable — they feed the cut engine (src/cut.ts)
 * and nothing else.
 */
export interface ClearanceSettings {
  /** Debljina daske — carcass/shelf board thickness. */
  boardThickness: Mm
  /** Zazor polica — gap so a shelf slides between the sides. */
  shelfClearance: Mm
  /** Zazor krila (spoljašnja) — gap between a door and the carcass edge. */
  doorClearanceOuter: Mm
  /** Zazor krila (unutrašnja) — gap between two doors of one element. */
  doorClearanceInner: Mm
  /** Zazor maske — gap left for a filler/mask panel. */
  maskClearance: Mm
  /** Leđa — zazor po strani — the back is inset this much on every side. */
  backClearancePerSide: Mm
  /** Fioka — faz za pod — drawer-bottom groove inset. */
  drawerBottomGroove: Mm
  /** Tip 2 — širina veze — width of each top rail on a Tip-2 base unit. */
  type2RailWidth: Mm
}
