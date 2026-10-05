import type { CopyItem } from './copy-item.interface'

/** One card on the demo project board. */
export interface BoardCard {
  name: string
  /** RSD. */
  amount: number
  due?: string
  /** Highlighted as the job in progress. */
  active?: boolean
}

/** One column on the demo project board. */
export interface BoardColumn {
  title: string
  cards: BoardCard[]
  /** Finished jobs are shown faded. */
  muted?: boolean
}

/** "Mogućnosti" section: two showcase tiles, a grid of smaller features, a teaser. */
export interface FeaturesCopy {
  eyebrow: string
  title: string
  board: { title: string; body: string; columns: BoardColumn[] }
  preview: {
    title: string
    body: string
    /** Path under /public. Until a real screenshot exists a placeholder is shown. */
    image?: string
    imageAlt: string
    placeholder: string
  }
  items: CopyItem[]
  upcoming: { badge: string; title: string; body: string }
}
