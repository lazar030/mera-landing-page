'use client'

import { useState, type FormEvent } from 'react'
import { copy } from '@/content'
import { requestSignup } from '@/lib/signup'

/** Closing sign-up block with an inline email form; target of every "Probaj besplatno". */
export function FinalCta() {
  const { finalCta } = copy
  const [sent, setSent] = useState(false)
  const [pending, setPending] = useState(false)

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const email = String(new FormData(e.currentTarget).get('email') ?? '')
    setPending(true)
    try {
      await requestSignup(email)
      setSent(true)
    } finally {
      setPending(false)
    }
  }

  return (
    <section id="start" className="scroll-mt-16 px-6 pb-26">
      <div className="relative mx-auto grid max-w-[1152px] items-center gap-x-12 gap-y-8 overflow-hidden rounded-[28px] bg-brand px-[clamp(24px,5vw,64px)] py-[clamp(40px,6vw,72px)] text-white lg:grid-cols-2">
        <div aria-hidden className="cta-grid pointer-events-none absolute inset-0" />
        <div className="relative">
          <h2 className="text-[clamp(32px,4.2vw,54px)] leading-none font-bold tracking-[-0.04em] text-balance">{finalCta.title}</h2>
          <p className="mt-3.5 text-[17px] leading-[1.55]">{finalCta.body}</p>
        </div>
        <div className="relative">
          {sent ? (
            <p role="status" className="rounded-[14px] bg-app px-5 py-4.5 text-[15px] font-medium text-ink">{finalCta.success}</p>
          ) : (
            <form onSubmit={onSubmit} className="flex flex-col gap-2.5">
              <div className="flex flex-wrap gap-2 rounded-[14px] bg-app p-1.5">
                <input
                  type="email"
                  name="email"
                  required
                  autoComplete="email"
                  placeholder={finalCta.emailPlaceholder}
                  aria-label={finalCta.emailLabel}
                  className="h-[46px] min-w-45 flex-1 bg-transparent px-3 text-[15px] text-ink outline-none"
                />
                <button
                  type="submit"
                  disabled={pending}
                  className="h-[46px] cursor-pointer rounded-[10px] bg-brand px-5 text-[15px] font-semibold text-app transition-colors hover:bg-brand-strong disabled:opacity-60"
                >
                  {finalCta.submit}
                </button>
              </div>
              <p className="text-[13px]">{finalCta.hint}</p>
            </form>
          )}
        </div>
      </div>
    </section>
  )
}
