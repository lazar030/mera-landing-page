import type { EdgeBucket, Mm, PanelMaterial, PanelRole } from '../types'

/**
 * One row of the cut list: a rectangular panel to be cut, with the length of
 * banded edge it carries. Produced by cutElement(); consumed by the cost step
 * and, later, the cutting optimiser. All dimensions integer MILLIMETRES.
 */
export interface CutPanel {
  role: PanelRole
  /** Serbian label for the cut list (e.g. "Bok", "Polica", "Krilo"). */
  label: string
  /** Long dimension (grain runs along it when `grain` is true). */
  length: Mm
  /** Short dimension. */
  width: Mm
  /** How many identical panels. */
  quantity: number
  /** Whether the material has a grain direction that constrains rotation. */
  grain: boolean
  /** Which area-price bucket this panel bills to. */
  material: PanelMaterial
  /** Total banded edge length on ONE such panel (0 if none). */
  bandedLength: Mm
  /** Which edge-price bucket the banding bills to (null when unbanded). */
  edgeBucket: EdgeBucket | null
}
