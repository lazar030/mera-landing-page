/** One selectable value within an option group (e.g. a specific colour). */
export interface OptionValue {
  id: string
  name: string
  description?: string
  /** Set when this option value selects a material. */
  materialId?: string
  available: boolean
}
