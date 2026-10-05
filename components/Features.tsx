import { copy } from '@/content'
import { SectionHeading } from './SectionHeading'

/** Six workshop capabilities in a hairline grid, plus the "coming soon" teaser. */
export function Features() {
  const { features } = copy
  return (
    <section id="mogucnosti" className="scroll-mt-16 border-y border-line bg-surface">
      <div className="mx-auto max-w-page px-6 py-24">
        <SectionHeading eyebrow={features.eyebrow} title={features.title} />
        <div className="mt-12 grid gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
          {features.items.map((item) => (
            <div key={item.title} className="bg-app p-7">
              <h3 className="text-lg font-semibold tracking-[-0.015em]">{item.title}</h3>
              <p className="mt-2 text-[15px] leading-relaxed text-pretty text-ink-soft">{item.body}</p>
            </div>
          ))}
        </div>
        <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-3 rounded-2xl border border-dashed border-line-strong bg-app px-7 py-5.5">
          <span className="rounded-full bg-brand px-2.5 py-1 text-xs font-semibold tracking-[0.04em] text-white">
            {features.upcoming.badge}
          </span>
          <p className="min-w-60 flex-1 text-[15px] leading-normal">{features.upcoming.body}</p>
        </div>
      </div>
    </section>
  )
}
