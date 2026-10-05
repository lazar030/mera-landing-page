import { copy } from '@/content'
import { LINKS } from '@/lib/links'
import { Wordmark } from './Wordmark'

const navLink = 'rounded-lg px-3 py-2 text-sm font-medium text-ink-soft transition-colors hover:bg-surface hover:text-ink'

/** Sticky top bar. Section links collapse below md, login below sm; the CTA always stays. */
export function SiteHeader() {
  const { nav } = copy
  return (
    <header className="sticky top-0 z-20 border-b border-line bg-app/85 backdrop-blur-md backdrop-saturate-150">
      <div className="mx-auto flex h-16 max-w-page items-center justify-between gap-4 px-6">
        <a href="#" aria-label="Mera">
          <Wordmark />
        </a>
        <nav className="flex items-center gap-0.5">
          <a href={LINKS.how} className={navLink + ' hidden md:block'}>{nav.how}</a>
          <a href={LINKS.features} className={navLink + ' hidden md:block'}>{nav.features}</a>
          <a href={LINKS.pricing} className={navLink + ' hidden md:block'}>{nav.pricing}</a>
          <span aria-hidden className="mx-2 hidden h-5 w-px bg-line md:block" />
          <a href={LINKS.login} className={navLink + ' hidden text-ink sm:block'}>{nav.login}</a>
          <a
            href={LINKS.signup}
            className="ml-1 rounded-[9px] bg-ink px-4 py-2.5 text-sm font-semibold text-app transition-colors hover:bg-brand"
          >
            {nav.cta}
          </a>
        </nav>
      </div>
    </header>
  )
}
