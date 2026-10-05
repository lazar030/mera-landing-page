import { copy } from '@/content'

/** The core promise on a dark band, backed by three engine guarantees. */
export function PromiseBand() {
  const { promise } = copy
  return (
    <section className="bg-night text-night-ink">
      <div className="mx-auto max-w-page px-6 py-26">
        <h2 className="max-w-[820px] text-[clamp(32px,4.4vw,56px)] leading-[1.04] font-bold tracking-[-0.035em] text-balance">
          {promise.title}
        </h2>
        <div className="mt-14 grid gap-8 md:grid-cols-3">
          {promise.facts.map((fact) => (
            <div key={fact.title} className="border-t border-night-line pt-5">
              <p className="font-mono text-[28px] text-oak">{fact.title}</p>
              <p className="mt-2.5 text-[15px] leading-relaxed text-pretty text-night-ink-soft">{fact.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
