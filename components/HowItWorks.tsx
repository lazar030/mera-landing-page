import { copy } from '@/content'
import { SectionHeading } from './SectionHeading'

/** Three numbered steps: measure → calculate → quote. */
export function HowItWorks() {
  const { how } = copy
  return (
    <section id="kako" className="mx-auto max-w-page scroll-mt-16 px-6 py-24">
      <SectionHeading eyebrow={how.eyebrow} title={how.title} />
      <ol className="mt-12 grid gap-5 md:grid-cols-3">
        {how.steps.map((step, i) => (
          <li key={step.title} className="rounded-2xl border border-line bg-app p-7">
            <span className="font-mono text-sm text-brand">{String(i + 1).padStart(2, '0')}</span>
            <h3 className="mt-4.5 text-[21px] font-semibold tracking-[-0.02em]">{step.title}</h3>
            <p className="mt-2.5 text-[15px] leading-relaxed text-pretty text-ink-soft">{step.body}</p>
          </li>
        ))}
      </ol>
    </section>
  )
}
