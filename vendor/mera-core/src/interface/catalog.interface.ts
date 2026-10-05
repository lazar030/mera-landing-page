import type { Mm } from '../types'
import type { ElementDef } from './element-def.interface'
import type { FurnitureType } from './furniture-type.interface'
import type { Material } from './material.interface'
import type { OptionGroup } from './option-group.interface'
import type { PriceRule } from './price-rule.interface'

/** Everything a tenant offers, as the engine needs to see it. */
export interface Catalog {
  tenantId: string
  currency: string
  furnitureTypes: FurnitureType[]
  elementDefs: ElementDef[]
  materials: Material[]
  optionGroups: OptionGroup[]
  priceRules: PriceRule[]
  /** Tenant-wide transport/board cap for a single panel. */
  maxPanelWidth: Mm
  maxPanelHeight: Mm
}
