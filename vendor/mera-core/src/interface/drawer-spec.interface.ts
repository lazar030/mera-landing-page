import type { DrawerBottom, Mm, RunnerType } from '../types'

/**
 * A drawer as entered in the Stolario "Dodaj fioke" form (screen 15). The box
 * that gets cut, the carcass it goes into, an optional front, and the bottom.
 * Pure input to the cut engine (src/cut.ts). All dimensions integer MILLIMETRES.
 */
export interface DrawerSpec {
  name: string
  /** How many identical drawers. */
  quantity: number
  /** Runner type — sets the side clearance between the box and the carcass. */
  runner: RunnerType
  /** Inner carcass width the drawer sits in. */
  carcassWidth: Mm
  /** Carcass depth (for reference / front sizing). */
  carcassDepth: Mm
  /** Box width; when 0, derived as carcassWidth − runner clearance. */
  boxWidth: Mm
  /** Box depth (equals the runner length). */
  boxDepth: Mm
  /** Box side height. */
  boxHeight: Mm
  /** Whether a drawer front is cut with the box. */
  front: boolean
  /** Front height, when `front` is true (defaults to the box height + a margin). */
  frontHeight?: Mm
  /** Bottom material. */
  bottom: DrawerBottom
}
