import type { Mm } from './types'
import type { ClearanceSettings, CostSettings, HardwareQty } from './interface'

/**
 * Hard cap on total furniture height (product spec §6.3 rule 4).
 * Nothing may exceed this regardless of ceiling height.
 */
export const MAX_TOTAL_HEIGHT_MM: Mm = 4000

/**
 * Sensible starting cost inputs for a new tenant / when none are configured yet.
 * A maker overrides these in Podešavanja. Prices are illustrative EUR.
 */
export const DEFAULT_COST_SETTINGS: CostSettings = {
  currency: 'EUR',
  boardThicknessMm: 18,
  carcassPricePerM2: 30,
  frontPricePerM2: 55,
  backLesonitPricePerM2: 8,
  backDecorPricePerM2: 45,
  worktopPricePerM2: 120,
  edgeBandingPricePerM: 1.5,
  hardware: { hinge: 2, leg: 1, shelfSupport: 0.3, handle: 3 },
  labour: { mode: 'percent', value: 30 },
}

/**
 * Default workshop clearances for the cut engine (Stolario screen 07). Values
 * in MILLIMETRES; a maker overrides them in Podešavanja. Provisional until
 * confirmed against the pilot's real joinery.
 */
export const DEFAULT_CLEARANCES: ClearanceSettings = {
  boardThickness: 18,
  shelfClearance: 1,
  doorClearanceOuter: 3,
  doorClearanceInner: 3,
  maskClearance: 3,
  backClearancePerSide: 3,
  drawerBottomGroove: 5,
  type2RailWidth: 80,
}

/** Default fitting counts per element (Stolario screen 07). */
export const DEFAULT_HARDWARE_QTY: HardwareQty = {
  hingesPerDoor: 2,
  supportsPerShelf: 4,
  legsPerElement: 4,
}

/**
 * Default largest single panel a maker can build and transport.
 *
 * Provisional: derived from a standard board (~2800 x 2070 mm). The pilot
 * company still owes us their real transport limit — see open question 1 in
 * 02_TECH_STACK.md. Tenants override this via `Catalog.maxPanelWidth`.
 */
export const DEFAULT_MAX_PANEL_WIDTH_MM: Mm = 2800
export const DEFAULT_MAX_PANEL_HEIGHT_MM: Mm = 2070

/** Default custom-width increment when an element definition omits one. */
export const DEFAULT_CUSTOM_WIDTH_STEP_MM: Mm = 10

/** Standard module grid used to seed a new tenant's catalog. */
export const STANDARD_MODULE_WIDTHS_MM: readonly Mm[] = [300, 400, 450, 500, 600, 800, 900, 1000, 1200]

/** Conventional kitchen heights, in mm. Seed values; tenants may change them. */
export const STANDARD_HEIGHTS = {
  /** Top of the worktop above the floor. */
  worktop: 900,
  /** Carcass height of a base unit (worktop sits on top). */
  baseCarcass: 720,
  /** Gap between worktop and the underside of wall units. */
  splashback: 600,
  /** Carcass height of a wall unit. */
  wallCarcass: 720,
  /** Standard depths. */
  baseDepth: 560,
  wallDepth: 350,
} as const

/** Real widths appliances are actually sold in. Used to seed appliance slots. */
export const APPLIANCE_WIDTHS_MM = {
  oven: [600],
  cooktop: [600, 750, 900],
  dishwasher: [600, 450],
  fridge: [600, 700],
  sink: [600, 800, 900],
  microwave: [600],
  hood: [600, 900],
} as const
