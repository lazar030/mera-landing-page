import type { OptionValue } from './option-value.interface'

/** A group of related choices an element exposes (material, colour, front…). */
export interface OptionGroup {
  id: string
  tenantId: string
  key: string // 'material' | 'colour' | 'front' | ...
  name: string
  description?: string
  required: boolean
  values: OptionValue[]
}
