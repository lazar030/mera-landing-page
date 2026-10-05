import { copy } from '@/content'
import { LINKS } from '@/lib/links'
import { Wordmark } from './Wordmark'
import { ButtonLink } from './ButtonLink'

const navLink = 'rounded-lg px-3 py-1.5 text-sm font-medium text-ink-soft transition-colors hover:bg-surface hover:text-ink'

/** Sticky top bar. Section links hide below sm; the CTA always stays visible. */
export function SiteHeader() {
  const { nav } = copy
  return (
    <header className="sticky top-0 z-20 border-b border-line bg-app/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-page items-center justify-between gap-4 px-6">
        <a href="#" aria-label="Mera">
          <Wordmark />
        </a>
        <nav className="flex items-center gap-1">
          <a href={LINKS.how} className={navLink + ' hidden md:block'}>{nav.how}</a>
          <a href={LINKS.features} className={navLink + ' hidden md:block'}>{nav.features}</a>
          <a href={LINKS.pricing} className={navLink + ' hidden md:block'}>{nav.pricing}</a>
          <a href={LINKS.login} className={navLink + ' hidden text-ink sm:block'}>{nav.login}</a>
          <ButtonLink href={LINKS.signup} size="sm" className="ml-1.5">{nav.cta}</ButtonLink>
        </nav>
      </div>
    </header>
  )
}
