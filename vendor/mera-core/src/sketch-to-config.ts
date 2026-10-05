import { CONFIG_SCHEMA_VERSION, type ApplianceKind, type SketchElementType } from './types'
import { STANDARD_HEIGHTS } from './constants'
import type {
  Catalog,
  Configuration,
  ConfiguredElement,
  ConfiguredRow,
  ElementDef,
  SketchElement,
  SketchExtraction,
  SpaceSpec,
} from './interface'

/**
 * Turn a vision model's loose read of a sketch into a BUILDABLE configuration.
 *
 * The read gives us the wall width, which appliances are present, and their
 * rough left-to-right order. We map those to the tenant's real catalog and use
 * the exact-fill solver for the cabinets between them, so every row fills the
 * wall exactly and the result always validates. It resembles the sketch and is
 * fully editable — the customer refines from there.
 */
export function sketchToConfig(
  extraction: SketchExtraction,
  catalog: Catalog,
  furnitureTypeId: string,
): Configuration {
  const defsFor = (category: ElementDef['category']) =>
    catalog.elementDefs.filter((d) => d.furnitureTypeId === furnitureTypeId && d.category === category)

  const baseFillers = defsFor('base').filter((d) => !d.applianceSlot)
  const wallFillers = defsFor('wall').filter((d) => !d.applianceSlot)
  const worktopDef = defsFor('worktop')[0]
  const applianceByKind = new Map(
    catalog.elementDefs
      .filter((d) => d.furnitureTypeId === furnitureTypeId && d.applianceSlot)
      .map((d) => [d.applianceSlot!.kind, d] as const),
  )

  const width = resolveWallWidth(extraction)
  const space: SpaceSpec = { width, height: 2600, depth: 600 }
  const rows: ConfiguredRow[] = []

  // --- Base run -----------------------------------------------------------
  if (baseFillers.length > 0) {
    const elements = buildRow('row-base', extraction.base, width, baseFillers, space, catalog.maxPanelWidth, (item) =>
      baseFeature(item, width, applianceByKind),
    )
    if (elements.length > 0) rows.push({ id: 'row-base', kind: 'base', yOffset: 0, spanFullWidth: true, elements })
  }

  // --- Worktop ------------------------------------------------------------
  if (worktopDef && rows.length > 0) {
    const worktop = buildWorktop(worktopDef, catalog, space)
    if (worktop) rows.push(worktop)
  }

  // --- Wall run (only if the sketch shows upper units) --------------------
  if (wallFillers.length > 0 && extraction.wall.length > 0) {
    const elements = buildRow('row-wall', extraction.wall, width, wallFillers, space, catalog.maxPanelWidth, (item) =>
      wallFeature(item, applianceByKind),
    )
    if (elements.length > 0) {
      rows.push({
        id: 'row-wall',
        kind: 'wall',
        yOffset: STANDARD_HEIGHTS.worktop + STANDARD_HEIGHTS.splashback,
        spanFullWidth: true,
        elements,
      })
    }
  }

  return {
    schemaVersion: CONFIG_SCHEMA_VERSION,
    tenantId: catalog.tenantId,
    furnitureTypeId,
    space,
    rows,
  }
}

/* -------------------------------------------------------------------------- */

type Feature =
  | { kind: 'def'; def: ElementDef; width: number; appliance?: ApplianceKind }
  | { kind: 'reserved'; width: number; label: string; appliance?: ApplianceKind }

/**
 * A resolved plan for one sketch item, in order:
 *  - `feature` — a fixed-width appliance housing or a reserved placeholder.
 *  - `cabinet` — a flexible-width cabinet that shares the leftover wall. It may
 *    still carry an appliance symbol (a hob sits ON a cabinet) and a handle.
 */
type Plan =
  | { role: 'feature'; feature: Feature }
  | { role: 'cabinet'; appliance?: ApplianceKind; hasHandle?: boolean }

/**
 * Build one row, PRESERVING the sketch's unit count and order.
 *
 * Each drawn block becomes one element: appliances/openings keep their fixed
 * width, and the remaining wall is shared across the cabinets the sketch showed.
 * The sketch's cabinet count is the FLOOR — we only add cabinets when the
 * leftover would otherwise force one wider than the filler can be built or
 * transported, and only trim when the pieces would fall below the minimum. So
 * six drawn blocks stay six blocks; the widths are a starting point the maker
 * refines. The row always fills the wall exactly and always validates.
 */
function buildRow(
  rowId: string,
  items: SketchElement[],
  wall: number,
  fillerDefs: ElementDef[],
  space: SpaceSpec,
  catalogMaxPanel: number,
  getFeature: (item: SketchElement) => Feature | null,
): ConfiguredElement[] {
  const filler = fillerDefs[0]!
  const rowHeight = clamp(filler.defaultHeight, filler.minHeight, filler.maxHeight)
  const rowDepth = clamp(Math.min(space.depth, filler.defaultDepth), filler.minDepth, filler.maxDepth)

  // Classify every item, preserving order. A fixed feature (appliance housing or
  // reserved placeholder) keeps its width; anything else is a flexible cabinet.
  // A cooktop is a hob sitting on a base cabinet, so it stays a cabinet but
  // carries the 'cooktop' symbol — never a second oven.
  const plans: Plan[] = items.map((item) => {
    const feature = getFeature(item)
    if (feature) return { role: 'feature', feature }
    return {
      role: 'cabinet',
      appliance: item.type === 'cooktop' ? 'cooktop' : undefined,
      hasHandle: item.hasHandle ?? undefined,
    }
  })

  const featurePlans = plans.filter((p): p is Extract<Plan, { role: 'feature' }> => p.role === 'feature')
  let cabinetCount = plans.filter((p) => p.role === 'cabinet').length

  // Fixed features must fit within the wall. Clamp each to the wall, then, if
  // they still sum past it, scale them down proportionally (a degenerate input
  // the maker fixes) so the row can never overfill.
  for (const p of featurePlans) p.feature.width = Math.min(p.feature.width, wall)
  let fixed = featurePlans.reduce((s, p) => s + p.feature.width, 0)
  if (fixed > wall) {
    scaleFeaturesToWall(featurePlans, wall)
    fixed = wall
  }

  let remaining = Math.max(0, wall - fixed)

  // No cabinets but leftover width → add one so the run still fills the wall.
  if (cabinetCount === 0 && remaining > 0) {
    plans.push({ role: 'cabinet' })
    cabinetCount = 1
  }

  // Decide how many cabinets actually share `remaining`: at least what the
  // sketch drew, more if any would exceed the buildable/transportable maximum,
  // fewer only if the pieces would drop below the minimum width.
  const maxUsable = Math.min(filler.maxWidth, filler.maxPanelWidth ?? Infinity, catalogMaxPanel)
  let count = cabinetCount
  if (remaining > 0) {
    count = Math.max(cabinetCount, Math.ceil(remaining / maxUsable))
    const maxByMin = Math.max(1, Math.floor(remaining / filler.minWidth))
    count = Math.min(count, maxByMin)
  } else {
    count = 0
  }
  const cabWidths = splitWidth(remaining, count)

  const elements: ConfiguredElement[] = []
  let n = 1
  let ci = 0
  for (const plan of plans) {
    const id = `${rowId}-e${n++}`
    if (plan.role === 'feature') {
      const f = plan.feature
      elements.push(
        f.kind === 'reserved'
          ? reservedElement(id, f.width, rowHeight, rowDepth, f.label, f.appliance)
          : makeElement(id, f.def, f.width, false, space, { appliance: f.appliance }),
      )
    } else {
      const w = cabWidths[ci++] ?? 0
      if (w > 0) {
        elements.push(
          makeElement(id, filler, w, !filler.standardWidths.includes(w), space, {
            appliance: plan.appliance,
            hasHandle: plan.hasHandle,
          }),
        )
      }
    }
  }
  // If more cabinets were needed than the sketch drew (to respect maxWidth),
  // append the extra plain cabinets so the run still fills the wall exactly.
  while (ci < cabWidths.length) {
    const w = cabWidths[ci++]!
    if (w > 0) elements.push(makeElement(`${rowId}-e${n++}`, filler, w, !filler.standardWidths.includes(w), space))
  }
  return elements
}

/** Shrink fixed features proportionally so they sum to exactly `wall` (integer). */
function scaleFeaturesToWall(featurePlans: Extract<Plan, { role: 'feature' }>[], wall: number): void {
  const total = featurePlans.reduce((s, p) => s + p.feature.width, 0)
  if (total <= wall || total === 0) return
  let used = 0
  featurePlans.forEach((p, i) => {
    const scaled = i === featurePlans.length - 1 ? wall - used : Math.floor((p.feature.width / total) * wall)
    p.feature.width = Math.max(1, scaled)
    used += p.feature.width
  })
}

/** Split `total` into `count` near-equal integer widths that sum exactly to it. */
function splitWidth(total: number, count: number): number[] {
  if (count <= 0) return []
  const base = Math.floor(total / count)
  let remainder = total - base * count
  return Array.from({ length: count }, () => {
    const w = base + (remainder > 0 ? 1 : 0)
    if (remainder > 0) remainder--
    return w
  })
}

function baseFeature(item: SketchElement, wall: number, byKind: Map<string, ElementDef>): Feature | null {
  // Free-standing appliances the workshop does NOT build: a reserved placeholder
  // that occupies its space and shows what goes there.
  const placeholder = FREESTANDING[item.type]
  if (placeholder) {
    return {
      kind: 'reserved',
      width: clamp(item.widthMm ?? placeholder.width, 300, Math.min(1200, wall)),
      label: placeholder.label,
      appliance: placeholder.appliance,
    }
  }

  // Built-in appliances the workshop DOES build a cabinet for (sink base, oven
  // housing, dishwasher panel): a real element carrying the appliance symbol.
  const kind = BASE_KIND[item.type]
  if (!kind) return null // cabinet / cooktop / stray hood → a plain cabinet
  const def = byKind.get(kind)
  const width = def ? snapWidth(def, item.widthMm ?? PREFERRED[kind] ?? 600) : item.widthMm ?? 600
  return def
    ? { kind: 'def', def, width, appliance: kind }
    : { kind: 'reserved', width, label: LABEL[kind] ?? item.type, appliance: kind }
}

function wallFeature(item: SketchElement, byKind: Map<string, ElementDef>): Feature | null {
  if (item.type !== 'hood') return null
  const def = byKind.get('hood')
  const width = def ? snapWidth(def, item.widthMm ?? 600) : item.widthMm ?? 600
  return def
    ? { kind: 'def', def, width, appliance: 'hood' }
    : { kind: 'reserved', width, label: LABEL.hood ?? 'Aspirator', appliance: 'hood' }
}

/** Appliances that stand on their own — the customer supplies them. */
const FREESTANDING: Partial<Record<SketchElementType, { appliance: ApplianceKind; label: string; width: number }>> = {
  fridge: { appliance: 'fridge', label: 'Frižider (kupac)', width: 600 },
  washer: { appliance: 'washer', label: 'Veš mašina (kupac)', width: 600 },
}

// cooktop is intentionally absent — it maps to a cabinet (with a hob symbol),
// not the oven housing.
const BASE_KIND: Partial<Record<SketchElementType, ApplianceKind>> = {
  sink: 'sink',
  oven: 'oven',
  dishwasher: 'dishwasher',
}
const PREFERRED: Partial<Record<ApplianceKind, number>> = { sink: 800, oven: 600, dishwasher: 600, hood: 600 }
const LABEL: Partial<Record<ApplianceKind, string>> = {
  sink: 'Sudopera',
  oven: 'Rerna',
  dishwasher: 'Sudo-mašina',
  hood: 'Aspirator',
}

/** Nearest allowed/standard width to `desired`, within the element's bounds. */
function snapWidth(def: ElementDef, desired: number): number {
  const options = (def.applianceSlot?.allowedWidths ?? def.standardWidths).filter(
    (w) => w >= def.minWidth && w <= def.maxWidth,
  )
  if (options.length === 0) return clamp(desired, def.minWidth, def.maxWidth)
  return options.reduce((best, w) => (Math.abs(w - desired) < Math.abs(best - desired) ? w : best), options[0]!)
}

/** A worktop spanning the run, split into transportable panels (like the composer). */
function buildWorktop(def: ElementDef, catalog: Catalog, space: SpaceSpec): ConfiguredRow | null {
  const maxPiece = Math.min(def.maxWidth, def.maxPanelWidth ?? Infinity, catalog.maxPanelWidth)
  if (maxPiece < def.minWidth) return null
  const count = Math.max(1, Math.ceil(space.width / maxPiece))
  const base = Math.floor(space.width / count)
  let remainder = space.width - base * count

  const height = clamp(def.defaultHeight, def.minHeight, def.maxHeight)
  const depth = clamp(Math.min(space.depth, def.defaultDepth), def.minDepth, def.maxDepth)
  const elements: ConfiguredElement[] = []
  for (let i = 0; i < count; i++) {
    const w = base + (remainder > 0 ? 1 : 0)
    if (remainder > 0) remainder--
    if (w < def.minWidth) return null
    elements.push({
      id: `row-worktop-e${i + 1}`,
      elementDefId: def.id,
      width: w,
      height,
      depth,
      isCustomWidth: !def.standardWidths.includes(w),
      options: {},
    })
  }
  return { id: 'row-worktop', kind: 'base', yOffset: STANDARD_HEIGHTS.baseCarcass, spanFullWidth: true, elements }
}

function makeElement(
  id: string,
  def: ElementDef,
  width: number,
  isCustomWidth: boolean,
  space: SpaceSpec,
  extra: { appliance?: ApplianceKind; hasHandle?: boolean } = {},
): ConfiguredElement {
  return {
    id,
    elementDefId: def.id,
    width,
    height: clamp(def.defaultHeight, def.minHeight, def.maxHeight),
    depth: clamp(Math.min(space.depth, def.defaultDepth), def.minDepth, def.maxDepth),
    isCustomWidth,
    options: {},
    ...(extra.appliance ? { appliance: extra.appliance } : {}),
    ...(extra.hasHandle !== undefined ? { hasHandle: extra.hasHandle } : {}),
  }
}

function reservedElement(
  id: string,
  width: number,
  height: number,
  depth: number,
  label: string,
  appliance?: ApplianceKind,
): ConfiguredElement {
  return {
    id,
    elementDefId: '',
    width,
    height,
    depth,
    isCustomWidth: true,
    options: {},
    reserved: true,
    label,
    ...(appliance ? { appliance } : {}),
  }
}

function resolveWallWidth(extraction: SketchExtraction): number {
  const w = extraction.wallWidthMm
  if (typeof w === 'number' && w >= 1000 && w <= 8000) return Math.round(w)
  const sum = extraction.base.reduce((s, e) => s + (e.widthMm ?? 600), 0)
  return sum >= 1000 && sum <= 8000 ? Math.round(sum) : 3600
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value))
}
