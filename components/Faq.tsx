import { copy } from '@/content'

/** FAQ as native <details> — accessible and JS-free. */
export function Faq() {
  const { faq } = copy
  return (
    <section className="border-t border-line">
      <div className="mx-auto max-w-[820px] px-6 py-24">
        <h2 className="text-[clamp(28px,3.2vw,38px)] font-bold tracking-[-0.03em]">{faq.title}</h2>
        <div className="mt-8 border-t border-line">
          {faq.items.map((item) => (
            <details key={item.title} className="group border-b border-line">
              <summary className="flex cursor-pointer list-none justify-between gap-4 py-5 text-[17px] font-semibold">
                {item.title}
                <span aria-hidden className="font-normal text-brand transition-transform group-open:rotate-45">+</span>
              </summary>
              <p className="pb-5 text-[15px] leading-relaxed text-ink-soft">{item.body}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  )
}
