import type { Mm } from './types'
import type { Catalog, ElementDef, Material, OptionGroup } from './interface'
import { DEFAULT_MAX_PANEL_HEIGHT_MM, DEFAULT_MAX_PANEL_WIDTH_MM } from './constants'

/** Indexed view of a catalog, so lookups are O(1) inside hot loops. */
export interface CatalogIndex {
  catalog: Catalog
  elementDef(id: string): ElementDef | undefined
  material(id: string): Material | undefined
  optionGroup(id: string): OptionGroup | undefined
  optionGroupByKey(key: string): OptionGroup | undefined
  /** Resolve an option value id to the material it selects, if any. */
  materialForOptionValue(optionValueId: string): Material | undefined
  maxPanelWidth: Mm
  maxPanelHeight: Mm
}

export function indexCatalog(catalog: Catalog): CatalogIndex {
  const defs = new Map(catalog.elementDefs.map((d) => [d.id, d]))
  const materials = new Map(catalog.materials.map((m) => [m.id, m]))
  const groups = new Map(catalog.optionGroups.map((g) => [g.id, g]))
  const groupsByKey = new Map(catalog.optionGroups.map((g) => [g.key, g]))

  const valueToMaterial = new Map<string, Material>()
  for (const group of catalog.optionGroups) {
    for (const value of group.values) {
      if (value.materialId) {
        const material = materials.get(value.materialId)
        if (material) valueToMaterial.set(value.id, material)
      }
    }
  }

  return {
    catalog,
    elementDef: (id) => defs.get(id),
    material: (id) => materials.get(id),
    optionGroup: (id) => groups.get(id),
    optionGroupByKey: (key) => groupsByKey.get(key),
    materialForOptionValue: (id) => valueToMaterial.get(id),
    maxPanelWidth: catalog.maxPanelWidth || DEFAULT_MAX_PANEL_WIDTH_MM,
    maxPanelHeight: catalog.maxPanelHeight || DEFAULT_MAX_PANEL_HEIGHT_MM,
  }
}

/** The largest single panel this specific element may be built from. */
export function panelWidthLimit(def: ElementDef, index: CatalogIndex): Mm {
  return Math.min(def.maxPanelWidth ?? Infinity, index.maxPanelWidth)
}

/** True when `width` sits exactly on the element's standard module grid. */
export function isStandardWidth(def: ElementDef, width: Mm): boolean {
  return def.standardWidths.includes(width)
}
