import { copy } from '@/content'
import { LINKS } from '@/lib/links'

/** Heading + contact on the left, native <details> list on the right. */
export function Faq() {
  const { faq } = copy
  return (
    <section className="border-t border-line">
      <div className="mx-auto grid max-w-page items-start gap-x-20 gap-y-10 px-6 py-26 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
        <div>
          <h2 className="text-[clamp(32px,4vw,52px)] leading-[1.02] font-bold tracking-[-0.04em]">{faq.title}</h2>
          <p className="mt-4 max-w-[320px] text-[15px] leading-relaxed text-ink-soft">
            {faq.aside}{' '}
            <a href={LINKS.contact} className="font-semibold text-brand underline underline-offset-[3px] hover:text-brand-strong">
              {faq.contact}
            </a>{' '}
            {faq.contactSuffix}
          </p>
        </div>
        <div className="border-t border-line">
          {faq.items.map((item) => (
            <details key={item.title} className="group border-b border-line">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-5.5 text-[17px] font-semibold">
                {item.title}
                <span
                  aria-hidden
                  className="flex size-7 flex-none items-center justify-center rounded-full border border-line-warm font-normal text-brand transition-transform group-open:rotate-45"
                >
                  +
                </span>
              </summary>
              <p className="max-w-[560px] pb-5.5 text-[15px] leading-relaxed text-ink-soft">{item.body}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  )
}
