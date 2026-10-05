import { copy } from '@/content'

/** The pain, stated in one line — sets up everything below. */
export function Problem() {
  const { problem } = copy
  return (
    <section className="border-y border-line bg-surface">
      <div className="mx-auto grid max-w-page items-center gap-x-14 gap-y-6 px-6 py-14 md:grid-cols-2">
        <p className="text-[clamp(26px,3vw,34px)] leading-[1.15] font-semibold tracking-[-0.025em] text-balance">
          {problem.title}
        </p>
        <p className="text-[17px] leading-relaxed text-pretty text-ink-soft">{problem.body}</p>
      </div>
    </section>
  )
}
