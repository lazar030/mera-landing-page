/**
 * @mera/core — shared scalar & union types.
 *
 * Every dimension in Mera is an integer number of MILLIMETRES. No floats, no
 * unit ambiguity, no "is this cm?" bugs six months from now.
 *
 * NOTE: `interface` declarations live in `./interface/*.interface.ts` (see
 * CONVENTIONS.md). This file holds only scalar aliases, unions/enums, and the
 * config schema version — things that are not interfaces.
 */

/** An integer number of millimetres. */
export type Mm = number

/** Schema version of the stored configuration document. Bump deliberately. */
export const CONFIG_SCHEMA_VERSION = 1 as const
export type ConfigSchemaVersion = typeof CONFIG_SCHEMA_VERSION

/** Categories of catalog element. */
export type ElementCategory =
  | 'base' // floor-standing units (cabinets under a worktop)
  | 'wall' // upper units
  | 'tall' // full-height units (pantry, oven housing)
  | 'appliance' // an appliance slot rather than a built cabinet
  | 'worktop' // horizontal surface spanning base units

/** Kinds of appliance an appliance slot can hold. */
export type ApplianceKind =
  | 'oven'
  | 'cooktop'
  | 'dishwasher'
  | 'fridge'
  | 'sink'
  | 'microwave'
  | 'washer'
  | 'hood'

/**
 * How an element is priced when the customer resizes it off the standard grid.
 * The pilot company can build bounded custom sizes, but usually cannot quote
 * them from a price list — hence the default.
 */
export type CustomWidthPricing = 'onRequest' | 'priced'

/**
 * A kind of unit a vision model can spot in a kitchen elevation. The raw read
 * from a photo/sketch — `sketchToElements` maps these to maker `ElementSpec`s.
 */
export type SketchElementType =
  | 'cabinet' // a plain base or wall cabinet
  | 'sink'
  | 'oven'
  | 'cooktop'
  | 'dishwasher'
  | 'fridge' // free-standing, customer-supplied → skipped (nothing to cut)
  | 'washer' // washing machine — also customer-supplied
  | 'hood'

/** Which stack a configured row belongs to. */
export type RowKind = 'base' | 'wall' | 'tall'

/* -------------------------------------------------------------------------- */
/* Maker cut/cost engine (Stolario-style workshop). See src/cut.ts.           */

/**
 * Carcass joint type — how the top/bottom relate to the sides. Drives which
 * panels overlap which, hence panel sizes.
 *   1 — sides full height; top & bottom sit BETWEEN them.
 *   2 — base unit: sides + bottom full; the top is two rails (veza), no plafon.
 *   3 — top & bottom full width; sides sit BETWEEN them.
 */
export type JointType = 1 | 2 | 3

/** How many hinged fronts an element has. */
export type DoorMode = 'none' | 'single' | 'double'

/** The kind of back panel (drives which board and whether it is priced). */
export type BackKind = 'none' | 'lesonit' | 'decor'

/** What a cut panel is, for the cut list. */
export type PanelRole =
  | 'side'
  | 'topbottom'
  | 'rail'
  | 'shelf'
  | 'divider'
  | 'back'
  | 'door'
  | 'drawerSide'
  | 'drawerFrontBack'
  | 'drawerBottom'
  | 'board'

/** Drawer runner type — sets the side clearance between box and carcass. */
export type RunnerType = 'teleskop' | 'podgradni'

/** Drawer bottom material. */
export type DrawerBottom = 'full' | 'lesonit'

/** Which material-price bucket a panel draws from. */
export type PanelMaterial = 'carcass' | 'shelf' | 'door' | 'back'

/** Which edge-banding price bucket a banded edge draws from. */
export type EdgeBucket = 'carcass' | 'shelf' | 'door'
