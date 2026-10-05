import type { Mm } from '@mera/core'
import type { WallModule } from './wall-module.interface'

/**
 * Result of the hero demo for one wall width: the solver's layout plus an
 * illustrative cost breakdown. Not a real quote — see lib/wall-estimate.ts.
 */
export interface WallEstimate {
  modules: WallModule[]
  exact: boolean
  remainder: Mm
  boardsM2: number
  edgeM: number
  hardwarePcs: number
  /** Money amounts in RSD, unrounded. */
  labour: number
  total: number
}
