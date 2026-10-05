import type { Mm } from '@mera/core'

export type CutPartKey = 'side' | 'bottomTop' | 'shelf' | 'back' | 'door'
export type CutMaterialKey = 'chipboard18' | 'hdf3' | 'mdf18'

/** One aggregated row of the demo cut list. */
export interface CutPart {
  part: CutPartKey
  material: CutMaterialKey
  length: Mm
  width: Mm
  qty: number
}
