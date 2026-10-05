import { copy } from '@/content'
import { LINKS } from '@/lib/links'
import type { PricingPlan } from '@/interface'
import { SectionHeading } from './SectionHeading'
import { Check } from './Check'

/** Plan cards (same plans as the admin subscription page) + what every plan includes. */
export function Pricing() {
  const { pricing } = copy
  return (
    <section id="cene" className="mx-auto max-w-page scroll-mt-16 px-6 py-26">
      <SectionHeading eyebrow={pricing.eyebrow} title={pricing.title} center />
      <p className="mx-auto mt-3.5 max-w-[480px] text-center text-[17px] leading-[1.55] text-ink-soft">{pricing.lead}</p>
      <div className="mx-auto mt-12 grid max-w-[1040px] gap-4 md:grid-cols-3">
        {pricing.plans.map((plan) => (
          <PlanCard key={plan.name} plan={plan} cta={pricing.cta} />
        ))}
      </div>
      <div className="mx-auto mt-7 flex max-w-[1040px] flex-wrap items-center gap-x-7 gap-y-2.5 rounded-[14px] bg-surface px-6 py-5 text-sm">
        <span className="font-semibold">{pricing.includedTitle}</span>
        {pricing.included.map((item) => (
          <Check key={item}>{item}</Check>
        ))}
      </div>
    </section>
  )
}

function PlanCard({ plan, cta }: { plan: PricingPlan; cta: string }) {
  const dark = plan.featured
  return (
    <div
      className={
        'flex flex-col rounded-[18px] p-7 ' +
        (dark ? 'bg-ink text-night-ink shadow-[0_30px_60px_-30px_rgb(42_32_24/0.6)]' : 'border border-line bg-app')
      }
    >
      <div className="flex items-center justify-between gap-2.5">
        <span className="text-[15px] font-semibold">{plan.name}</span>
        {plan.badge && (
          <span className="rounded-full bg-brand px-2.5 py-1 text-[11px] font-semibold tracking-[0.04em] text-white">{plan.badge}</span>
        )}
      </div>
      <p className="mt-4 flex items-baseline gap-1.5">
        <span className={'text-[46px] font-bold tracking-[-0.04em] ' + (dark ? 'text-app' : '')}>{plan.price}</span>
        <span className={'text-sm ' + (dark ? 'text-night-ink-soft' : 'text-ink-soft')}>{plan.period}</span>
      </p>
      <p className={'mt-3 mb-6 text-sm leading-[1.55] ' + (dark ? 'text-night-ink-soft' : 'text-ink-soft')}>{plan.body}</p>
      <a
        href={LINKS.signup}
        className={
          'mt-auto flex justify-center rounded-[10px] py-3 text-sm font-semibold transition-colors ' +
          (dark ? 'bg-brand text-white hover:bg-oak' : 'border border-line-strong text-ink hover:bg-surface')
        }
      >
        {cta}
      </a>
    </div>
  )
}
