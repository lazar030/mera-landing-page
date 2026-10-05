import type { CutPartKey, CutMaterialKey } from './cut-part.interface'

/** Labels for the interactive wall demo in the hero. */
export interface DemoCopy {
  project: string
  scope: string
  tabs: { draw: string; cut: string }
  wallLabel: string
  /** Badge when the fill is exact; `{count}` is replaced. */
  exact: string
  /** Badge when the solver leaves a remainder; `{mm}` is replaced. */
  remainder: string
  customLegend: string
  cutHead: { part: string; dims: string; qty: string }
  parts: Record<CutPartKey, string>
  materials: Record<CutMaterialKey, string>
  stats: { boards: string; edge: string; hardware: string; parts: string }
  total: string
  currency: string
  makePdf: string
  footnote: string
  units: { mm: string; m2: string; m: string; pcs: string }
}
