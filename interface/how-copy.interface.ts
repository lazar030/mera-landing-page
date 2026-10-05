import type { CopyItem } from './copy-item.interface'

/** "Kako radi" section: three steps, each with a small product visual. */
export interface HowCopy {
  eyebrow: string
  title: string
  aside: string
  /** Exactly three steps: measure, calculate, quote. */
  steps: [CopyItem, CopyItem, CopyItem]
  measure: { label: string; chips: string[] }
  cutTotal: string
  quote: {
    title: string
    number: string
    /** First line; `{count}` is replaced with the element count. */
    elements: string
    /** Extra demo lines in RSD. */
    extras: { label: string; amount: number }[]
    total: string
    send: string
  }
}
