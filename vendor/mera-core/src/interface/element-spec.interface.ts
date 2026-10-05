import type { BackKind, DoorMode, JointType, Mm } from '../types'

/**
 * A maker's element as entered in the Stolario-style form (screen 14): the
 * carcass to cut, with its joint type, openings, shelves and back. Pure input
 * to the cut engine (src/cut.ts) — no prices here; those come from CutPrices.
 *
 * Outer dimensions are the finished carcass envelope in MILLIMETRES.
 */
export interface ElementSpec {
  name: string
  jointType: JointType
  /** Outer carcass height. */
  height: Mm
  /** Outer carcass width. */
  width: Mm
  /** Outer carcass depth. */
  depth: Mm
  /** Number of (movable) shelves. */
  shelves: number
  /** Shelf depth; defaults to a small setback from the carcass depth. */
  shelfDepth?: Mm
  /** A shelf fixed into the carcass rather than on supports (no shelf pins). */
  fixedShelf?: boolean
  /** Number of vertical dividers (pregradni zid). */
  dividers: number
  /** Door configuration on the front. */
  doors: DoorMode
  /** Back panel kind. */
  back: BackKind
  /** Whether the element stands on adjustable legs. */
  legs: boolean
  /** How many identical elements this row represents. */
  count: number
}
