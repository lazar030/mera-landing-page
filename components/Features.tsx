import Image from 'next/image'
import { copy } from '@/content'
import { formatNumber } from '@/lib/format'
import { SectionHeading } from './SectionHeading'

/** Two showcase tiles (project board, 3D preview), four smaller features, upcoming teaser. */
export function Features() {
  const { features } = copy
  return (
    <section id="mogucnosti" className="scroll-mt-16 border-y border-line bg-surface">
      <div className="mx-auto max-w-page px-6 py-26">
        <SectionHeading eyebrow={features.eyebrow} title={features.title} />

        <div className="mt-13 grid gap-5 lg:grid-cols-2">
          <Tile title={features.board.title} body={features.board.body}>
            <ProjectBoard />
          </Tile>
          <Tile title={features.preview.title} body={features.preview.body}>
            <div className="relative mx-5 mb-5 min-h-[200px] flex-1 overflow-hidden rounded-xl">
              {features.preview.image ? (
                <Image src={features.preview.image} alt={features.preview.imageAlt} fill className="object-cover" sizes="(min-width: 1024px) 560px, 100vw" />
              ) : (
                <div className="flex size-full items-center justify-center border border-dashed border-line-strong bg-paper p-6 text-center text-sm text-ink-soft">
                  {features.preview.placeholder}
                </div>
              )}
            </div>
          </Tile>
        </div>

        <div className="mt-5 grid gap-px overflow-hidden rounded-[18px] border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
          {features.items.map((item) => (
            <div key={item.title} className="bg-app p-6.5">
              <h3 className="text-[17px] font-semibold tracking-[-0.015em]">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-pretty text-ink-soft">{item.body}</p>
            </div>
          ))}
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-3 rounded-[18px] bg-ink px-6 py-5 text-night-ink">
          <span className="rounded-full border border-oak px-2.5 py-1 font-mono text-[11px] font-medium tracking-[0.06em] text-oak-soft">
            {features.upcoming.badge}
          </span>
          <p className="min-w-60 flex-1 text-[15px] leading-normal">
            <strong className="font-semibold">{features.upcoming.title}</strong>{' '}
            <span className="text-night-ink-soft">{features.upcoming.body}</span>
          </p>
        </div>
      </div>
    </section>
  )
}

function Tile({ title, body, children }: { title: string; body: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col overflow-hidden rounded-[18px] border border-line bg-app">
      <div className="px-7 pt-7 pb-6">
        <h3 className="text-[21px] font-semibold tracking-[-0.02em]">{title}</h3>
        <p className="mt-2 max-w-[420px] text-[15px] leading-relaxed text-pretty text-ink-soft">{body}</p>
      </div>
      {children}
    </div>
  )
}

/** Static three-column board — a picture of the admin Projekti view. */
function ProjectBoard() {
  const { features, meta } = copy
  return (
    <div aria-hidden className="grid flex-1 grid-cols-3 gap-2.5 px-5 pb-5">
      {features.board.columns.map((col) => (
        <div key={col.title} className="flex flex-col gap-2 rounded-xl bg-surface p-2.5">
          <div className="flex justify-between text-[11px] font-semibold text-ink-soft">
            <span className="truncate">{col.title}</span>
            <span>{col.cards.length}</span>
          </div>
          {col.cards.map((card) => (
            <div
              key={card.name}
              className={
                'rounded-lg bg-app p-2.5 ' +
                (card.active ? 'border-[1.5px] border-brand' : 'border border-line') +
                (col.muted ? ' opacity-70' : '')
              }
            >
              <p className="truncate text-xs font-semibold">{card.name}</p>
              <p className="mt-1 font-mono text-[11px] text-ink-soft">{formatNumber(card.amount, meta.locale)}</p>
              {card.due && <p className="mt-2 text-[10px] font-semibold text-brand">{card.due}</p>}
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}
