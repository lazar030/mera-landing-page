/**
 * Barrel for the domain interfaces.
 *
 * Per CONVENTIONS.md, every `interface` lives in its own `<name>.interface.ts`
 * file and is re-exported here, so consumers import from one place:
 *   import type { Catalog, Configuration } from '../interface'
 */
export * from './appliance-slot.interface'
export * from './element-def.interface'
export * from './material.interface'
export * from './option-value.interface'
export * from './option-group.interface'
export * from './price-rule.interface'
export * from './furniture-type.interface'
export * from './catalog.interface'
export * from './space-spec.interface'
export * from './configured-element.interface'
export * from './configured-row.interface'
export * from './configuration.interface'
export * from './derived-element.interface'
export * from './derived-geometry.interface'
export * from './production-spec.interface'
export * from './cost-settings.interface'
export * from './cost-breakdown.interface'
export * from './clearance-settings.interface'
export * from './element-spec.interface'
export * from './drawer-spec.interface'
export * from './cut-panel.interface'
export * from './cut-cost.interface'
export * from './sketch.interface'
