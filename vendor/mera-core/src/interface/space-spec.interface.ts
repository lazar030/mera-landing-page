import type { Mm } from '../types'

/** The physical space the furniture must fit (product spec §6.2 step 2). */
export interface SpaceSpec {
  /** Wall width the furniture must fill exactly. */
  width: Mm
  /** Floor-to-ceiling height available. */
  height: Mm
  /** Depth available. */
  depth: Mm
}
