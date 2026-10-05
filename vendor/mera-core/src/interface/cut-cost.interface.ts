import type { CutPanel } from './cut-panel.interface'

/**
 * The prices the cut engine bills against — area by m², edge by the metre,
 * hardware by the piece. Filled from a material configuration or per element.
 */
export interface CutPrices {
  carcassPerM2: number
  shelfPerM2: number
  doorPerM2: number
  backPerM2: number
  edgeCarcassPerM: number
  edgeShelfPerM: number
  edgeDoorPerM: number
  hinge: number
  shelfSupport: number
  leg: number
  /** Price of one drawer runner pair. */
  runner: number
}

/** How many of each fitting an element needs (Stolario settings, screen 07). */
export interface HardwareQty {
  hingesPerDoor: number
  supportsPerShelf: number
  legsPerElement: number
}

/** Labour: a percentage of material + edge, or a fixed amount per element. */
export interface LabourSetting {
  mode: 'percent' | 'fixed'
  value: number
}

/** One line of an itemised cost. */
export interface CutCostLine {
  label: string
  amount: number
}

/** The cost of a single built element (before multiplying by count). */
export interface ElementCost {
  material: number
  edge: number
  hardware: number
  labour: number
  total: number
  lines: CutCostLine[]
}

/** Everything the engine derives for one element row of a project. */
export interface ElementCutResult {
  /** The cut list for ONE element. */
  panels: CutPanel[]
  /** How many identical elements this row is. */
  count: number
  /** Cost of one element. */
  unitCost: ElementCost
  /** Cost of the whole row (unitCost × count), rounded per subtotal. */
  cost: ElementCost
}
