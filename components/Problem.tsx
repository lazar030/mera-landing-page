import { copy } from '@/content'

/** The pain as one editorial statement. */
export function Problem() {
  const { problem } = copy
  return (
    <section className="mx-auto max-w-page px-6 pt-22 pb-6">
      <p className="max-w-[960px] text-[clamp(26px,3.4vw,42px)] leading-[1.18] font-semibold tracking-[-0.03em] text-pretty">
        {problem.lead} <span className="text-ink-muted">{problem.rest}</span>
      </p>
    </section>
  )
}
