import { copy } from '@/content'
import { LINKS } from '@/lib/links'
import { ButtonLink } from './ButtonLink'
import { Check } from './Check'
import { WallDemo } from './WallDemo'

/** Headline, value proposition and CTAs over millimetre paper, next to the live demo. */
export function Hero() {
  const { hero } = copy
  return (
    <section className="relative border-b border-line">
      <div aria-hidden className="mm-grid pointer-events-none absolute inset-0" />
      <div className="relative mx-auto grid max-w-page items-center gap-x-16 gap-y-14 px-6 pt-20 pb-24 lg:grid-cols-2">
        <div>
          <p className="flex items-center gap-2.5 font-mono text-xs font-medium tracking-[0.04em] text-ink-soft uppercase">
            <span aria-hidden className="h-px w-4.5 bg-brand" />
            {hero.eyebrow}
          </p>
          <h1 className="mt-5 text-[clamp(44px,6vw,76px)] leading-[0.98] font-bold tracking-[-0.045em] text-balance">
            {hero.headline}
          </h1>
          <p className="mt-6 max-w-[500px] text-[clamp(17px,1.5vw,19px)] leading-[1.55] text-pretty text-ink-soft">
            {hero.lead}
          </p>
          <div className="mt-8.5 flex flex-wrap gap-3">
            <ButtonLink
              href={LINKS.signup}
              className="h-[50px] gap-2.5 rounded-[11px] shadow-[inset_0_1px_0_rgb(255_255_255/0.18),0_8px_20px_-10px_rgb(111_68_35/0.7)]"
            >
              {hero.primaryCta}
              <span aria-hidden>→</span>
            </ButtonLink>
            <ButtonLink href={LINKS.how} variant="secondary" className="h-[50px] rounded-[11px] font-medium">
              {hero.secondaryCta}
            </ButtonLink>
          </div>
          <div className="mt-5.5 flex flex-wrap gap-x-5 gap-y-2 text-[13px] text-ink-soft">
            {hero.perks.map((perk) => (
              <Check key={perk}>{perk}</Check>
            ))}
          </div>
        </div>
        <WallDemo />
      </div>
    </section>
  )
}
