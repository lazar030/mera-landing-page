/**
 * Auto-layout — product spec §6.2 step 3.
 *
 * "System proposes a sensible layout of elements filling the space; customer
 *  adjusts." A proposal the customer edits beats an empty canvas they fill from
 *  scratch.
 *
 * This is a KITCHEN COMPOSER, not just a wall-filler. For a catalog that offers
 * them, it intersperses appliances (sink, dishwasher, oven) among base
 * cabinets, lays a worktop over the base run, and places a hood in the wall row
 * above the oven. It stays general: any piece the catalog does not offer is
 * simply skipped, so a bare catalog degrades to a plain module fill.
 *
 * Two invariants it must never break:
 *   1. DETERMINISTIC — same space + same catalog ⇒ identical layout, ids and
 *      all. No randomness, no clock.
 *   2. VALID — the configuration it returns must pass `validate()` (once the UI
 *      fills option defaults). Every row exact-fills, every row shares one
 *      height, nothing exceeds its bounds or the transport limit.
 */

import type {
  Catalog,
  Configuration,
  ConfiguredElement,
  ConfiguredRow,
  ElementDef,
  SpaceSpec,
} from './interface'
import type { ApplianceKind, Mm } from './types'
import { CONFIG_SCHEMA_VERSION } from './types'
import { STANDARD_HEIGHTS, MAX_TOTAL_HEIGHT_MM } from './constants'
import { exactFill } from './fill'
import { indexCatalog, panelWidthLimit, type CatalogIndex } from './catalog'
import type { ValidationIssue } from './errors'

export interface AutoLayoutOptions {
  furnitureTypeId: string
  /** Include a row of wall units above the worktop when there is room. */
  includeWallRow?: boolean
  /** Lay a worktop over the base run when the catalog offers one. */
  includeWorktop?: boolean
  /** Intersperse appliance slots (sink, dishwasher, oven) in the base run. */
  includeAppliances?: boolean
  prefer?: 'widest' | 'narrowest'
}

export interface AutoLayoutResult {
  configuration: Configuration
  issues: ValidationIssue[]
}

/**
 * Appliances we try to place in the base run.
 *
 * The array order is the left→right order in the finished run. `keep` ranks
 * which appliances survive when the wall is too narrow to fit them all: the
 * sink is kept first, then the oven, and the dishwasher is dropped first.
 */
const BASE_APPLIANCE_PLAN: { kind: ApplianceKind; preferredWidth: Mm; keep: number }[] = [
  { kind: 'sink', preferredWidth: 800, keep: 3 },
  { kind: 'dishwasher', preferredWidth: 600, keep: 1 },
  { kind: 'oven', preferredWidth: 600, keep: 2 },
]

/** A concrete element the composer has decided to place, before it gets an id. */
interface Placed {
  def: ElementDef
  width: Mm
  isCustomWidth: boolean
}

export function autoLayout(
  space: SpaceSpec,
  catalog: Catalog,
  options: AutoLayoutOptions,
): AutoLayoutResult {
  const index = indexCatalog(catalog)
  const issues: ValidationIssue[] = []
  const rows: ConfiguredRow[] = []

  const prefer = options.prefer ?? 'widest'
  const defsFor = (category: ElementDef['category']): ElementDef[] =>
    catalog.elementDefs.filter(
      (d) => d.furnitureTypeId === options.furnitureTypeId && d.category === category,
    )

  // A "filler" is a plain cabinet with no appliance slot — the thing exact-fill
  // uses to close gaps. Appliance slots are placed deliberately, not as filler.
  const baseFillerDefs = defsFor('base').filter((d) => !d.applianceSlot)
  const wallFillerDefs = defsFor('wall').filter((d) => !d.applianceSlot)
  const appliancePool = catalog.elementDefs.filter(
    (d) => d.furnitureTypeId === options.furnitureTypeId && d.applianceSlot,
  )

  // --- Base row -----------------------------------------------------------
  let ovenCenterX: Mm | null = null
  if (baseFillerDefs.length > 0) {
    const placed = composeBaseRun(space.width, baseFillerDefs, appliancePool, {
      prefer,
      includeAppliances: options.includeAppliances ?? true,
      issues,
    })
    ovenCenterX = centerXOfKind(placed, 'oven')
    rows.push(placedRow('row-base', 'base', 0, placed, space))
  }

  // --- Worktop over the base run ------------------------------------------
  const worktopDef = defsFor('worktop')[0]
  if ((options.includeWorktop ?? true) && baseFillerDefs.length > 0 && worktopDef) {
    const worktopRow = buildWorktopRow(worktopDef, index, space)
    if (worktopRow) rows.push(worktopRow)
  }

  // --- Wall row -----------------------------------------------------------
  const wallOffset = STANDARD_HEIGHTS.worktop + STANDARD_HEIGHTS.splashback
  const roomAbove = Math.min(space.height, MAX_TOTAL_HEIGHT_MM) - wallOffset
  const wantWallRow = options.includeWallRow ?? true

  if (wantWallRow && wallFillerDefs.length > 0 && roomAbove >= STANDARD_HEIGHTS.wallCarcass) {
    const hoodDef = appliancePool.find((d) => d.applianceSlot?.kind === 'hood')
    const placed = composeWallRun(space.width, wallFillerDefs, hoodDef, ovenCenterX, {
      prefer,
      includeAppliances: options.includeAppliances ?? true,
      issues,
    })
    rows.push(placedRow('row-wall', 'wall', wallOffset, placed, space))
  }

  return {
    configuration: {
      schemaVersion: CONFIG_SCHEMA_VERSION,
      tenantId: index.catalog.tenantId,
      furnitureTypeId: options.furnitureTypeId,
      space,
      rows,
    },
    issues,
  }
}

/* -------------------------------------------------------------------------- */
/*  Base run — appliances interspersed with cabinets                          */
/* -------------------------------------------------------------------------- */

function composeBaseRun(
  wall: Mm,
  fillerDefs: ElementDef[],
  appliancePool: ElementDef[],
  ctx: { prefer: 'widest' | 'narrowest'; includeAppliances: boolean; issues: ValidationIssue[] },
): Placed[] {
  const smallestFiller = Math.min(
    ...fillerDefs.flatMap((d) => d.standardWidths.filter((w) => w > 0)),
  )

  // Reserve appliance slots, dropping the lowest-`keep` ones until the leftover
  // is either zero or wide enough for at least one filler cabinet.
  let features: Placed[] = ctx.includeAppliances ? planBaseAppliances(appliancePool) : []
  const reservedOf = (list: Placed[]) => list.reduce((sum, f) => sum + f.width, 0)

  while (features.length > 0) {
    const remaining = wall - reservedOf(features)
    if (remaining === 0 || remaining >= smallestFiller) break
    features = dropLowestKeep(features)
  }

  const remaining = wall - reservedOf(features)
  const fillers = remaining > 0 ? fillBase(remaining, fillerDefs, ctx) : []

  return interleave(fillers, features)
}

/** One appliance per available kind, at a buildable width, in plan order. */
function planBaseAppliances(pool: ElementDef[]): Placed[] {
  const placed: Placed[] = []
  for (const entry of BASE_APPLIANCE_PLAN) {
    const def = pool.find((d) => d.applianceSlot?.kind === entry.kind)
    if (!def) continue
    placed.push({ def, width: featureWidth(def, entry.preferredWidth), isCustomWidth: false })
  }
  return placed
}

/** Drop the surviving appliance with the lowest keep-rank. */
function dropLowestKeep(features: Placed[]): Placed[] {
  const keepOf = (f: Placed) =>
    BASE_APPLIANCE_PLAN.find((p) => p.kind === f.def.applianceSlot?.kind)?.keep ?? 0
  let worst = 0
  for (let i = 1; i < features.length; i++) {
    if (keepOf(features[i]!) < keepOf(features[worst]!)) worst = i
  }
  return features.filter((_, i) => i !== worst)
}

function fillBase(
  width: Mm,
  fillerDefs: ElementDef[],
  ctx: { prefer: 'widest' | 'narrowest'; issues: ValidationIssue[] },
): Placed[] {
  const byId = new Map(fillerDefs.map((d) => [d.id, d]))
  const fill = exactFill(width, fillerDefs, { prefer: ctx.prefer })
  ctx.issues.push(...fill.issues)
  return fill.slots.map((slot) => ({
    def: byId.get(slot.elementDefId)!,
    width: slot.width,
    isCustomWidth: slot.isCustomWidth,
  }))
}

/**
 * Distribute filler cabinets into the gaps around the appliances, so the run
 * reads as `[cabinets] sink [cabinets] dishwasher [cabinets] oven [cabinets]`.
 * Remainder cabinets go to the leftmost gaps, deterministically.
 */
function interleave(fillers: Placed[], features: Placed[]): Placed[] {
  if (features.length === 0) return fillers

  const gaps = features.length + 1
  const per = Math.floor(fillers.length / gaps)
  let extra = fillers.length - per * gaps

  const out: Placed[] = []
  let fi = 0
  for (let g = 0; g < gaps; g++) {
    let count = per + (extra > 0 ? 1 : 0)
    if (extra > 0) extra--
    for (let c = 0; c < count && fi < fillers.length; c++) out.push(fillers[fi++]!)
    if (g < features.length) out.push(features[g]!)
  }
  while (fi < fillers.length) out.push(fillers[fi++]!) // safety
  return out
}

/* -------------------------------------------------------------------------- */
/*  Wall run — cabinets with a hood aligned over the oven                      */
/* -------------------------------------------------------------------------- */

function composeWallRun(
  wall: Mm,
  fillerDefs: ElementDef[],
  hoodDef: ElementDef | undefined,
  ovenCenterX: Mm | null,
  ctx: { prefer: 'widest' | 'narrowest'; includeAppliances: boolean; issues: ValidationIssue[] },
): Placed[] {
  const byId = new Map(fillerDefs.map((d) => [d.id, d]))
  const smallestFiller = Math.min(
    ...fillerDefs.flatMap((d) => d.standardWidths.filter((w) => w > 0)),
  )

  const hoodWidth = hoodDef ? featureWidth(hoodDef, 600) : 0
  const wantHood = ctx.includeAppliances && !!hoodDef && wall - hoodWidth >= smallestFiller

  const fillWidth = wantHood ? wall - hoodWidth : wall
  const fill = exactFill(fillWidth, fillerDefs, { prefer: ctx.prefer })
  ctx.issues.push(...fill.issues)
  const fillers: Placed[] = fill.slots.map((slot) => ({
    def: byId.get(slot.elementDefId)!,
    width: slot.width,
    isCustomWidth: slot.isCustomWidth,
  }))

  if (!wantHood || !hoodDef) return fillers

  // Insert the hood at the cabinet boundary whose centre sits closest to the
  // oven's centre, so the extractor lands above the hob.
  const target = (ovenCenterX ?? wall / 2) - hoodWidth / 2
  let bestIndex = 0
  let bestDelta = Infinity
  let cum = 0
  for (let i = 0; i <= fillers.length; i++) {
    const delta = Math.abs(cum - target)
    if (delta < bestDelta) {
      bestDelta = delta
      bestIndex = i
    }
    if (i < fillers.length) cum += fillers[i]!.width
  }

  const hood: Placed = { def: hoodDef, width: hoodWidth, isCustomWidth: false }
  return [...fillers.slice(0, bestIndex), hood, ...fillers.slice(bestIndex)]
}

/* -------------------------------------------------------------------------- */
/*  Worktop                                                                    */
/* -------------------------------------------------------------------------- */

/**
 * A worktop spanning the base run, sitting directly on the base carcasses.
 *
 * A worktop is jointed on site, so a run wider than a single transportable
 * panel is split into equal segments that each fit the cap — the engine never
 * proposes a piece that would fail the transport-limit rule. Returns null when
 * even the minimum piece could not be built.
 */
function buildWorktopRow(
  def: ElementDef,
  index: CatalogIndex,
  space: SpaceSpec,
): ConfiguredRow | null {
  const total = space.width
  const maxPiece = Math.min(def.maxWidth, panelWidthLimit(def, index))
  if (maxPiece < def.minWidth) return null

  const pieces = splitSpan(total, maxPiece)
  if (pieces.some((w) => w < def.minWidth)) return null

  const height = clamp(def.defaultHeight, def.minHeight, def.maxHeight)
  const depth = clamp(Math.min(space.depth, def.defaultDepth), def.minDepth, def.maxDepth)

  const elements: ConfiguredElement[] = pieces.map((width, i) => ({
    id: `row-worktop-e${i + 1}`,
    elementDefId: def.id,
    width,
    height,
    depth,
    isCustomWidth: !def.standardWidths.includes(width),
    options: {},
  }))

  return {
    id: 'row-worktop',
    kind: 'base',
    yOffset: STANDARD_HEIGHTS.baseCarcass,
    spanFullWidth: true,
    elements,
  }
}

/**
 * Split `total` into the fewest equal-as-possible integer segments that each
 * fit within `maxPiece`. The parts always sum back to `total` exactly, so the
 * worktop row still fills the wall.
 */
function splitSpan(total: Mm, maxPiece: Mm): Mm[] {
  const count = Math.max(1, Math.ceil(total / maxPiece))
  const base = Math.floor(total / count)
  let remainder = total - base * count
  const parts: Mm[] = []
  for (let i = 0; i < count; i++) {
    // Hand the leftover millimetres to the leftmost pieces, one each.
    parts.push(base + (remainder > 0 ? 1 : 0))
    if (remainder > 0) remainder--
  }
  return parts
}

/* -------------------------------------------------------------------------- */
/*  Shared helpers                                                             */
/* -------------------------------------------------------------------------- */

/** Turn a list of placed pieces into a row, assigning stable `${id}-e{n}` ids. */
function placedRow(
  id: string,
  kind: ConfiguredRow['kind'],
  yOffset: Mm,
  placed: Placed[],
  space: SpaceSpec,
): ConfiguredRow {
  const elements: ConfiguredElement[] = placed.map((p, i) => ({
    id: `${id}-e${i + 1}`,
    elementDefId: p.def.id,
    width: p.width,
    height: clamp(p.def.defaultHeight, p.def.minHeight, p.def.maxHeight),
    depth: clamp(Math.min(space.depth, p.def.defaultDepth), p.def.minDepth, p.def.maxDepth),
    isCustomWidth: p.isCustomWidth,
    options: {},
  }))

  return { id, kind, yOffset, spanFullWidth: true, elements }
}

/** The centre x (from the left wall) of the first placed element of a kind. */
function centerXOfKind(placed: Placed[], kind: ApplianceKind): Mm | null {
  let x = 0
  for (const p of placed) {
    if (p.def.applianceSlot?.kind === kind) return x + p.width / 2
    x += p.width
  }
  return null
}

/** A buildable width for an appliance slot: the preferred one if allowed. */
function featureWidth(def: ElementDef, preferred: Mm): Mm {
  const allowed = (def.applianceSlot?.allowedWidths ?? def.standardWidths).filter(
    (w) => w >= def.minWidth && w <= def.maxWidth,
  )
  if (allowed.includes(preferred)) return preferred
  return allowed[0] ?? def.minWidth
}

function clamp(value: number, min?: number, max?: number): number {
  let out = value
  if (typeof min === 'number') out = Math.max(out, min)
  if (typeof max === 'number') out = Math.min(out, max)
  return out
}
