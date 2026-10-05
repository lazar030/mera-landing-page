import type { Mm } from '../types'
import type { DerivedElement } from './derived-element.interface'
import type { SpaceSpec } from './space-spec.interface'

/** The full geometry the 2D and 3D renderers consume (produced by `derive()`). */
export interface DerivedGeometry {
  space: SpaceSpec
  elements: DerivedElement[]
  /** Widest point actually occupied. */
  totalWidth: Mm
  /** Highest point actually occupied. */
  totalHeight: Mm
}
