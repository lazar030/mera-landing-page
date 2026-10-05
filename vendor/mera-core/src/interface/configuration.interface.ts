import type { ConfigSchemaVersion } from '../types'
import type { ConfiguredRow } from './configured-row.interface'
import type { SpaceSpec } from './space-spec.interface'

/**
 * The configuration document — THE source of truth. Validation, price and
 * geometry are all derived from it. Carries a `schemaVersion` so stored
 * documents are migrated deliberately, never guessed at read time.
 */
export interface Configuration {
  schemaVersion: ConfigSchemaVersion
  id?: string
  tenantId: string
  furnitureTypeId: string
  space: SpaceSpec
  rows: ConfiguredRow[]
}
