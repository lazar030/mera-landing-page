import type { ApplianceKind, DoorMode } from './types'
import type {
  Catalog,
  Configuration,
  ElementSpec,
  SketchElementDraft,
  SketchSkip,
  SketchToElementsResult,
} from './interface'

/**
 * Turn an exact-filled buyer Configuration (from `sketchToConfig`) into draft
 * maker elements for the cut engine — so "photo → whole kitchen" reuses the
 * exact-fill solver instead of guessing widths.
 *
 * Each built cabinet becomes an `ElementSpec` at its solved width; worktops
 * (a surface, not a carcass) and reserved openings (fridge/washer the customer
 * supplies) are dropped — the latter reported in `skipped`. Pure & deterministic.
 */
export function configToElementSpecs(config: Configuration, catalog: Catalog): SketchToElementsResult {
  const defById = new Map(catalog.elementDefs.map((d) => [d.id, d] as const))
  const drafts: SketchElementDraft[] = []
  const skipped: SketchSkip[] = []

  for (const row of config.rows) {
    const run: 'base' | 'wall' = row.kind === 'wall' ? 'wall' : 'base'
    for (const el of row.elements) {
      if (el.reserved) {
        if (el.appliance) skipped.push({ appliance: el.appliance, label: el.label ?? applianceLabel(el.appliance) })
        continue
      }
      if (defById.get(el.elementDefId)?.category === 'worktop') continue // a surface, not a carcass

      const wall = run === 'wall'
      const spec: ElementSpec = {
        name: elementName(el.appliance, run),
        jointType: 1,
        height: el.height,
        width: el.width,
        depth: el.depth,
        shelves: wall ? 2 : 1,
        dividers: 0,
        doors: doorsFor(el.appliance, el.width),
        back: 'lesonit',
        legs: !wall,
        count: 1,
      }
      drafts.push(el.appliance ? { spec, run, appliance: el.appliance } : { spec, run })
    }
  }

  return { drafts, skipped, wallWidthMm: config.space.width }
}

/* -------------------------------------------------------------------------- */

/** Housings whose front is the appliance itself, not a built door. */
const NO_DOOR: Partial<Record<ApplianceKind, true>> = { oven: true, dishwasher: true, hood: true }

function doorsFor(appliance: ApplianceKind | undefined, width: number): DoorMode {
  if (appliance && NO_DOOR[appliance]) return 'none'
  return width >= 900 ? 'double' : 'single'
}

function elementName(appliance: ApplianceKind | undefined, run: 'base' | 'wall'): string {
  switch (appliance) {
    case 'sink':
      return 'Sudopera'
    case 'oven':
      return 'Rerna'
    case 'dishwasher':
      return 'Sudo-mašina'
    case 'hood':
      return 'Aspirator'
    default:
      return run === 'wall' ? 'Gornji element' : 'Donji element'
  }
}

function applianceLabel(a: ApplianceKind): string {
  if (a === 'fridge') return 'Frižider (kupac)'
  if (a === 'washer') return 'Veš mašina (kupac)'
  return a
}
