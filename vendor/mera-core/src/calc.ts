/**
 * Cost calculation — the maker-first "how much does it cost to build" engine.
 *
 * Pure, deterministic, dependency-free like the rest of @mera/core. It turns a
 * configured element (a box with real dimensions + a production spec) into an
 * itemised CostBreakdown: material by panel area, edge banding by the metre,
 * hardware by the piece, and labour. The UI renders the breakdown from typed
 * lines without knowing any formula — exactly like validation.
 *
 * This is "mid-depth" V1 (see docs/MAKER_FIRST_REBUILD.md §5): areas are
 * computed from outer dimensions; joint types, per-edge banding rules and drawer
 * runners are later refinements that slot in behind these same functions.
 */

import type { ElementCategory } from './types'
import type {
  ConfiguredElement,
  CostBreakdown,
  CostLine,
  CostSettings,
  ProductionSpec,
} from './interface'

const MM2_PER_M2 = 1_000_000
const MM_PER_M = 1000

/** Sensible production defaults for an element, from its category. */
export function defaultProductionSpec(category: ElementCategory): ProductionSpec {
  switch (category) {
    case 'base':
      return { doors: 1, shelves: 1, backPanel: 'lesonit', hasLegs: true }
    case 'wall':
      return { doors: 1, shelves: 1, backPanel: 'lesonit', hasLegs: false }
    case 'tall':
      return { doors: 2, shelves: 4, backPanel: 'lesonit', hasLegs: true }
    case 'appliance': // a housing/slot — carcass only, the appliance is bought
      return { doors: 0, shelves: 0, backPanel: 'none', hasLegs: false }
    case 'worktop': // a slab — handled specially in calculateElement
      return { doors: 0, shelves: 0, backPanel: 'none', hasLegs: false }
  }
}

/**
 * Cost of one element. A reserved opening (customer-supplied) costs nothing; a
 * worktop is a slab; everything else is a carcass.
 */
export function calculateElement(
  element: ConfiguredElement,
  spec: ProductionSpec,
  settings: CostSettings,
  category: ElementCategory = 'base',
): CostBreakdown {
  if (element.reserved) return empty(settings.currency)
  if (category === 'worktop') return worktopBreakdown(element, settings)
  return carcassBreakdown(element, spec, settings)
}

/**
 * Aggregate cost of a whole project. Each item pairs an element with its spec
 * and category. The breakdown's lines are one summary line per kind.
 */
export function calculateProject(
  items: Array<{ element: ConfiguredElement; spec: ProductionSpec; category: ElementCategory }>,
  settings: CostSettings,
): CostBreakdown {
  let material = 0
  let edge = 0
  let hardware = 0
  let labour = 0

  for (const { element, spec, category } of items) {
    const b = calculateElement(element, spec, settings, category)
    material += b.material
    edge += b.edge
    hardware += b.hardware
    labour += b.labour
  }

  const lines: CostLine[] = [
    line('material', 'Material', 1, 'element', material, material),
    line('edge', 'Edge banding', 1, 'element', edge, edge),
    line('hardware', 'Hardware', 1, 'element', hardware, hardware),
    line('labour', 'Labour', 1, 'element', labour, labour),
  ].filter((l) => l.amount > 0)

  return { currency: settings.currency, lines, material, edge, hardware, labour, total: material + edge + hardware + labour }
}

/* -------------------------------------------------------------------------- */
/*  Carcass                                                                    */
/* -------------------------------------------------------------------------- */

function carcassBreakdown(
  element: ConfiguredElement,
  spec: ProductionSpec,
  settings: CostSettings,
): CostBreakdown {
  const { width: w, height: h, depth: d } = element
  const lines: CostLine[] = []

  // Sanitise counts: the engine is the deterministic authority, so a stray
  // NaN/negative/fractional count must never leak into a NaN price. (Specs will
  // be DB-sourced in a later phase.)
  const doors = count(spec.doors)
  const shelves = count(spec.shelves)

  // --- Material: carcass board (sides + top + bottom + shelves) ------------
  const carcassM2 = (2 * d * h + 2 * w * d + shelves * w * d) / MM2_PER_M2
  const carcass = round(carcassM2 * settings.carcassPricePerM2)
  if (carcass > 0) lines.push(line('material', 'Carcass', roundM2(carcassM2), 'm2', settings.carcassPricePerM2, carcass))

  // --- Material: back panel ------------------------------------------------
  let back = 0
  if (spec.backPanel !== 'none') {
    const backM2 = (w * h) / MM2_PER_M2
    const price = spec.backPanel === 'decor' ? settings.backDecorPricePerM2 : settings.backLesonitPricePerM2
    back = round(backM2 * price)
    if (back > 0) lines.push(line('material', 'Back panel', roundM2(backM2), 'm2', price, back))
  }

  // --- Material: fronts/doors ----------------------------------------------
  let front = 0
  if (doors > 0) {
    const frontM2 = (w * h) / MM2_PER_M2 // total front area, whatever the door count
    front = round(frontM2 * settings.frontPricePerM2)
    if (front > 0) lines.push(line('material', 'Fronts', roundM2(frontM2), 'm2', settings.frontPricePerM2, front))
  }

  // --- Edge banding --------------------------------------------------------
  // Estimate: the carcass opening + shelf fronts + door perimeters.
  const edgeMm = 2 * h + 2 * w + shelves * w + (doors > 0 ? 2 * (w + h) : 0)
  const edgeM = edgeMm / MM_PER_M
  const edge = round(edgeM * settings.edgeBandingPricePerM)
  if (edge > 0) lines.push(line('edge', 'Edge banding', roundM(edgeM), 'm', settings.edgeBandingPricePerM, edge))

  // --- Hardware ------------------------------------------------------------
  const hardware = pushHardware(lines, settings, {
    hinge: doors * 2,
    handle: doors,
    leg: spec.hasLegs ? 4 : 0,
    shelfSupport: shelves * 4,
  })

  // --- Labour --------------------------------------------------------------
  const material = carcass + back + front
  const labour = labourFor(material + edge, settings, lines)

  return totals(settings.currency, lines, material, edge, hardware, labour)
}

/* -------------------------------------------------------------------------- */
/*  Worktop                                                                    */
/* -------------------------------------------------------------------------- */

function worktopBreakdown(element: ConfiguredElement, settings: CostSettings): CostBreakdown {
  const areaM2 = (element.width * element.depth) / MM2_PER_M2
  const material = round(areaM2 * settings.worktopPricePerM2)
  const edgeM = element.width / MM_PER_M // front edge banded
  const edge = round(edgeM * settings.edgeBandingPricePerM)

  const lines: CostLine[] = []
  if (material > 0) lines.push(line('material', 'Worktop', roundM2(areaM2), 'm2', settings.worktopPricePerM2, material))
  if (edge > 0) lines.push(line('edge', 'Edge banding', roundM(edgeM), 'm', settings.edgeBandingPricePerM, edge))
  const labour = labourFor(material + edge, settings, lines)

  return totals(settings.currency, lines, material, 0 + edge, 0, labour)
}

/* -------------------------------------------------------------------------- */
/*  Shared helpers                                                             */
/* -------------------------------------------------------------------------- */

function pushHardware(
  lines: CostLine[],
  settings: CostSettings,
  counts: { hinge: number; handle: number; leg: number; shelfSupport: number },
): number {
  const items: Array<[keyof CostSettings['hardware'], string, number]> = [
    ['hinge', 'Hinges', counts.hinge],
    ['handle', 'Handles', counts.handle],
    ['leg', 'Legs', counts.leg],
    ['shelfSupport', 'Shelf supports', counts.shelfSupport],
  ]
  let total = 0
  for (const [key, label, qty] of items) {
    if (qty <= 0) continue
    const unitPrice = settings.hardware[key]
    const amount = round(qty * unitPrice)
    total += amount
    if (amount > 0) lines.push(line('hardware', label, qty, 'piece', unitPrice, amount))
  }
  return total
}

function labourFor(base: number, settings: CostSettings, lines: CostLine[]): number {
  const { mode, value } = settings.labour
  const amount = round(mode === 'percent' ? (base * value) / 100 : value)
  if (amount > 0) {
    lines.push(line('labour', 'Labour', 1, 'element', amount, amount))
  }
  return amount
}

function totals(
  currency: string,
  lines: CostLine[],
  material: number,
  edge: number,
  hardware: number,
  labour: number,
): CostBreakdown {
  return { currency, lines, material, edge, hardware, labour, total: material + edge + hardware + labour }
}

function empty(currency: string): CostBreakdown {
  return { currency, lines: [], material: 0, edge: 0, hardware: 0, labour: 0, total: 0 }
}

function line(kind: CostLine['kind'], label: string, quantity: number, unit: CostLine['unit'], unitPrice: number, amount: number): CostLine {
  return { kind, label, quantity, unit, unitPrice, amount }
}

/** A non-negative whole count; a non-finite/negative input collapses to 0. */
function count(n: number): number {
  return Number.isFinite(n) ? Math.max(0, Math.trunc(n)) : 0
}

/** Round money to whole currency units; a non-finite amount collapses to 0. */
function round(n: number): number {
  return Number.isFinite(n) ? Math.round(n) : 0
}
function roundM2(n: number): number {
  return Math.round(n * 1000) / 1000
}
function roundM(n: number): number {
  return Math.round(n * 100) / 100
}
