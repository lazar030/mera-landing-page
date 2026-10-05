import { copy } from '@/content'
import { Eyebrow } from './Eyebrow'

/** The core promise on a dark ruled band, backed by three engine guarantees. */
export function PromiseBand() {
  const { promise } = copy
  return (
    <section className="relative overflow-hidden bg-night text-night-ink">
      <div aria-hidden className="ruler-lines pointer-events-none absolute inset-0" />
      <div className="relative mx-auto max-w-page px-6 py-28">
        <Eyebrow tone="night">{promise.eyebrow}</Eyebrow>
        <h2 className="mt-3.5 max-w-[860px] text-[clamp(34px,5vw,64px)] leading-none font-bold tracking-[-0.045em] text-balance">
          {promise.title}
        </h2>
        <div className="mt-16 grid gap-10 md:grid-cols-3">
          {promise.facts.map((fact) => (
            <div key={fact.title} className="border-t border-night-line pt-5.5">
              <p className="font-mono text-[34px] tracking-[-0.03em] text-oak-soft">{fact.title}</p>
              <p className="mt-3 text-[15px] leading-relaxed text-pretty text-night-ink-soft">{fact.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
