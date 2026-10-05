/**
 * Derived geometry — the bridge between the configuration document and every
 * renderer.
 *
 * The 2D SVG elevation and the 3D parametric preview consume THIS, not the
 * configuration directly. That is what keeps "the structured configuration is
 * the source of truth; the visual is a representation of it" honest: if a
 * renderer needs a number, it comes from here, computed once.
 *
 * Coordinate system (millimetres):
 *   x — from the left wall, increasing right
 *   y — from the floor, increasing up
 *   z — from the back wall, increasing toward the viewer (depth)
 */

import type { Catalog, Configuration, DerivedElement, DerivedGeometry } from './interface'
import { indexCatalog } from './catalog'

export function derive(config: Configuration, catalog: Catalog): DerivedGeometry {
  const index = indexCatalog(catalog)
  const elements: DerivedElement[] = []

  for (const row of config.rows) {
    let x = 0
    for (const element of row.elements) {
      const def = index.elementDef(element.elementDefId)

      // Resolve whichever option selects a material, so renderers can texture.
      let materialId: string | undefined
      for (const optionValueId of Object.values(element.options)) {
        const material = index.materialForOptionValue(optionValueId)
        if (material) {
          materialId = material.id
          break
        }
      }

      elements.push({
        elementId: element.id,
        rowId: row.id,
        elementDefId: element.elementDefId,
        category: def?.category ?? 'base',
        x,
        y: row.yOffset,
        width: element.width,
        height: element.height,
        depth: element.depth,
        // A reserved opening carries no material, even if a def lingers on it.
        ...(materialId && !element.reserved ? { materialId } : {}),
        label: element.reserved ? element.label ?? 'Otvor' : def?.name ?? element.elementDefId,
        ...(element.reserved ? { reserved: true } : {}),
        ...(element.appliance ? { appliance: element.appliance } : {}),
        ...(element.hasHandle !== undefined ? { hasHandle: element.hasHandle } : {}),
      })

      x += element.width
    }
  }

  return {
    space: config.space,
    elements,
    totalWidth: elements.reduce((max, e) => Math.max(max, e.x + e.width), 0),
    totalHeight: elements.reduce((max, e) => Math.max(max, e.y + e.height), 0),
  }
}

/** Elements of one row, left to right. Handy for elevation rendering. */
export function elementsInRow(geometry: DerivedGeometry, rowId: string): DerivedElement[] {
  return geometry.elements.filter((e) => e.rowId === rowId).sort((a, b) => a.x - b.x)
}
