/**
 * The cost calculation's output contract — the mirror of `ValidationResult`.
 *
 * The UI renders the breakdown from these typed lines without knowing any of the
 * formulas. `kind` is the stable machine value the UI localises and groups by;
 * `label` is a developer-facing fallback.
 */
export type CostKind = 'material' | 'edge' | 'hardware' | 'labour'

export type CostUnit = 'm2' | 'm' | 'piece' | 'element'

export interface CostLine {
  kind: CostKind
  /** Developer-facing label; the UI localises from `kind`. */
  label: string
  quantity: number
  unit: CostUnit
  unitPrice: number
  amount: number
}

export interface CostBreakdown {
  currency: string
  lines: CostLine[]
  /** Subtotals by kind. */
  material: number
  edge: number
  hardware: number
  labour: number
  /** material + edge + hardware + labour. */
  total: number
}
