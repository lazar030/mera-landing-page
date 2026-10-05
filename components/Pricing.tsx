import { copy } from '@/content'
import { LINKS } from '@/lib/links'
import type { PricingPlan } from '@/interface'
import { SectionHeading } from './SectionHeading'
import { ButtonLink } from './ButtonLink'

/** Plan cards — same plans and prices as the admin subscription page. */
export function Pricing() {
  const { pricing } = copy
  return (
    <section id="cene" className="mx-auto max-w-page scroll-mt-16 px-6 py-24">
      <SectionHeading eyebrow={pricing.eyebrow} title={pricing.title} />
      <p className="mt-3.5 text-[17px] text-ink-soft">{pricing.lead}</p>
      <div className="mt-11 grid gap-5 md:grid-cols-3">
        {pricing.plans.map((plan) => (
          <PlanCard key={plan.name} plan={plan} cta={pricing.choose} />
        ))}
      </div>
    </section>
  )
}

function PlanCard({ plan, cta }: { plan: PricingPlan; cta: string }) {
  return (
    <div
      className={
        'flex flex-col gap-4.5 rounded-2xl p-7 ' +
        (plan.featured ? 'border-[1.5px] border-brand bg-surface' : 'border border-line bg-app')
      }
    >
      <div className="flex items-center justify-between gap-2.5">
        <span className="text-[15px] font-semibold">{plan.name}</span>
        {plan.badge && (
          <span className="rounded-full bg-brand px-2.5 py-0.5 text-[11px] font-semibold tracking-[0.04em] text-white">
            {plan.badge}
          </span>
        )}
      </div>
      <p className="flex items-baseline gap-1.5">
        <span className="text-[40px] font-bold tracking-[-0.03em]">{plan.price}</span>
        <span className="text-sm text-ink-soft">{plan.period}</span>
      </p>
      <p className="text-sm leading-relaxed text-ink-soft">{plan.body}</p>
      <ButtonLink href={LINKS.signup} size="sm" variant={plan.featured ? 'primary' : 'secondary'} className="mt-auto w-full">
        {cta}
      </ButtonLink>
    </div>
  )
}
