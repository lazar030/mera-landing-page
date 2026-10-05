/**
 * The maker cut/cost engine (Stolario-style workshop).
 *
 * Given an element's outer dimensions + joinery, produce its CUT LIST — the
 * rectangular panels to cut, each with its banded-edge length — and, applying
 * prices, its COST (material by m², edge by the metre, fittings by the piece,
 * labour on top). This is the moat: pure, deterministic, zero-dependency,
 * millimetre-exact.
 *
 * Joint types (see JointType): the only thing that changes between them is
 * which panels are cut to the full outer dimension and which are inset by the
 * board thickness. The formulas below are standard carcass joinery; the exact
 * overlaps and door gaps are tunable via ClearanceSettings and should be
 * confirmed against the pilot's own joinery.
 */

import type {
  ClearanceSettings,
  CutPanel,
  CutPrices,
  DrawerSpec,
  ElementCost,
  ElementCutResult,
  ElementSpec,
  HardwareQty,
  LabourSetting,
} from './interface'
import type { EdgeBucket, Mm, PanelMaterial, RunnerType } from './types'

/** Default shelf setback from the front, so a shelf sits behind the doors. */
const SHELF_SETBACK_MM = 20

/**
 * The cut list for ONE element (not multiplied by count). Panels are grouped
 * by identical geometry with a quantity, the way a cut list reads.
 */
export function cutElement(spec: ElementSpec, c: ClearanceSettings): CutPanel[] {
  const t = c.boardThickness
  const { height: H, width: W, depth: D } = spec
  const panels: CutPanel[] = []

  const carcass = (over: Partial<CutPanel> & Pick<CutPanel, 'role' | 'label' | 'length' | 'width' | 'quantity'>): CutPanel => ({
    grain: true,
    material: 'carcass',
    bandedLength: over.length, // front edge = the long (visible) dimension
    edgeBucket: 'carcass',
    ...over,
  })

  // --- Sides -------------------------------------------------------------
  // Tip 3 tucks the sides between a full top & bottom, so they lose 2t.
  const sideHeight = spec.jointType === 3 ? H - 2 * t : H
  panels.push(carcass({ role: 'side', label: 'Bok', length: sideHeight, width: D, quantity: 2 }))

  // --- Top & bottom (or, for Tip 2, a bottom + two rails) ----------------
  if (spec.jointType === 2) {
    panels.push(carcass({ role: 'topbottom', label: 'Dno', length: W - 2 * t, width: D, quantity: 1 }))
    panels.push(carcass({ role: 'rail', label: 'Veza', length: W - 2 * t, width: c.type2RailWidth, quantity: 2 }))
  } else if (spec.jointType === 1) {
    panels.push(carcass({ role: 'topbottom', label: 'Plafon/Dno', length: W - 2 * t, width: D, quantity: 2 }))
  } else {
    // Tip 3: top & bottom run the full width, over the sides.
    panels.push(carcass({ role: 'topbottom', label: 'Plafon/Dno', length: W, width: D, quantity: 2 }))
  }

  // --- Shelves -----------------------------------------------------------
  if (spec.shelves > 0) {
    const shelfWidth = W - 2 * t - c.shelfClearance
    const shelfDepth = spec.shelfDepth ?? Math.max(D - SHELF_SETBACK_MM, 0)
    panels.push({
      role: 'shelf',
      label: 'Polica',
      length: shelfWidth,
      width: shelfDepth,
      quantity: spec.shelves,
      grain: true,
      material: 'shelf',
      bandedLength: shelfWidth, // banded front edge
      edgeBucket: 'shelf',
    })
  }

  // --- Dividers (pregradni zid) -----------------------------------------
  if (spec.dividers > 0) {
    const interiorHeight = H - 2 * t
    panels.push(carcass({ role: 'divider', label: 'Pregrada', length: interiorHeight, width: D, quantity: spec.dividers }))
  }

  // --- Back (Leđa) — inset on every side, unbanded ----------------------
  if (spec.back !== 'none') {
    panels.push({
      role: 'back',
      label: 'Leđa',
      length: H - 2 * c.backClearancePerSide,
      width: W - 2 * c.backClearancePerSide,
      quantity: 1,
      grain: false,
      material: 'back',
      bandedLength: 0,
      edgeBucket: null,
    })
  }

  // --- Doors (Krila) — banded on all four edges -------------------------
  if (spec.doors !== 'none') {
    const doorHeight = H - 2 * c.doorClearanceOuter
    const double = spec.doors === 'double'
    const doorWidth = double
      ? Math.round((W - 2 * c.doorClearanceOuter - c.doorClearanceInner) / 2)
      : W - 2 * c.doorClearanceOuter
    panels.push({
      role: 'door',
      label: 'Krilo',
      length: doorHeight,
      width: doorWidth,
      quantity: double ? 2 : 1,
      grain: true,
      material: 'door',
      bandedLength: 2 * (doorHeight + doorWidth), // all four edges
      edgeBucket: 'door',
    })
  }

  return panels
}

/** Cost of ONE element from its cut list + prices, itemised. */
export function costElement(
  panels: CutPanel[],
  spec: ElementSpec,
  prices: CutPrices,
  hardware: HardwareQty,
  labour: LabourSetting,
): ElementCost {
  let { material, edge } = panelMaterialEdge(panels, prices)

  const doorCount = spec.doors === 'none' ? 0 : spec.doors === 'double' ? 2 : 1
  const shelfSupports = spec.fixedShelf ? 0 : Math.max(0, Math.trunc(spec.shelves)) * hardware.supportsPerShelf
  const hardwareCost =
    doorCount * hardware.hingesPerDoor * finite(prices.hinge) +
    shelfSupports * finite(prices.shelfSupport) +
    (spec.legs ? hardware.legsPerElement * finite(prices.leg) : 0)

  material = round(material)
  edge = round(edge)
  const hw = round(hardwareCost)
  const labourCost = labour.mode === 'fixed' ? round(labour.value) : round(((material + edge) * labour.value) / 100)
  const total = material + edge + hw + labourCost

  return {
    material,
    edge,
    hardware: hw,
    labour: labourCost,
    total,
    lines: [
      { label: 'Materijal', amount: material },
      { label: 'Kant traka', amount: edge },
      { label: 'Okovi', amount: hw },
      { label: 'Rad', amount: labourCost },
    ].filter((l) => l.amount !== 0),
  }
}

/** Panels + cost for one element row (cost multiplied by count). */
export function computeElement(
  spec: ElementSpec,
  clearances: ClearanceSettings,
  prices: CutPrices,
  hardware: HardwareQty,
  labour: LabourSetting,
): ElementCutResult {
  const panels = cutElement(spec, clearances)
  const unitCost = costElement(panels, spec, prices, hardware, labour)
  const count = Math.max(1, Math.trunc(spec.count) || 1)
  const cost: ElementCost = {
    material: unitCost.material * count,
    edge: unitCost.edge * count,
    hardware: unitCost.hardware * count,
    labour: unitCost.labour * count,
    total: unitCost.total * count,
    lines: unitCost.lines.map((l) => ({ label: l.label, amount: l.amount * count })),
  }
  return { panels, count, unitCost, cost }
}

/* --------------------------------- drawers -------------------------------- */

/** Side clearance (both sides total) between a drawer box and the carcass. */
const RUNNER_CLEARANCE: Record<RunnerType, Mm> = { teleskop: 27, podgradni: 10 }
/** Default extra height a drawer front adds over the box side. */
const DRAWER_FRONT_MARGIN_MM = 40

/** The cut list for ONE drawer (box + optional front). */
export function cutDrawer(spec: DrawerSpec, c: ClearanceSettings): CutPanel[] {
  const t = c.boardThickness
  const boxW = spec.boxWidth > 0 ? spec.boxWidth : Math.max(0, spec.carcassWidth - RUNNER_CLEARANCE[spec.runner])
  const boxD = spec.boxDepth
  const boxH = spec.boxHeight
  const panels: CutPanel[] = []

  // Box: two sides run the depth, front & back span the width between them.
  panels.push({ role: 'drawerSide', label: 'Bok fioke', length: boxD, width: boxH, quantity: 2, grain: true, material: 'carcass', bandedLength: boxD, edgeBucket: 'carcass' })
  panels.push({ role: 'drawerFrontBack', label: 'Čelo/Zadnja', length: boxW - 2 * t, width: boxH, quantity: 2, grain: true, material: 'carcass', bandedLength: boxW - 2 * t, edgeBucket: 'carcass' })

  // Bottom sits in a groove, unbanded — lesonit bills to the back bucket.
  panels.push({
    role: 'drawerBottom',
    label: 'Pod fioke',
    length: boxW - 2 * t + 2 * c.drawerBottomGroove,
    width: boxD - 2 * t + 2 * c.drawerBottomGroove,
    quantity: 1,
    grain: false,
    material: spec.bottom === 'lesonit' ? 'back' : 'carcass',
    bandedLength: 0,
    edgeBucket: null,
  })

  // Optional drawer front, banded all round.
  if (spec.front) {
    const fw = Math.max(0, spec.carcassWidth - 2 * c.doorClearanceOuter)
    const fh = spec.frontHeight ?? boxH + DRAWER_FRONT_MARGIN_MM
    panels.push({ role: 'door', label: 'Front fioke', length: fh, width: fw, quantity: 1, grain: true, material: 'door', bandedLength: 2 * (fh + fw), edgeBucket: 'door' })
  }

  return panels
}

/** Cost of ONE drawer — material + edge + one runner pair + labour. */
export function costDrawer(panels: CutPanel[], prices: CutPrices, labour: LabourSetting): ElementCost {
  const me = panelMaterialEdge(panels, prices)
  const material = round(me.material)
  const edge = round(me.edge)
  const hardware = round(finite(prices.runner)) // one runner pair per drawer
  const labourCost = labour.mode === 'fixed' ? round(labour.value) : round(((material + edge) * labour.value) / 100)
  const total = material + edge + hardware + labourCost
  return {
    material,
    edge,
    hardware,
    labour: labourCost,
    total,
    lines: [
      { label: 'Materijal', amount: material },
      { label: 'Kant traka', amount: edge },
      { label: 'Klizači', amount: hardware },
      { label: 'Rad', amount: labourCost },
    ].filter((l) => l.amount !== 0),
  }
}

/** Panels + cost for one drawer row (cost multiplied by quantity). */
export function computeDrawer(
  spec: DrawerSpec,
  clearances: ClearanceSettings,
  prices: CutPrices,
  labour: LabourSetting,
): ElementCutResult {
  const panels = cutDrawer(spec, clearances)
  const unitCost = costDrawer(panels, prices, labour)
  const count = Math.max(1, Math.trunc(spec.quantity) || 1)
  const cost: ElementCost = {
    material: unitCost.material * count,
    edge: unitCost.edge * count,
    hardware: unitCost.hardware * count,
    labour: unitCost.labour * count,
    total: unitCost.total * count,
    lines: unitCost.lines.map((l) => ({ label: l.label, amount: l.amount * count })),
  }
  return { panels, count, unitCost, cost }
}

/* -------------------------------- helpers --------------------------------- */

/** Sum a panel list's material (by m²) and banded-edge (by m) cost. */
function panelMaterialEdge(panels: CutPanel[], prices: CutPrices): { material: number; edge: number } {
  const areaPrice: Record<PanelMaterial, number> = {
    carcass: prices.carcassPerM2,
    shelf: prices.shelfPerM2,
    door: prices.doorPerM2,
    back: prices.backPerM2,
  }
  const edgePrice: Record<EdgeBucket, number> = {
    carcass: prices.edgeCarcassPerM,
    shelf: prices.edgeShelfPerM,
    door: prices.edgeDoorPerM,
  }
  let material = 0
  let edge = 0
  for (const p of panels) {
    material += mm2ToM2(p.length, p.width) * p.quantity * finite(areaPrice[p.material])
    if (p.edgeBucket && p.bandedLength > 0) {
      edge += (p.bandedLength / 1000) * p.quantity * finite(edgePrice[p.edgeBucket])
    }
  }
  return { material, edge }
}

function mm2ToM2(length: Mm, width: Mm): number {
  return (Math.max(0, length) / 1000) * (Math.max(0, width) / 1000)
}
function finite(n: number): number {
  return Number.isFinite(n) ? n : 0
}
function round(n: number): number {
  return Number.isFinite(n) ? Math.round(n) : 0
}
