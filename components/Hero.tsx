import { copy } from '@/content'
import { LINKS } from '@/lib/links'
import { ButtonLink } from './ButtonLink'
import { WallDemo } from './WallDemo'

/** Headline, value proposition and CTAs, next to the live wall-fit demo. */
export function Hero() {
  const { hero } = copy
  return (
    <section className="mx-auto grid max-w-page items-center gap-14 px-6 pt-18 pb-22 lg:grid-cols-2">
      <div>
        <span className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3 py-1.5 text-[13px] font-medium text-ink-soft">
          <span className="size-1.5 rounded-full bg-brand" />
          {hero.eyebrow}
        </span>
        <h1 className="mt-5.5 text-[clamp(40px,5.4vw,64px)] leading-[1.02] font-bold tracking-[-0.035em] text-balance">
          {hero.headline}
        </h1>
        <p className="mt-5.5 max-w-[520px] text-[19px] leading-[1.55] text-pretty text-ink-soft">{hero.lead}</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <ButtonLink href={LINKS.signup}>{hero.primaryCta}</ButtonLink>
          <ButtonLink href={LINKS.how} variant="secondary">{hero.secondaryCta}</ButtonLink>
        </div>
        <p className="mt-4 text-[13px] text-ink-soft">{hero.note}</p>
      </div>
      <WallDemo />
    </section>
  )
}
