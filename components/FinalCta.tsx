import { copy } from '@/content'
import { LINKS } from '@/lib/links'
import { ButtonLink } from './ButtonLink'

/** Closing sign-up block; also the target of every "Probaj besplatno" anchor. */
export function FinalCta() {
  const { finalCta } = copy
  return (
    <section id="start" className="scroll-mt-16 px-6 pb-24">
      <div className="mx-auto flex max-w-[1152px] flex-wrap items-center justify-between gap-7 rounded-3xl bg-brand px-6 py-12 sm:px-10 sm:py-16 text-white">
        <div className="max-w-[560px]">
          <h2 className="text-[clamp(28px,3.4vw,42px)] leading-[1.08] font-bold tracking-[-0.03em] text-balance">
            {finalCta.title}
          </h2>
          <p className="mt-3 text-[17px]">{finalCta.body}</p>
        </div>
        <ButtonLink href={LINKS.signup} variant="inverse" className="h-13 rounded-xl px-6.5 text-base">
          {finalCta.cta}
        </ButtonLink>
      </div>
    </section>
  )
}
