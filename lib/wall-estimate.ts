import { exactFill, type ElementDef, type Mm } from '@mera/core'
import type { CutMaterialKey, CutPart, CutPartKey, WallEstimate, WallModule } from '../interface'

/**
 * A single base-cabinet definition for the hero demo. The layout comes from the
 * real exact-fill solver in @mera/core, so the "fits to the millimetre" claim on
 * the page is the product's own behaviour, not an animation.
 */
const DEMO_BASE_UNIT: ElementDef = {
  id: 'demo-base',
  tenantId: 'demo',
  furnitureTypeId: 'kitchen',
  name: 'Donji element',
  category: 'base',
  standardWidths: [400, 600, 800],
  minWidth: 300,
  maxWidth: 1000,
  minHeight: 720,
  maxHeight: 720,
  minDepth: 560,
  maxDepth: 560,
  defaultHeight: 720,
  defaultDepth: 560,
  allowCustomWidth: true,
  customWidthStep: 10,
  customWidthPricing: 'priced',
  optionGroupIds: [],
}

/** The wall width used in the copy ("Zid od 3925 mm…"). */
export const DEMO_WALL: Mm = 3925

/** Units at or above this width are drawn with two doors. */
const DOUBLE_DOOR_FROM: Mm = 700

/**
 * Illustrative unit prices (RSD) and carcass dimensions. Deliberately NOT the
 * calc model: the page must stay a marketing demo, and the real breakdown uses
 * the tenant's own materials and cost settings.
 */
const DEMO = {
  heightM: 0.72,
  depthM: 0.56,
  boardPerM2: 2900,
  edgePerM: 110,
  hardwareAvg: 380,
  labourShare: 0.25,
} as const

/** Panel area (m²) of one carcass: 2 sides, top, bottom, back, one shelf, front(s). */
function boardArea(widthM: number): number {
  const { heightM: h, depthM: d } = DEMO
  return 2 * h * d + 2 * widthM * d + widthM * h + widthM * (d - 0.02) + widthM * (h - 0.004)
}

/** Banded edge length (m): door perimeter + visible carcass edges + shelf front. */
function edgeLength(widthM: number): number {
  const h = DEMO.heightM
  return 2 * (widthM + h) + 2 * h + 2 * widthM + widthM
}

/** Hinges (2 per door) + 4 legs + 4 shelf supports + 1 handle per door. */
function hardwareCount(doors: number): number {
  return doors * 2 + 4 + 4 + doors
}

/** Panel thickness deductions (mm) for the demo carcass. */
const BOARD: Mm = 18
const FRONT_GAP: Mm = 4

/** Cut parts of one carcass of the given width, before aggregation. */
function carcassParts(width: Mm, doubleDoor: boolean): CutPart[] {
  const h = DEMO_BASE_UNIT.defaultHeight
  const d = DEMO_BASE_UNIT.defaultDepth
  const inner = width - 2 * BOARD
  const doorW = doubleDoor ? Math.round((width - FRONT_GAP) / 2 - 2) : width - FRONT_GAP
  return [
    part('side', 'chipboard18', h, d, 2),
    part('bottomTop', 'chipboard18', inner, d, 2),
    part('shelf', 'chipboard18', inner, d - 20, 1),
    part('back', 'hdf3', width - FRONT_GAP, h - FRONT_GAP, 1),
    part('door', 'mdf18', doorW, h - FRONT_GAP, doubleDoor ? 2 : 1),
  ]
}

function part(p: CutPartKey, material: CutMaterialKey, length: Mm, width: Mm, qty: number): CutPart {
  return { part: p, material, length, width, qty }
}

/** Merges identical parts (same kind, material and size) into one row. */
function aggregate(parts: CutPart[]): CutPart[] {
  const rows = new Map<string, CutPart>()
  for (const p of parts) {
    const key = p.part + ':' + p.material + ':' + p.length + 'x' + p.width
    const row = rows.get(key)
    if (row) row.qty += p.qty
    else rows.set(key, { ...p })
  }
  return [...rows.values()]
}

/** Lays out a wall with the real solver and prices it with the demo constants. */
export function estimateWall(wallWidth: Mm): WallEstimate {
  const result = exactFill(wallWidth, [DEMO_BASE_UNIT], { prefer: 'widest' })

  let boardsM2 = 0
  let edgeM = 0
  let hardwarePcs = 0
  const parts: CutPart[] = []
  const modules: WallModule[] = result.slots.map((slot) => {
    const widthM = slot.width / 1000
    const doubleDoor = slot.width >= DOUBLE_DOOR_FROM
    boardsM2 += boardArea(widthM)
    edgeM += edgeLength(widthM)
    hardwarePcs += hardwareCount(doubleDoor ? 2 : 1)
    parts.push(...carcassParts(slot.width, doubleDoor))
    return { width: slot.width, isCustomWidth: slot.isCustomWidth, doubleDoor }
  })

  const materials = boardsM2 * DEMO.boardPerM2 + edgeM * DEMO.edgePerM + hardwarePcs * DEMO.hardwareAvg
  const labour = materials * DEMO.labourShare

  const cutList = aggregate(parts)

  return {
    modules,
    exact: result.exact,
    remainder: result.remainder,
    cutList,
    partCount: cutList.reduce((sum, p) => sum + p.qty, 0),
    boardsM2,
    edgeM,
    hardwarePcs,
    labour,
    total: materials + labour,
  }
}
