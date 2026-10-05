/** A real, in-stock material a tenant offers (product spec §6.1). */
export interface Material {
  id: string
  tenantId: string
  name: string
  description?: string
  /** URL of the real swatch photo. Names alone are not enough to choose from. */
  swatchUrl?: string
  /**
   * A representative flat display colour (hex, e.g. `#c8a06a`). Used by the
   * swatch picker and the 2D/3D preview as a fallback when there is no real
   * `swatchUrl` photo, so the furniture recolours live as the customer changes
   * material. `swatchUrl` takes precedence when present.
   */
  color?: string
  /** Whether the maker currently has it in stock / can source it. */
  available: boolean
}
