import type { Mm } from '@mera/core'
import type { WallModule } from './wall-module.interface'
import type { CutPart } from './cut-part.interface'

/**
 * Result of the hero demo for one wall width: the solver's layout, a cut list
 * and an illustrative cost breakdown. Not a real quote — see lib/wall-estimate.ts.
 */
export interface WallEstimate {
  modules: WallModule[]
  exact: boolean
  remainder: Mm
  cutList: CutPart[]
  partCount: number
  boardsM2: number
  edgeM: number
  hardwarePcs: number
  /** RSD, unrounded. */
  labour: number
  total: number
}
