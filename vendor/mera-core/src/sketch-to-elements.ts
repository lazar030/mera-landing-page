import { STANDARD_HEIGHTS } from './constants'
import type { ApplianceKind, DoorMode, SketchElementType } from './types'
import type {
  ElementSpec,
  SketchElement,
  SketchElementDraft,
  SketchExtraction,
  SketchSkip,
  SketchToElementsOptions,
  SketchToElementsResult,
} from './interface'

/**
 * Turn a vision model's read of a kitchen elevation into draft maker elements.
 *
 * One drawn unit → one draft `ElementSpec`, in order (base run then wall run),
 * pre-filled with sensible carcass defaults the maker then confirms and edits.
 * Free-standing appliances the workshop does not build (fridge, washer) are
 * reported separately in `skipped` rather than turned into a carcass.
 *
 * Pure and deterministic: same read, same drafts — the vision call that produced
 * the extraction is I/O and lives in the app layer, never here.
 */
export function sketchToElements(
  extraction: SketchExtraction,
  options: SketchToElementsOptions = {},
): SketchToElementsResult {
  const opt = withDefaults(options)
  const drafts: SketchElementDraft[] = []
  const skipped: SketchSkip[] = []

  for (const item of extraction.base ?? []) collect(item, 'base', opt, drafts, skipped)
  for (const item of extraction.wall ?? []) collect(item, 'wall', opt, drafts, skipped)

  return { drafts, skipped, wallWidthMm: normalizeWall(extraction.wallWidthMm) }
}

/* -------------------------------------------------------------------------- */

type Run = 'base' | 'wall'
type ResolvedDefaults = ReturnType<typeof withDefaults>

/** Map one read unit into either a draft or a skip, appending to the right list. */
function collect(
  item: SketchElement,
  run: Run,
  opt: ResolvedDefaults,
  drafts: SketchElementDraft[],
  skipped: SketchSkip[],
): void {
  const free = FREESTANDING[item.type]
  if (free) {
    skipped.push(free)
    return
  }

  const d = run === 'wall' ? opt.wall : opt.base
  const width = plausibleWidth(item.widthMm) ? Math.round(item.widthMm) : opt.defaultWidth
  const spec: ElementSpec = {
    name: displayName(item.type, run),
    jointType: 1,
    height: d.height,
    width,
    depth: d.depth,
    shelves: d.shelves,
    dividers: 0,
    doors: doorModeFor(item.type, width, opt.doubleDoorFromWidth),
    back: 'lesonit',
    legs: d.legs,
    count: 1,
  }
  const appliance = APPLIANCE_OF[item.type]
  drafts.push(appliance ? { spec, run, appliance } : { spec, run })
}

/** Appliances that stand on their own — the customer supplies them, nothing to cut. */
const FREESTANDING: Partial<Record<SketchElementType, SketchSkip>> = {
  fridge: { appliance: 'fridge', label: 'Frižider (kupac)' },
  washer: { appliance: 'washer', label: 'Veš mašina (kupac)' },
}

/** Sketch symbols carried onto the draft for the UI. cabinet has no symbol. */
const APPLIANCE_OF: Partial<Record<SketchElementType, ApplianceKind>> = {
  sink: 'sink',
  oven: 'oven',
  dishwasher: 'dishwasher',
  cooktop: 'cooktop',
  hood: 'hood',
}

/** Housings whose front is the appliance itself, not a built door. */
const NO_DOOR: Partial<Record<SketchElementType, true>> = { oven: true, dishwasher: true, hood: true }

function displayName(type: SketchElementType, run: Run): string {
  switch (type) {
    case 'sink':
      return 'Sudopera'
    case 'oven':
      return 'Rerna'
    case 'dishwasher':
      return 'Sudo-mašina'
    case 'hood':
      return 'Aspirator'
    default:
      // cabinet, and a cooktop (a hob sitting on a plain base cabinet)
      return run === 'wall' ? 'Gornji element' : 'Donji element'
  }
}

function doorModeFor(type: SketchElementType, width: number, doubleFrom: number): DoorMode {
  if (NO_DOOR[type]) return 'none'
  return width >= doubleFrom ? 'double' : 'single'
}

/** A width is trusted from the read only when it is a plausible cabinet size. */
function plausibleWidth(w: number | null): w is number {
  return typeof w === 'number' && Number.isFinite(w) && w >= 100 && w <= 2000
}

/** Keep the read wall width only when it is a plausible run; else null. */
function normalizeWall(w: number | null): number | null {
  return typeof w === 'number' && Number.isFinite(w) && w >= 1000 && w <= 8000 ? Math.round(w) : null
}

function withDefaults(o: SketchToElementsOptions) {
  return {
    base: {
      height: o.baseHeight ?? STANDARD_HEIGHTS.baseCarcass,
      depth: o.baseDepth ?? STANDARD_HEIGHTS.baseDepth,
      shelves: 1,
      legs: true,
    },
    wall: {
      height: o.wallHeight ?? STANDARD_HEIGHTS.wallCarcass,
      depth: o.wallDepth ?? STANDARD_HEIGHTS.wallDepth,
      shelves: 2,
      legs: false,
    },
    defaultWidth: o.defaultWidth ?? 600,
    doubleDoorFromWidth: o.doubleDoorFromWidth ?? 900,
  }
}
