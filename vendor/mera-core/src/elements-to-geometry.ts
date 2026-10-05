import { STANDARD_HEIGHTS } from './constants'
import type { DerivedElement, DerivedGeometry, SketchElementDraft } from './interface'

/**
 * Lay maker elements out into render-ready geometry so the 2D/3D views draw the
 * ACTUAL elements — the source of truth — not the original read. Base elements
 * sit on the floor left-to-right; wall elements sit up high (above the worktop +
 * splashback). Recompute this whenever the elements change and the preview stays
 * in sync. Pure & deterministic — same elements, same geometry.
 */
export function elementsToGeometry(elements: SketchElementDraft[]): DerivedGeometry {
  const wallY = STANDARD_HEIGHTS.worktop + STANDARD_HEIGHTS.splashback // underside of the wall run
  const derived: DerivedElement[] = []
  let baseX = 0
  let wallX = 0
  let id = 0
  let maxTop = 0

  for (const el of elements) {
    const wall = el.run === 'wall'
    const y = wall ? wallY : 0
    const count = Math.max(1, Math.round(el.spec.count) || 1)
    for (let i = 0; i < count; i++) {
      const x = wall ? wallX : baseX
      derived.push({
        elementId: `de-${id++}`,
        rowId: wall ? 'row-wall' : 'row-base',
        elementDefId: '',
        category: wall ? 'wall' : 'base',
        x,
        y,
        width: el.spec.width,
        height: el.spec.height,
        depth: el.spec.depth,
        label: el.spec.name,
        ...(el.appliance ? { appliance: el.appliance } : {}),
        ...(el.spec.doors !== 'none' ? { hasHandle: true } : {}),
      })
      if (wall) wallX += el.spec.width
      else baseX += el.spec.width
      maxTop = Math.max(maxTop, y + el.spec.height)
    }
  }

  const width = Math.max(baseX, wallX, 100)
  const height = Math.max(maxTop + 120, 2400)
  return { space: { width, height, depth: STANDARD_HEIGHTS.baseDepth }, elements: derived, totalWidth: width, totalHeight: maxTop }
}
