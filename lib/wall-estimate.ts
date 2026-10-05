import { exactFill, type ElementDef, type Mm } from '@mera/core'
import type { WallEstimate, WallModule } from '../interface'

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

/** Lays out a wall with the real solver and prices it with the demo constants. */
export function estimateWall(wallWidth: Mm): WallEstimate {
  const result = exactFill(wallWidth, [DEMO_BASE_UNIT], { prefer: 'widest' })

  let boardsM2 = 0
  let edgeM = 0
  let hardwarePcs = 0
  const modules: WallModule[] = result.slots.map((slot) => {
    const widthM = slot.width / 1000
    const doubleDoor = slot.width >= DOUBLE_DOOR_FROM
    boardsM2 += boardArea(widthM)
    edgeM += edgeLength(widthM)
    hardwarePcs += hardwareCount(doubleDoor ? 2 : 1)
    return { width: slot.width, isCustomWidth: slot.isCustomWidth, doubleDoor }
  })

  const materials = boardsM2 * DEMO.boardPerM2 + edgeM * DEMO.edgePerM + hardwarePcs * DEMO.hardwareAvg
  const labour = materials * DEMO.labourShare

  return {
    modules,
    exact: result.exact,
    remainder: result.remainder,
    boardsM2,
    edgeM,
    hardwarePcs,
    labour,
    total: materials + labour,
  }
}
