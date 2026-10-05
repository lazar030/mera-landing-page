import type { Mm } from '@mera/core'

/** One cabinet in the demo elevation, as placed by the exact-fill solver. */
export interface WallModule {
  width: Mm
  /** True when the solver pushed this unit off the standard grid to close the gap. */
  isCustomWidth: boolean
  /** Wide units get a pair of doors. */
  doubleDoor: boolean
}
