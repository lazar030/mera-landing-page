/** What kind of back panel an element has (drives which board and its price). */
export type BackPanel = 'none' | 'lesonit' | 'decor'

/**
 * The production attributes of a configured element that the geometry does not
 * capture but the cost calculation needs: how many doors and shelves it has,
 * its back panel, and whether it stands on legs.
 *
 * Defaulted from the element's category and overridable per element, so the
 * calculation stays accurate without forcing the maker to fill a long form
 * (Open/Closed: richer specs — joint types, drawers — extend this later).
 */
export interface ProductionSpec {
  /** Number of hinged doors/fronts (0, 1 or 2 for a normal carcass). */
  doors: number
  /** Number of internal shelves. */
  shelves: number
  /** Back panel type. */
  backPanel: BackPanel
  /** Whether the element stands on adjustable legs (4 per element). */
  hasLegs: boolean
}
