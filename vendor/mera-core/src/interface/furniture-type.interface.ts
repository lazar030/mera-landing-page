/** A kind of furniture a tenant makes (kitchen, wardrobe, …). */
export interface FurnitureType {
  id: string
  tenantId: string
  key: string // 'kitchen' | 'wardrobe' | ...
  name: string
}
