import type { Mm, RowKind } from '../types'
import type { ConfiguredElement } from './configured-element.interface'

/** A horizontal run of elements at one height (base, wall or tall). */
export interface ConfiguredRow {
  id: string
  kind: RowKind
  /** Distance from the floor to the bottom of this row. */
  yOffset: Mm
  /**
   * Whether this row must fill the wall exactly. Base rows normally must;
   * a run of uppers interrupted by a window normally must not.
   */
  spanFullWidth: boolean
  elements: ConfiguredElement[]
}
